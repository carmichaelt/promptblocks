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
  enabled: boolean
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
    description: "Define the role, expertise, and characteristics the AI should embody.",
    bestPractices: [
      "Be specific about expertise level and domain knowledge",
      "Define clear behavioral characteristics",
      "Include relevant professional standards or methodologies",
      "Specify any ethical guidelines or principles to follow",
      "Consider the relationship dynamic with the user",
      "Align expertise with the task requirements"
    ],
    examples: [
      "Expert software architect with 15+ years experience in distributed systems",
      "Professional editor following Chicago Manual of Style guidelines",
      "Patient, supportive teaching assistant specializing in mathematics",
      "Data scientist with expertise in statistical analysis and visualization"
    ],
    placeholder: "Define the role, expertise level, and key characteristics...",
    enabled: true,
  },
  context: {
    type: "context",
    title: "Context Block",
    description: "Provide essential background information and situational context.",
    bestPractices: [
      "Start with the most relevant information first",
      "Include necessary technical details or specifications",
      "Provide historical context if relevant",
      "Define any domain-specific terminology",
      "Specify the current state or situation",
      "Include any relevant constraints or limitations",
      "Mention related work or previous attempts",
      "Clarify the scope of the context"
    ],
    examples: [
      "We're developing a React application with TypeScript and need to implement...",
      "Previous analysis showed that customer churn increased by 15% after...",
      "The legacy system uses Java 8 and Oracle Database 12c...",
      "Our team has already attempted to solve this by..."
    ],
    placeholder: "Provide relevant background information and context...",
    enabled: true,
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
    placeholder: "Define who will be reading or receiving this content...",
    enabled: true,
  },
  task: {
    type: "task",
    title: "Task Block",
    description: "Clearly define what needs to be accomplished.",
    bestPractices: [
      "Use clear, actionable verbs (analyze, create, optimize, etc.)",
      "Break complex tasks into smaller steps",
      "Specify the expected outcome",
      "Include acceptance criteria",
      "Define the scope clearly",
      "Indicate priority or importance",
      "Specify any dependencies",
      "Include success metrics if applicable"
    ],
    examples: [
      "Analyze the provided code for potential security vulnerabilities...",
      "Create a step-by-step migration plan for upgrading from...",
      "Optimize the following database query to improve performance...",
      "Design a RESTful API endpoint that handles..."
    ],
    placeholder: "Specify what needs to be done and the desired outcome...",
    enabled: true,
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
    placeholder: "Specify the desired tone, style, and voice for the response...",
    enabled: true,
  },
  format: {
    type: "format",
    title: "Format Block",
    description: "Define the structure and presentation of the response.",
    bestPractices: [
      "Specify the desired output structure clearly",
      "Include section headers or markers",
      "Define any required formatting (markdown, JSON, etc.)",
      "Specify length requirements",
      "Include any templating requirements",
      "Define the level of detail needed",
      "Specify any required metadata",
      "Include examples of the desired format"
    ],
    examples: [
      "Return a JSON object with keys: 'summary', 'steps', 'recommendations'",
      "Format the response in markdown with H2 headers for each section",
      "Provide a numbered list of steps, each with a description and example",
      "Structure the analysis as: Context → Problem → Solution → Implementation"
    ],
    placeholder: "Define how the response should be structured and formatted...",
    enabled: true,
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
    placeholder: "List any limitations, requirements, or specific guidelines the AI should follow...",
    enabled: true,
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
    placeholder: "Add input/output examples to guide the AI's response style and format. Use consistent patterns like 'Input: X, Output: Y'.",
    enabled: true,
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
        enabled: true,
        placeholder: blockConfigs.persona.placeholder || "Define the AI's role...",
      },
      {
        ...blockConfigs.audience,
        label: "Target Audience (Optional)",
        content: "",
        enabled: true,
        placeholder: blockConfigs.audience.placeholder || "Describe who the response is for...",
      },
      {
        ...blockConfigs.tone,
        label: "Desired Tone (Optional)",
        content: "",
        enabled: true,
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
        enabled: true,
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
        enabled: true,
        placeholder: "Provide examples of similar emails or preferred phrasings...",
      }
    ],
  },
  {
    id: "structured-reasoning",
    name: "Structured Reasoning",
    description: "Template for complex problem-solving using chain-of-thought and step-by-step reasoning",
    blocks: [
      {
        ...blockConfigs.context,
        label: "Initial Problem",
        content: "",
        enabled: true,
        placeholder: "Describe the problem or scenario that needs analysis...",
      },
      {
        ...blockConfigs.task,
        label: "Reasoning Steps Required",
        content: "Please solve this problem using the following steps:\n1. Understand key information\n2. Break down the problem\n3. Consider relevant principles\n4. Apply logical reasoning\n5. Validate assumptions\n6. Draw conclusions",
        enabled: true,
        placeholder: "List the specific reasoning steps needed...",
      },
      {
        ...blockConfigs.constraints,
        label: "Reasoning Constraints",
        content: "When solving this problem:\n- Show all work and intermediate steps\n- Explain the rationale for each step\n- Highlight key assumptions\n- Note any limitations\n- Consider edge cases",
        enabled: true,
        placeholder: "Specify any constraints or requirements for the reasoning process...",
      },
      {
        ...blockConfigs.examples,
        label: "Similar Problems",
        content: "",
        enabled: true,
        placeholder: "Provide examples of similar problems and their step-by-step solutions...",
      },
      {
        ...blockConfigs.format,
        label: "Solution Format",
        content: "Structure the solution as follows:\n1. Problem Understanding\n2. Key Information Extracted\n3. Step-by-Step Reasoning\n4. Intermediate Results\n5. Final Conclusion\n6. Confidence Level\n7. Alternative Approaches Considered",
        enabled: true,
      }
    ],
  },
  {
    id: "summarization",
    name: "Text Summarization",
    description: "Template for generating concise, accurate summaries of longer texts",
    blocks: [
      {
        ...blockConfigs.context,
        label: "Source Text",
        content: "",
        enabled: true,
        placeholder: "Paste the text to be summarized...",
      },
      {
        ...blockConfigs.task,
        label: "Summarization Goals",
        content: "",
        enabled: true,
        placeholder: "Specify what aspects to focus on, desired length, and key points to include...",
      },
      {
        ...blockConfigs.audience,
        label: "Target Audience",
        content: "",
        enabled: true,
        placeholder: "Define who will read this summary and their knowledge level...",
      },
      {
        ...blockConfigs.constraints,
        label: "Summary Requirements",
        content: "",
        enabled: true,
        placeholder: "List requirements like word count, style, key terms to include/exclude...",
      },
      {
        ...blockConfigs.format,
        label: "Summary Structure",
        content: "Please structure the summary as follows:\n1. Main Idea (1-2 sentences)\n2. Key Points (3-5 bullets)\n3. Supporting Details\n4. Conclusion\n5. Source Attribution",
        enabled: true,
      }
    ],
  }
] 