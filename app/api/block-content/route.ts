import { xai } from '@ai-sdk/xai'
import { streamObject } from 'ai'
import { blockContentSchema, aiRequestSchema } from '../schema'
import { blockConfigs } from '@/lib/prompt-config'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  console.log("[block-content] Received POST request");
  // Parse the request body as JSON first
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("[block-content] Failed to parse request body:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }
  console.log("[block-content] Parsed request body:", body);

  // Now validate the parsed body using the correct input schema
  const validatedRequest = await aiRequestSchema.safeParseAsync(body);
  if (!validatedRequest.success) {
    console.error("[block-content] Invalid request data:", validatedRequest.error.flatten());
    return new Response(JSON.stringify({ error: "Invalid request data", details: validatedRequest.error.flatten() }), { status: 400 });
  }
  console.log("[block-content] Validated request data:", validatedRequest.data);

  // Destructure the validated data
  const { blockType, blockLabel, userPrompt, existingContent, systemPrompt, selectedModel } = validatedRequest.data;
  const blockTemplate = blockConfigs[blockType]

  if (!blockTemplate) {
      console.error(`[block-content] Block config not found for type: ${blockType}`);
      return new Response(JSON.stringify({ error: `Configuration for block type '${blockType}' not found.` }), { status: 400 });
  }
  console.log(`[block-content] Found config for block type: ${blockType}`);

  const isEnhancement = !!existingContent?.trim()
  console.log(`[block-content] Processing request for block: ${blockLabel} (${blockType}), Enhancement: ${isEnhancement}, Model: ${selectedModel || 'default'}`);

  const finalSystemPrompt = `${systemPrompt || "You are an AI assistant helping to generate high-quality content."}
    
Your task is to ${isEnhancement ? "enhance" : "create"} content for an AI prompt builder, specifically for the ${blockTemplate.title}.

Block Purpose:
${blockTemplate.description}

Best Practices for ${blockTemplate.title}:
${blockTemplate.bestPractices.map(practice => `- ${practice}`).join('\n')}

Example Content:
${blockTemplate.examples.map(example => `- ${example}`).join('\n')}

Guidelines:
- Focus on clarity, specificity, and effectiveness
- Use appropriate formatting and structure
- Consider the context and purpose of the ${blockType} block
- Ensure the content follows best practices for AI prompts
${isEnhancement ? "- Maintain the original intent while improving quality" : "- Create content that is immediately usable"}
- Provide clear instructions and necessary context
- Follow the demonstrated examples while maintaining originality
- Adapt the content to the user's specific needs`

  const prompt = isEnhancement
    ? `Enhance the following ${blockTemplate.title} content for an AI prompt builder:
       
       ORIGINAL CONTENT:
       ${existingContent}
       
       USER REQUEST:
       ${userPrompt}
       
       Improve this content while maintaining its core purpose and intent.
       Focus on making it more effective, clear, and comprehensive.
       Ensure it follows the best practices for ${blockTemplate.title}.`
    : `Generate high-quality content for the "${blockTemplate.title}" section of an AI prompt.
       
       USER REQUEST:
       ${userPrompt}
       
       Create content that will be effective in a well-structured AI prompt.
       The content should be immediately usable and follow the provided best practices.
       Consider the example formats while creating unique content.`

  // --- DEBUG LOG --- 
  console.log("[block-content] Constructed Prompts for AI:", { finalSystemPrompt, prompt });
  // --- END DEBUG LOG ---

  try {
      console.log(`[block-content] Initiating AI call with model: ${selectedModel || 'grok-3-mini'}`);
      const result = streamObject({
          model: xai(selectedModel || 'grok-3-mini'),
          schema: blockContentSchema,
          prompt,
          system: finalSystemPrompt,
          temperature: 0.7,
      })

      console.log("[block-content] AI call successful, streaming response.");
      return result.toTextStreamResponse()
  } catch (error) {
      console.error("[block-content] Error calling AI model:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: "Failed to generate content", details: errorMessage }), { status: 500 });
  }
} 