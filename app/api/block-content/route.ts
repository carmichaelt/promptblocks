import { xai } from '@ai-sdk/xai'
import { streamObject } from 'ai'
import { blockContentSchema } from './schema'
import { blockConfigs } from '@/lib/prompt-config'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { blockType, blockLabel, userPrompt, existingContent, systemPrompt } = await req.json()
  const blockTemplate = blockConfigs[blockType]

  const isEnhancement = !!existingContent?.trim()

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

  const result = streamObject({
    model: xai('grok-3-mini'),
    schema: blockContentSchema,
    prompt,
    system: finalSystemPrompt,
    temperature: 0.7,
  })

  return result.toTextStreamResponse()
} 