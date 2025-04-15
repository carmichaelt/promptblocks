"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateBlockContent(
  blockType: string,
  blockLabel: string,
  userPrompt: string,
  existingContent?: string,
) {
  try {
    const isEnhancement = !!existingContent?.trim()

    const prompt = isEnhancement
      ? `Enhance the following ${blockType} content for an AI prompt builder. Make it more effective, clear, and comprehensive while maintaining its original intent:
         
         ORIGINAL CONTENT:
         ${existingContent}
         
         USER GUIDANCE:
         ${userPrompt || "Improve this content while maintaining its purpose."}`
      : `Generate high-quality content for the "${blockLabel}" section of an AI prompt. This is for the "${blockType}" component of a structured prompt.
         
         USER REQUEST:
         ${userPrompt}
         
         Create content that would be effective in a well-structured AI prompt. Be specific, clear, and concise.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("Error generating content:", error)
    return {
      success: false,
      content: "Failed to generate content. Please try again.",
    }
  }
}
