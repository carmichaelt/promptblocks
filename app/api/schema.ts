import { z } from 'zod';

// Define a schema for block content generation
export const blockContentSchema = z.object({
  content: z.string().describe('Generated content for the block'),
  metadata: z.object({
    blockType: z.string(),
    isEnhancement: z.boolean(),
    timestamp: z.string(),
    quality: z.number().min(0).max(1).describe('Quality score of the generated content'),
    suggestions: z.array(z.string()).describe('Suggestions for further improvements')
  })
});

export type BlockContent = z.infer<typeof blockContentSchema>; 

export const aiRequestSchema = z.object({
  blockType: z.string(),
  blockLabel: z.string(),
  userPrompt: z.string(),
  existingContent: z.string().optional(),
  systemPrompt: z.string().optional(),
  selectedModel: z.string().optional(),
});

export type AIRequest = z.infer<typeof aiRequestSchema>;


export const GenerateAllBlocksRequestSchema = z.object({
  userPrompt: z.string(),
  templateId: z.string(),
  systemPrompt: z.string().optional(),
  selectedModel: z.string().optional(),
});

export type GenerateAllBlocksRequest = z.infer<typeof GenerateAllBlocksRequestSchema>;

// Schema for the response of the all-blocks endpoint
export const AllBlocksContentSchema = z.object({
  generatedBlocks: z.record(z.string().describe("The type of the block (e.g., 'persona', 'task')"), z.string().describe("The generated content for the block"))
}).describe("An object containing the generated content for each requested block.");

export type AllBlocksContent = z.infer<typeof AllBlocksContentSchema>;