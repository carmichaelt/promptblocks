import type { PromptBlock, RoleTemplate } from "@/types/prompt-types"

// Block type definitions with their specific configurations
export interface BlockConfig {
  type: string
  title: string
  description: string
  bestPractices: string[]
  examples: string[]
  defaultContent?: string
  placeholder: string
}

// Template configuration
export interface PromptTemplate {
  id: string
  name: string
  description: string
  blocks: PromptBlock[]
}

// Block configurations that define the behavior and content for each block type
export const blockConfigs: Record<string, BlockConfig> = {
  persona: {
    type: "persona",
    title: "Persona Block",
    description: "Define the role or persona the AI should adopt.",
    bestPractices: [
      "Be specific about the expertise or role (e.g., 'expert software engineer', 'friendly travel agent').",
      "Clearly state the desired characteristics or perspective.",
      "Consider the knowledge level expected from this persona.",
      "Think about who the AI is imitating or acting as.",
      "Ensure the persona aligns with the task requirements."
    ],
    examples: [
      "Act as a senior marketing strategist specializing in B2B SaaS.",
      "You are a meticulous editor focusing on clarity and conciseness.",
      "Assume the persona of a historian explaining the causes of World War I.",
      "You are a helpful AI assistant designed to explain complex topics simply."
    ],
    placeholder: "Define the role, expertise level, and characteristics of the AI persona..."
  },
  context: {
    type: "context",
    title: "Context Block",
    description: "Set the stage with essential background information, situation, or input data.",
    bestPractices: [
      "Provide relevant background details the AI needs to understand the task.",
      "Include any specific input data, text, or code to be processed.",
      "Mention relevant historical or preceding information if necessary.",
      "Start broad, then narrow down to specifics relevant to the task.",
      "Include domain-specific terminology if applicable and necessary for the persona.",
      "Specify any relevant constraints or limitations not related to output format."
    ],
    examples: [
      "We are developing a mobile app for language learning targeting beginners.",
      "Here is the user feedback we received: 'The navigation is confusing...' ",
      "The project aims to reduce customer churn by 15% in the next quarter.",
      "Consider the following Python code snippet: [code snippet here]",
      "Background: Our company recently merged with a competitor."
    ],
    placeholder: "Provide relevant background information and context that the AI needs to understand your request..."
  },
  audience: {
    type: "audience",
    title: "Audience Block",
    description: "Specify the target audience for the AI's response.",
    bestPractices: [
      "Define the audience's expertise level (e.g., 'technical experts', 'general public', '5th graders').",
      "Consider their background, needs, and potential perspective.",
      "Specify the context in which the audience will receive the information.",
      "Tailor the language complexity and terminology accordingly.",
      "Think about what the audience already knows and what they need to learn."
    ],
    examples: [
      "The audience consists of non-technical stakeholders.",
      "Explain this concept to a high school student studying biology.",
      "Write for experienced software developers familiar with cloud infrastructure.",
      "The readers are potential investors with financial backgrounds.",
      "This is for internal team members who understand our project jargon."
    ],
    placeholder: "Define who will be reading or receiving this content..."
  },
  task: {
    type: "task",
    title: "Task Block",
    description: "Define the specific, actionable task or objective for the AI.",
    bestPractices: [
      "Use clear, direct, and unambiguous action verbs (e.g., 'Summarize', 'Generate', 'Analyze', 'Translate', 'Classify').",
      "Be explicit about the desired outcome or goal.",
      "Break down complex tasks into smaller, sequential steps if necessary.",
      "Clearly state what the AI should *do* with the provided context/input.",
      "Define the scope clearly – what *should* and *should not* be included."
    ],
    examples: [
      "Summarize the key findings from the provided text.",
      "Generate 5 creative taglines for the mobile app described in the context.",
      "Analyze the provided code snippet and identify potential security vulnerabilities.",
      "Translate the following paragraph from English to French.",
      "Draft an email to the target audience explaining the new feature."
    ],
    placeholder: "Clearly describe what you want the AI to do. Be specific about your expectations and desired outcome..."
  },
  tone: {
    type: "tone",
    title: "Tone Block",
    description: "Define the desired tone, style, or voice of the response.",
    bestPractices: [
      "Use descriptive adjectives (e.g., 'formal', 'informal', 'enthusiastic', 'neutral', 'humorous', 'serious', 'empathetic').",
      "Specify if a particular writing style should be adopted (e.g., 'academic', 'conversational', 'journalistic').",
      "Consider the desired emotional impact on the audience.",
      "Ensure the tone is consistent with the defined Persona and Audience.",
      "Provide examples of the desired tone if possible."
    ],
    examples: [
      "Write in a friendly, encouraging, and slightly informal tone.",
      "Adopt a formal, professional, and objective style.",
      "Use a witty and humorous voice.",
      "The tone should be empathetic and understanding.",
      "Maintain a neutral and informative tone throughout the response."
    ],
    placeholder: "Specify the desired tone, style, and voice for the response..."
  },
  format: {
    type: "format",
    title: "Format Block",
    description: "Specify the exact output structure, layout, and formatting requirements.",
    bestPractices: [
      "Be explicit about the desired format (e.g., 'JSON', 'Markdown', 'bullet points', 'table', 'email').",
      "Define clear section headers or structure if needed.",
      "Specify required fields, keys, or components (e.g., for JSON output).",
      "Include formatting examples or templates.",
      "Define markup or syntax requirements (e.g., 'Use H2 headers for sections').",
      "Specify length constraints (e.g., 'under 500 words', 'a concise paragraph')."
    ],
    examples: [
      "Format the response as a JSON object with keys 'summary' and 'action_items'.",
      "Use Markdown formatting with bullet points for the main ideas.",
      "Present the comparison in a table with columns: 'Feature', 'Pros', 'Cons'.",
      "Output should be a standard business email format.",
      "Provide the answer as a numbered list, ordered by importance."
    ],
    placeholder: "Specify how you want the response structured (e.g., bullet points, paragraphs, sections)..."
  },
  constraints: {
    type: "constraints",
    title: "Constraints Block",
    description: "Define specific rules, limitations, or requirements not covered by format.",
    bestPractices: [
      "List things the AI *should not* do or include.",
      "Specify technical limitations or requirements (e.g., 'Use only standard Python libraries').",
      "Include performance considerations if relevant.",
      "Mention any regulatory, compliance, or ethical guidelines.",
      "Define quality standards or specific keywords to include/exclude.",
      "Set boundaries on the scope if not fully covered in Task."
    ],
    examples: [
      "Do not include any personal opinions or subjective statements.",
      "The code must follow the Python PEP 8 style guide.",
      "Avoid using technical jargon where possible.",
      "Ensure the response is compliant with GDPR regulations.",
      "Limit the explanation to the core concepts, do not go into advanced details.",
      "Response must be factually accurate and verifiable."
    ],
    placeholder: "List any limitations, requirements, or specific guidelines the AI should follow..."
  },
  examples: {
    type: "examples",
    title: "Examples Block (Few-Shot)",
    description: "Provide specific input/output examples to guide the model's behavior and style through few-shot prompting.",
    bestPractices: [
      "Use clear input/output pairs that demonstrate the desired task and format.",
      "Include multiple examples (2-5) for better guidance (few-shot prompting).",
      "Ensure examples are consistent with all other instructions.",
      "Show variety if the task involves different scenarios.",
      "Include edge cases or tricky scenarios if applicable.",
      "Keep examples concise but illustrative.",
      "Format consistently (e.g., 'Input: X, Output: Y' pattern).",
      "Ensure examples align with the specified tone and audience."
    ],
    examples: [
      "Input: 'Summarize: The weather is sunny.' Output: 'Report: Clear skies.'",
      "Code: 'def add(a,b): return a+b' Analysis: 'Function `add` lacks type hints and parameter documentation.'",
      "Topic: Photosynthesis, Audience: Child. Output: 'Plants use sunlight like food to grow!'",
      "Input: 'Complex topic', Audience: Expert. Output: 'Detailed technical explanation'",
      "Input: 'Same topic', Audience: Beginner. Output: 'Simplified explanation with analogies'"
    ],
    placeholder: "Add input/output examples to guide the AI's response style and format. Use consistent patterns like 'Input: X, Output: Y'."
  }
}

// Template configurations that define different prompt structures
export const promptTemplates: PromptTemplate[] = [
  {
    id: "general",
    name: "General Purpose",
    description: "A versatile template for most AI prompting needs",
    blocks: [
      {
        ...blockConfigs.persona,
        label: "AI Persona (Optional)",
        content: "",
        enabled: false,
        placeholder: blockConfigs.persona.placeholder || "Define the AI's role...",
      },
      {
        ...blockConfigs.audience,
        label: "Target Audience (Optional)",
        content: "",
        enabled: false,
        placeholder: blockConfigs.audience.placeholder || "Describe who the response is for...",
      },
      {
        ...blockConfigs.tone,
        label: "Desired Tone (Optional)",
        content: "",
        enabled: false,
        placeholder: blockConfigs.tone.placeholder || "Specify the desired tone...",
      },
      {
        ...blockConfigs.context,
        label: "Context",
        content: "",
        enabled: true,
        placeholder: blockConfigs.context.placeholder || "",
      },
      {
        ...blockConfigs.task,
        label: "Task",
        content: "",
        enabled: true,
        placeholder: blockConfigs.task.placeholder || "",
      },
      {
        ...blockConfigs.constraints,
        label: "Constraints / Rules",
        content: "",
        enabled: true,
        placeholder: blockConfigs.constraints.placeholder || "List things to avoid or specific rules...",
      },
      {
        ...blockConfigs.format,
        label: "Output Format",
        content: "",
        enabled: true,
        placeholder: blockConfigs.format.placeholder || "Specify desired output structure...",
      },
      {
        ...blockConfigs.examples,
        label: "Examples (Few-Shot, Optional)",
        content: "",
        enabled: false,
        placeholder: blockConfigs.examples.placeholder || "Add input/output examples...",
      },
    ],
  },
  {
    id: "reasoning",
    name: "Complex Reasoning",
    description: "Optimized for problem-solving and analytical tasks",
    blocks: [
      {
        ...blockConfigs.context,
        label: "Problem Statement",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.task,
        label: "Analysis Requirements",
        content: "Please analyze this problem using the following approach:\n1. Break down the key components\n2. Identify potential solutions\n3. Evaluate trade-offs\n4. Recommend the best approach",
        enabled: true,
      },
      {
        ...blockConfigs.constraints,
        label: "Analysis Constraints",
        content: "Consider:\n- Feasibility of implementation\n- Resource limitations\n- Time constraints\n- Potential risks",
        enabled: true,
      },
      {
        ...blockConfigs.format,
        label: "Analysis Structure",
        content: "Please structure your analysis as follows:\n1. Problem Analysis\n2. Key Factors\n3. Potential Solutions\n4. Trade-off Analysis\n5. Recommended Approach\n6. Implementation Steps",
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
        ...blockConfigs.context,
        label: "Creative Brief",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.task,
        label: "Creative Task",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.examples,
        label: "Style Examples",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.constraints,
        label: "Creative Guidelines",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.format,
        label: "Content Structure",
        content: "",
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
        ...blockConfigs.context,
        label: "Technical Context",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.task,
        label: "Documentation Scope",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.examples,
        label: "Code Examples",
        content: "",
        enabled: true,
      },
      {
        ...blockConfigs.constraints,
        label: "Technical Requirements",
        content: "Please ensure:\n- Use of precise technical terminology\n- Clear code examples where relevant\n- Step-by-step instructions\n- Error handling coverage",
        enabled: true,
      },
      {
        ...blockConfigs.format,
        label: "Documentation Structure",
        content: "Structure the documentation as follows:\n1. Overview\n2. Prerequisites\n3. Step-by-step Guide\n4. Code Examples\n5. Troubleshooting\n6. References",
        enabled: true,
      },
    ],
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description: "Specialized template for generating code with specific requirements and context",
    blocks: [
      {
        ...blockConfigs.persona,
        label: "Development Role",
        content: "You are an expert software developer with deep knowledge of best practices, design patterns, and modern development techniques.",
        enabled: true,
        placeholder: "Define the development expertise needed...",
      },
      {
        ...blockConfigs.context,
        label: "Technical Context",
        content: "",
        enabled: true,
        placeholder: "Describe the project context, existing codebase, frameworks, and dependencies...",
      },
      {
        ...blockConfigs.task,
        label: "Implementation Requirements",
        content: "",
        enabled: true,
        placeholder: "Specify what needs to be implemented, including functional requirements and acceptance criteria...",
      },
      {
        ...blockConfigs.constraints,
        label: "Technical Constraints",
        content: "",
        enabled: true,
        placeholder: "List technical constraints, required patterns, coding standards, and limitations...",
      },
      {
        ...blockConfigs.examples,
        label: "Code Examples",
        content: "",
        enabled: true,
        placeholder: "Provide example code snippets showing desired patterns or similar implementations...",
      },
      {
        ...blockConfigs.format,
        label: "Code Structure",
        content: "Please provide the code with:\n1. Required imports/dependencies\n2. Clear function/class documentation\n3. Type definitions\n4. Implementation\n5. Usage examples\n6. Error handling",
        enabled: true,
      }
    ],
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description: "Template for data analysis tasks, insights generation, and statistical interpretation",
    blocks: [
      {
        ...blockConfigs.persona,
        label: "Analyst Role",
        content: "You are an expert data analyst with strong statistical knowledge and experience in deriving actionable insights.",
        enabled: true,
        placeholder: "Define the type of analysis expertise needed...",
      },
      {
        ...blockConfigs.context,
        label: "Data Context",
        content: "",
        enabled: true,
        placeholder: "Describe the data (structure, source, timeframe, key variables) and any relevant background information...",
      },
      {
        ...blockConfigs.task,
        label: "Analysis Goals",
        content: "",
        enabled: true,
        placeholder: "Specify the analysis objectives, key questions to answer, and desired insights...",
      },
      {
        ...blockConfigs.audience,
        label: "Target Audience",
        content: "",
        enabled: true,
        placeholder: "Define who will use these insights (e.g., technical team, executives, stakeholders)...",
      },
      {
        ...blockConfigs.constraints,
        label: "Analysis Parameters",
        content: "",
        enabled: true,
        placeholder: "Specify statistical methods to use/avoid, confidence levels, assumptions to consider...",
      },
      {
        ...blockConfigs.format,
        label: "Output Structure",
        content: "Please structure the analysis as follows:\n1. Key Findings Summary\n2. Detailed Analysis\n3. Statistical Methods Used\n4. Data Limitations\n5. Recommendations\n6. Visualizations Description",
        enabled: true,
      }
    ],
  },
  {
    id: "email-drafting",
    name: "Email Drafting",
    description: "Template for crafting professional and effective emails",
    blocks: [
      {
        ...blockConfigs.context,
        label: "Email Context",
        content: "",
        enabled: true,
        placeholder: "Describe the situation, background, and any relevant history...",
      },
      {
        ...blockConfigs.audience,
        label: "Recipients",
        content: "",
        enabled: true,
        placeholder: "Describe the recipient(s) and their role/relationship...",
      },
      {
        ...blockConfigs.task,
        label: "Email Purpose",
        content: "",
        enabled: true,
        placeholder: "Specify the main objective of the email (inform, request, follow-up, etc.)...",
      },
      {
        ...blockConfigs.tone,
        label: "Email Tone",
        content: "",
        enabled: true,
        placeholder: "Specify the tone (formal, friendly, urgent, etc.)...",
      },
      {
        ...blockConfigs.constraints,
        label: "Key Points",
        content: "",
        enabled: true,
        placeholder: "List the main points that must be covered in the email...",
      },
      {
        ...blockConfigs.format,
        label: "Email Structure",
        content: "Please structure the email with:\n1. Subject Line\n2. Greeting\n3. Opening Paragraph\n4. Main Content\n5. Call to Action\n6. Closing\n7. Signature",
        enabled: true,
      },
      {
        ...blockConfigs.examples,
        label: "Similar Examples",
        content: "",
        enabled: false,
        placeholder: "Provide examples of similar emails or preferred phrasings...",
      }
    ],
  }
] 