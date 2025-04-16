import { xai } from '@ai-sdk/xai'
import { streamObject } from 'ai'
import { GenerateAllBlocksRequestSchema, AllBlocksContentSchema } from '../schema'
import { blockConfigs, promptTemplates } from '@/lib/prompt-config'
import { z } from 'zod'
import type { PromptBlock } from '@/types/prompt-types'
import type { BlockConfig } from '@/lib/prompt-config'

// Allow streaming responses up to 60 seconds for potentially longer generation
export const maxDuration = 60

interface ValidatedBlockInfo {
  type: string
  label: string
  description: string
  bestPractices: string[]
  examples: string[]
}

export async function POST(req: Request) {
  console.log("[all-blocks] Received POST request");
  let body
  try {
    body = await req.json()
  } catch (error) {
    console.error("[all-blocks] Failed to parse request body:", error)
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 })
  }
  console.log("[all-blocks] Parsed request body:", body);

  const validatedRequest = await GenerateAllBlocksRequestSchema.safeParseAsync(body)
  if (!validatedRequest.success) {
    console.error("[all-blocks] Invalid request data:", validatedRequest.error.flatten())
    return new Response(JSON.stringify({ error: "Invalid request data", details: validatedRequest.error.flatten() }), {
      status: 400,
    })
  }
  console.log("[all-blocks] Validated request data:", validatedRequest.data);

  const { userPrompt, templateId, systemPrompt, selectedModel } = validatedRequest.data
  console.log(`[all-blocks] Processing goal: "${userPrompt}" for template: ${templateId} using model: ${selectedModel || 'default'}`);

  // Find the selected template
  const template = promptTemplates.find((t) => t.id === templateId)
  if (!template) {
    console.error(`[all-blocks] Template not found for ID: ${templateId}`);
    return new Response(JSON.stringify({ error: "Template not found" }), { status: 404 })
  }
  console.log(`[all-blocks] Found template: ${template.name} (${template.id})`);

  // Prepare information about the blocks in the template, ensuring type safety
  const templateBlocksInfo: ValidatedBlockInfo[] = template.blocks
    .map((block: PromptBlock): ValidatedBlockInfo | null => {
      const config: BlockConfig | undefined = blockConfigs[block.type]
      if (!config) {
        console.warn(`[all-blocks] Config not found for block type: ${block.type} in template ${templateId}`);
        return null // Explicitly return null if config is missing
      }
      return {
        type: block.type,
        label: block.label,
        description: config.description,
        bestPractices: config.bestPractices,
        examples: config.examples,
      }
    })
    .filter((blockInfo): blockInfo is ValidatedBlockInfo => blockInfo !== null) // Type guard filter

  if (!templateBlocksInfo.length) {
    console.error(`[all-blocks] No valid blocks found in template: ${templateId}`);
    return new Response(JSON.stringify({ error: "No valid blocks found in the template" }), { status: 400 })
  }
  console.log(`[all-blocks] Prepared info for ${templateBlocksInfo.length} blocks:`, templateBlocksInfo.map(b => b.type));

  // Construct the system prompt using the validated block info
  const finalSystemPrompt = `
    ${systemPrompt || "You are an expert AI assistant specialized in crafting high-quality, structured AI prompts."}

    Overall Task:
    Generate content for ALL the specified blocks of an AI prompt, based on the user's overall goal or request.
    The final output should be a complete, well-structured prompt ready for use.

    User's Goal: ${userPrompt}

    Template Structure: ${template.name} (${template.description})

    Blocks to Generate Content For:
    ${templateBlocksInfo
      .map((block) => `- ${block.label} (${block.type}): ${block.description}`)
      .join("\n")}

    For each block, consider its specific purpose, best practices, and examples provided below.
    Tailor the content for each block to contribute effectively to the user's overall goal.

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
    - Ensure the content for each block aligns with the user's overall goal: "${userPrompt}".
    - Adhere to the best practices for each block type.
    - Maintain consistency in tone and style across all blocks, unless the block definition (e.g., Tone block) specifies otherwise.
    - Produce practical, usable content.
    - Output the result as a JSON object mapping block types (e.g., "persona", "task") to their generated content strings.
  `

  // Construct the user prompt for the LLM using the validated block info
  const llmPrompt = `
    Based on my goal "${userPrompt}" and the provided template structure and block details, generate content for the following blocks:
    ${templateBlocksInfo.map((block) => `- ${block.label} (${block.type})`).join("\n")}

    Return the generated content as a JSON object where keys are the block types and values are the generated strings.
  `
  // --- DEBUG LOG --- 
  console.log("[all-blocks] Constructed Prompts for AI:", { finalSystemPrompt, llmPrompt });
  // --- END DEBUG LOG ---

  try {
    console.log(`[all-blocks] Initiating AI call with model: ${selectedModel || "grok-3-mini"}`);
    const result = streamObject({
      model: xai(selectedModel || "grok-3-mini"),
      schema: AllBlocksContentSchema,
      prompt: llmPrompt,
      system: finalSystemPrompt,
      temperature: 0.7,
    })

    console.log("[all-blocks] AI call successful, streaming response.");
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[all-blocks] Error calling AI model:", error)
    // Type guard for error
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: "Failed to generate content", details: errorMessage }), {
      status: 500,
    })
  }
} 