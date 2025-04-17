import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import type { PromptBlock, PromptTemplate } from '@/types/prompt-types'
import { promptTemplates } from '@/lib/prompt-config'

interface PromptState {
  blocks: PromptBlock[]
  activeTemplate: string
  isLoading: boolean
  
  // Actions
  initializeFromTemplate: (templateId: string) => void
  loadInitialData: (templateId: string, blocks: PromptBlock[]) => void
  loadSavedPrompt: (template: PromptTemplate) => void
  loadFromHistory: (templateId: string, blocks: PromptBlock[]) => void
  updateBlock: (index: number, content: string) => void
  toggleBlock: (index: number) => void
  setActiveTemplate: (templateId: string) => void
  setIsLoading: (loading: boolean) => void
}

export const usePromptStore = create<PromptState>((
  set: (partial: Partial<PromptState> | ((state: PromptState) => Partial<PromptState>)) => void,
  get: () => PromptState
) => ({
  blocks: [],
  activeTemplate: 'general',
  isLoading: false,

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  initializeFromTemplate: (templateId: string) => {
    set({ isLoading: true })
    const template = promptTemplates.find(t => t.id === templateId)
    if (template) {
      set({
        activeTemplate: templateId,
        blocks: template.blocks.map(block => ({
          ...block,
          content: '',
          enabled: !block.label.includes('(Optional)')
        })),
        isLoading: false
      })
    } else {
      set({ isLoading: false })
    }
  },

  loadInitialData: (templateId: string, blocks: PromptBlock[]) => {
    set({ isLoading: true })
    set({
      activeTemplate: templateId,
      blocks: blocks,
      isLoading: false
    })
  },

  loadSavedPrompt: (template: PromptTemplate) => {
    set({ isLoading: true })
    set({
      activeTemplate: template.id,
      blocks: template.blocks,
      isLoading: false
    })
  },

  loadFromHistory: (templateId: string, blocks: PromptBlock[]) => {
    set({ isLoading: true })
    set({
      activeTemplate: templateId,
      blocks: blocks,
      isLoading: false
    })
  },

  updateBlock: (index: number, content: string) => {
    const blocks = [...get().blocks]
    blocks[index] = { ...blocks[index], content }
    set({ blocks })
  },

  toggleBlock: (index: number) => {
    const blocks = [...get().blocks]
    blocks[index] = { ...blocks[index], enabled: !blocks[index].enabled }
    set({ blocks })
  },

  setActiveTemplate: (templateId: string) => {
    set({ isLoading: true })
    const template = promptTemplates.find(t => t.id === templateId)
    if (template) {
      set({
        activeTemplate: templateId,
        blocks: template.blocks.map(block => ({
          ...block,
          content: '',
          enabled: !block.label.includes('(Optional)')
        })),
        isLoading: false
      })
    } else {
      set({ isLoading: false })
    }
  }
})) 