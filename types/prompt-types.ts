import type React from 'react';

export interface PromptBlock {
  type: string
  label: string
  content: string
  placeholder: string
  description: string
  enabled: boolean
  bestPractices: string[]
  examples: string[]
  title: string
  defaultContent?: string
}

export interface RoleTemplate {
  id: string
  label: string
  description: string
  expertise: string[]
  systemPrompt: string
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  blocks: PromptBlock[]
  icon: React.ElementType
}
