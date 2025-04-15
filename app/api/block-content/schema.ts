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