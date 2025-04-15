import type { PromptBlock } from "@/types/prompt-types"

export interface PromptTemplate {
  id: string
  name: string
  description: string
  blocks: PromptBlock[]
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: "general",
    name: "General Purpose",
    description: "A versatile template for most AI prompting needs",
    blocks: [
      {
        type: "context",
        label: "Context",
        content: "",
        placeholder: "Provide background information and context for the AI...",
        description:
          "Set the stage with relevant background information. This helps the AI understand the broader context of your request.",
        enabled: true,
      },
      {
        type: "role",
        label: "Role",
        content: "",
        placeholder: "Define the role you want the AI to assume...",
        description:
          "Specify the persona or role the AI should adopt when responding. This shapes the tone, expertise level, and perspective.",
        enabled: true,
      },
      {
        type: "task",
        label: "Task",
        content: "",
        placeholder: "Clearly describe what you want the AI to do...",
        description:
          "Clearly articulate the specific task or question you want the AI to address. Be precise about your expectations.",
        enabled: true,
      },
      {
        type: "examples",
        label: "Examples",
        content: "",
        placeholder: "Provide examples of good and bad responses...",
        description:
          "Include examples of what good and bad responses look like. This calibrates the AI's understanding of your expectations.",
        enabled: true,
      },
      {
        type: "constraints",
        label: "Constraints",
        content: "",
        placeholder: "List any limitations or boundaries...",
        description:
          "Specify any constraints or limitations the AI should adhere to, such as word count, format restrictions, or topics to avoid.",
        enabled: true,
      },
      {
        type: "format",
        label: "Output Format",
        content: "",
        placeholder: "Specify how you want the response formatted...",
        description:
          "Define the structure and format of the desired output, such as bullet points, paragraphs, or specific sections.",
        enabled: true,
      },
    ],
  },
  {
    id: "reasoning",
    name: "Complex Reasoning",
    description: "Optimized for problem-solving and analytical tasks",
    blocks: [
      {
        type: "context",
        label: "Problem Statement",
        content: "",
        placeholder: "Describe the problem or scenario in detail...",
        description: "Provide a comprehensive description of the problem that needs to be solved or analyzed.",
        enabled: true,
      },
      {
        type: "role",
        label: "Expert Role",
        content: "You are an expert problem solver with deep analytical skills and domain knowledge.",
        placeholder: "Define the expert role the AI should assume...",
        description: "Specify the type of expert the AI should emulate, including their background and expertise.",
        enabled: true,
      },
      {
        type: "task",
        label: "Reasoning Task",
        content:
          "Analyze this problem step by step. Identify key factors, consider multiple approaches, and provide a well-reasoned solution.",
        placeholder: "Describe the analytical process you want the AI to follow...",
        description:
          "Detail the reasoning process you want the AI to demonstrate, including any specific analytical frameworks.",
        enabled: true,
      },
      {
        type: "constraints",
        label: "Constraints",
        content: "Show your work explicitly. Consider edge cases and limitations of your approach.",
        placeholder: "List any constraints on the reasoning process...",
        description:
          "Specify any limitations or requirements for the reasoning process, such as showing work or considering certain factors.",
        enabled: true,
      },
      {
        type: "format",
        label: "Output Format",
        content:
          "1. Problem Analysis\n2. Key Factors\n3. Possible Approaches\n4. Recommended Solution\n5. Implementation Steps\n6. Potential Challenges",
        placeholder: "Specify the structure for the analytical response...",
        description:
          "Define the structure for the analytical response, including sections for analysis, approaches, and recommendations.",
        enabled: true,
      },
    ],
  },
  {
    id: "creative",
    name: "Creative Writing",
    description: "For storytelling, content creation, and creative tasks",
    blocks: [
      {
        type: "context",
        label: "Creative Brief",
        content: "",
        placeholder: "Describe the creative project and its goals...",
        description:
          "Provide background information about the creative project, including its purpose, audience, and goals.",
        enabled: true,
      },
      {
        type: "persona",
        label: "Creative Persona",
        content: "You are a skilled creative writer with expertise in crafting engaging and original content.",
        placeholder: "Define the creative persona for the AI...",
        description:
          "Specify the type of creative professional the AI should emulate, such as a novelist, copywriter, or poet.",
        enabled: true,
      },
      {
        type: "task",
        label: "Creative Task",
        content: "",
        placeholder: "Describe what you want the AI to create...",
        description:
          "Detail the specific creative output you want, such as a story, poem, advertisement, or other content.",
        enabled: true,
      },
      {
        type: "examples",
        label: "Style Examples",
        content: "",
        placeholder: "Provide examples of the style, tone, or voice you want...",
        description: "Include examples that demonstrate the desired style, tone, and voice for the creative output.",
        enabled: true,
      },
      {
        type: "constraints",
        label: "Creative Constraints",
        content: "",
        placeholder: "List any creative limitations or requirements...",
        description:
          "Specify any constraints that should guide the creative process, such as word count, themes, or elements to include/avoid.",
        enabled: true,
      },
      {
        type: "format",
        label: "Output Format",
        content: "",
        placeholder: "Specify the format for the creative output...",
        description: "Define the structure and format for the creative output, such as chapters, stanzas, or sections.",
        enabled: true,
      },
    ],
  },
  {
    id: "technical",
    name: "Technical Documentation",
    description: "For creating technical guides, documentation, and explanations",
    blocks: [
      {
        type: "context",
        label: "Technical Context",
        content: "",
        placeholder: "Describe the technical subject and its background...",
        description:
          "Provide background information about the technical subject, including its purpose, audience, and relevance.",
        enabled: true,
      },
      {
        type: "role",
        label: "Technical Expert",
        content:
          "You are a technical expert with deep knowledge of the subject matter and experience creating clear documentation.",
        placeholder: "Define the technical role for the AI...",
        description:
          "Specify the type of technical expert the AI should emulate, such as a developer, engineer, or technical writer.",
        enabled: true,
      },
      {
        type: "task",
        label: "Documentation Task",
        content: "",
        placeholder: "Describe what technical content you need...",
        description:
          "Detail the specific technical documentation you want, such as a guide, reference, or explanation.",
        enabled: true,
      },
      {
        type: "examples",
        label: "Documentation Examples",
        content: "",
        placeholder: "Provide examples of good technical documentation...",
        description:
          "Include examples that demonstrate the desired style and level of detail for the technical documentation.",
        enabled: true,
      },
      {
        type: "constraints",
        label: "Technical Constraints",
        content: "Use precise terminology. Include code examples where appropriate. Explain complex concepts clearly.",
        placeholder: "List any technical requirements or limitations...",
        description:
          "Specify any constraints that should guide the documentation, such as terminology, format, or level of detail.",
        enabled: true,
      },
      {
        type: "format",
        label: "Documentation Format",
        content:
          "1. Overview\n2. Prerequisites\n3. Step-by-step Instructions\n4. Code Examples\n5. Troubleshooting\n6. References",
        placeholder: "Specify the structure for the technical documentation...",
        description:
          "Define the structure for the technical documentation, including sections for overview, instructions, and examples.",
        enabled: true,
      },
    ],
  },
]
