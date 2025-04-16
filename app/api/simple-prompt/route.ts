import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { promptTemplates } from "@/lib/prompt-config"
import type { PromptTemplate, PromptBlock } from "@/types/prompt-types"
import { blockConfigs, type BlockConfig } from "@/lib/prompt-config"
import { xai } from "@ai-sdk/xai" // Import xai
import { generateObject } from "ai" // Import generateObject
import { z } from "zod" // Import zod
import { AllBlocksContentSchema } from "../schema" // Import existing schema for block content

// Define schema for template selection response
const SelectTemplateSchema = z.object({
  templateId: z.string().describe("The ID of the most suitable template based on the user's goal."),
})

// Define schema for block content generation response (using existing schema)
const GenerateBlocksSchema = AllBlocksContentSchema

// --- AI Functions using ai-sdk ---

async function selectTemplateWithAI(
  userGoal: string,
  availableTemplates: PromptTemplate[],
  model: string,
): Promise<string> {
  console.log(`[simple-prompt selectTemplateWithAI] Selecting template for goal: "${userGoal}" using model: ${model}`);

  const systemPrompt = `You are an AI assistant specialized in understanding user goals and mapping them to predefined prompt templates.
Your task is to select the single best template ID from the provided list that matches the user's goal.
Respond ONLY with the ID of the chosen template.`

  const userTemplatesInfo = availableTemplates
    .map((t) => `- ID: ${t.id}, Name: ${t.name}, Description: ${t.description}`)
    .join("\n")

  const userPrompt = `Given my goal: "${userGoal}"

Which of the following templates is the most suitable?

Available Templates:
${userTemplatesInfo}

Respond with the chosen template ID.`

  try {
    console.log(`[simple-prompt selectTemplateWithAI] Initiating AI call for template selection.`);
    const { object } = await generateObject({
      model: xai(model || "grok-3-mini"), // Use selected model or fallback
      schema: SelectTemplateSchema,
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.3, // Lower temperature for more deterministic selection
    })
    console.log(`[simple-prompt selectTemplateWithAI] AI selected template ID: ${object.templateId}`);
    // Basic validation if the returned ID exists in our config
    if (!availableTemplates.some(t => t.id === object.templateId)) {
        console.warn(`[simple-prompt selectTemplateWithAI] AI returned a template ID (${object.templateId}) not found in the available list. Falling back.`);
        // Fallback logic: return the first template ID or a default
        const fallbackId = availableTemplates[0]?.id || "general";
        console.log(`[simple-prompt selectTemplateWithAI] Falling back to template ID: ${fallbackId}`);
        return fallbackId;
    }
    return object.templateId
  } catch (error) {
    console.error("[simple-prompt selectTemplateWithAI] AI template selection failed:", error);
    // Fallback strategy: return the first template ID or a default
    console.log("[simple-prompt selectTemplateWithAI] Falling back to the first template due to error.");
    if (availableTemplates.length > 0) {
      return availableTemplates[0].id;
    }
    console.error("[simple-prompt selectTemplateWithAI] No fallback templates available after error.");
    throw new Error("AI template selection failed and no fallback templates available.");
  }
}

async function generateBlockContentWithAI(
  userGoal: string,
  template: PromptTemplate,
  model: string,
): Promise<Record<string, string>> {
  console.log(
    `[simple-prompt generateBlockContentWithAI] Generating block content for template "${template.id}" with goal: "${userGoal}" using model: ${model}`,
  );

  // Prepare block details (similar to all-blocks endpoint)
  const templateBlocksInfo = template.blocks
    .map((block: PromptBlock) => {
      const config: BlockConfig | undefined = blockConfigs[block.type]
      if (!config) return null
      return {
        type: block.type,
        label: block.label,
        description: config.description,
        bestPractices: config.bestPractices,
        examples: config.examples,
      }
    })
    .filter((info): info is NonNullable<typeof info> => info !== null)

  if (!templateBlocksInfo.length) {
    console.warn(`[simple-prompt generateBlockContentWithAI] No valid block configs found for template ${template.id}. Returning empty content.`);
    return {};
  }
  console.log(`[simple-prompt generateBlockContentWithAI] Prepared info for ${templateBlocksInfo.length} blocks.`);
    
  // Construct System Prompt (borrowing heavily from all-blocks endpoint)
  const systemPrompt = `You are an expert AI assistant specialized in crafting high-quality, structured AI prompts.
Your task is to generate content for ALL the specified blocks of an AI prompt, based on the user's overall goal.
The final output should be a structured prompt ready for use.

User's Goal: ${userGoal}

Template: ${template.name} (${template.description})

Blocks to Generate Content For:
${templateBlocksInfo.map((block) => `- ${block.label} (${block.type}): ${block.description}`).join("\n")}

For each block, consider its specific purpose, best practices, and examples provided below. Tailor the content for each block to contribute effectively to the user's overall goal.

--- BLOCK DETAILS ---
${templateBlocksInfo
  .map(
    (block) => `
Block: ${block.label} (${block.type})
Purpose: ${block.description}
Best Practices:
    ${block.bestPractices.map((p: string) => `- ${p}`).join("\n    ")}
Examples:
    ${block.examples.map((e: string) => `- ${e}`).join("\n    ")}
`,
  )
  .join("\n")}
---

Guidelines:
- Generate content for EVERY block listed in "Blocks to Generate Content For".
- Ensure the content for each block aligns with the user's overall goal: "${userGoal}".
- Adhere to the best practices for each block type.
- Maintain consistency in tone and style across all blocks, unless the block definition specifies otherwise.
- Produce practical, usable content.
- **IMPORTANT:** Output the result as a JSON object where the keys are the block **types** (e.g., "context", "task", "audience") and the values are the generated content strings.`

  // Construct User Prompt
  const llmPrompt = `Based on my goal "${userGoal}" and the provided template structure and block details, generate content for the following blocks:
${templateBlocksInfo.map((block) => `- ${block.label} (${block.type})`).join("\n")}

Return the generated content as a JSON object where keys are the block types and values are the generated strings.`

  try {
    console.log(`[simple-prompt generateBlockContentWithAI] Initiating AI call for block content.`);
    const { object } = await generateObject({
      model: xai(model || "grok-3-mini"), // Use selected model or fallback
      schema: GenerateBlocksSchema, // Use the imported schema
      prompt: llmPrompt,
      system: systemPrompt,
      temperature: 0.7,
    });
    console.log(`[simple-prompt generateBlockContentWithAI] AI generated block content successfully for template ${template.id}.`);
    // Log generated keys for quick check
    console.log(`[simple-prompt generateBlockContentWithAI] Generated content keys: ${Object.keys(object.generatedBlocks).join(', ')}`);
    return object.generatedBlocks; // Return the map directly
  } catch (error) {
    console.error(`[simple-prompt generateBlockContentWithAI] AI block content generation failed for template ${template.id}:`, error);
    // Fallback: return empty object or throw? Returning empty might be safer for the frontend.
    console.log("[simple-prompt generateBlockContentWithAI] Returning empty object for block contents due to generation error.");
    return {};
  }
}

// --- End AI Functions ---

export async function POST(request: NextRequest) {
  console.log("[simple-prompt] Received POST request");
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[simple-prompt] Failed to parse request body:", error);
    return NextResponse.json({ details: "Invalid JSON body" }, { status: 400 });
  }
  console.log("[simple-prompt] Parsed request body:", body);

  try {
    // Validate body against a simple schema
    const RequestBodySchema = z.object({
        simplePrompt: z.string().min(1, "Simple prompt cannot be empty."),
        selectedModel: z.string().min(1, "Selected model cannot be empty."),
    });
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      console.error("[simple-prompt] Invalid request data:", validationResult.error.flatten());
      return NextResponse.json({ details: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    console.log("[simple-prompt] Validated request data:", validationResult.data);

    const { simplePrompt, selectedModel } = validationResult.data;
    console.log(`[simple-prompt] Processing goal: "${simplePrompt}" using model: ${selectedModel}`);

    // 1. Select Template using AI
    console.log("[simple-prompt] Step 1: Selecting Template...");
    const selectedTemplateId = await selectTemplateWithAI(simplePrompt, promptTemplates, selectedModel);
    console.log(`[simple-prompt] Step 1 Result: Selected Template ID = ${selectedTemplateId}`);
    const selectedTemplate = promptTemplates.find((t) => t.id === selectedTemplateId);

    // This check might be redundant if selectTemplateWithAI has robust fallback, but good safety measure
    if (!selectedTemplate) {
      console.error(`[simple-prompt] CRITICAL: Selected template ID '${selectedTemplateId}' resolved, but template object not found in config.`);
      // Maybe fallback to 'general' here too?
      const fallbackTemplate = promptTemplates.find(t => t.id === 'general') || promptTemplates[0];
       if (!fallbackTemplate) {
         console.error("[simple-prompt] CRITICAL: Failed to find the selected template or any fallback template.");
         return NextResponse.json({ details: "Failed to find the selected template or any fallback template." }, { status: 500 });
       }
       console.log(`[simple-prompt] Falling back to template: ${fallbackTemplate.id} due to missing selected template object.`);
       // If falling back, we need to regenerate content for the fallback template
       console.log("[simple-prompt] Step 2 (Fallback): Generating Block Content...");
       const generatedContents = await generateBlockContentWithAI(simplePrompt, fallbackTemplate, selectedModel);
       const populatedBlocks = fallbackTemplate.blocks.map((block) => ({
           ...block,
           content: generatedContents[block.type] || block.content,
           enabled: true,
       }));
       console.log(`[simple-prompt] Responding with fallback template ${fallbackTemplate.id} and ${populatedBlocks.length} blocks.`);
       return NextResponse.json({
           templateId: fallbackTemplate.id,
           blocks: populatedBlocks,
       });
    }
    console.log(`[simple-prompt] Found template object for ID: ${selectedTemplate.id}`);

    // 2. Generate Block Content using AI
    console.log(`[simple-prompt] Step 2: Generating Block Content for template ${selectedTemplate.id}...`);
    const generatedContents = await generateBlockContentWithAI(simplePrompt, selectedTemplate, selectedModel);
    console.log(`[simple-prompt] Step 2 Result: Generated content keys: ${Object.keys(generatedContents).join(', ')}`);

    // 3. Populate Blocks with Generated Content
    console.log("[simple-prompt] Step 3: Populating Blocks...");
    const populatedBlocks: PromptBlock[] = selectedTemplate.blocks.map((block) => ({
      ...block,
      // Use generated content if available, otherwise keep the block's default content (if any)
      content: generatedContents[block.type] || block.content || "", 
      enabled: true, // Ensure all blocks are enabled by default in this flow
    }));
    console.log(`[simple-prompt] Step 3 Result: Populated ${populatedBlocks.length} blocks.`);

    // 4. Return the selected template ID and populated blocks
    console.log(`[simple-prompt] Step 4: Sending successful response with template ${selectedTemplate.id}.`);
    const responsePayload = {
      templateId: selectedTemplate.id,
      blocks: populatedBlocks,
    };
    // --- DEBUG LOG ---
    console.log("[simple-prompt] Final Response Payload:", JSON.stringify(responsePayload, null, 2)); 
    // --- END DEBUG LOG ---
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("[simple-prompt] UNHANDLED Error in POST handler:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Consider logging the specific error details for debugging
    return NextResponse.json({ details: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
} 