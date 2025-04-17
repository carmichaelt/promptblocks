"use client"

import { Book } from "@/components/ui/book"
import { InfoIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Resource {
  title: string
  description: string
  url: string
  image: string
  color: string
}

const resources: Resource[] = [
  {
    title: "Google's Prompt Engineering Guide",
    description: "Learn the fundamentals of prompt engineering from Google's comprehensive guide",
    url: "https://cloud.google.com/discover/what-is-prompt-engineering",
    image: "",
    color: "hsl(300, 100%, 80%)",
  },
  {
    title: "Gemini Workspace Guide",
    description: "Master prompting techniques for Google's Gemini AI model",
    url: "https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf",
    image: "guide1.png",
    color: "hsl(230, 100%, 80%)",
  },
  {
    title: "OpenAI Prompt Engineering Guide",
    description: "This guide offers valuable insights into the best practices and strategies for crafting effective prompts specifically for OpenAI's large language models.",
    url: "https://platform.openai.com/docs/guides/prompt-engineering",
    image: "",
    color: "hsl(200, 80%, 70%)",
  },
  {
    title: "Prompt Engineering Guide - Learn Prompting",
    description: "This comprehensive and freely accessible guide serves as an extensive resource covering both the fundamental principles and advanced techniques of prompt engineering for generative AI.",
    url: "https://www.promptingguide.ai/",
    image: "",
    color: "hsl(150, 70%, 60%)",
  },
  {
    title: "Microsoft Azure OpenAI Service - Prompt Engineering",
    description: "This documentation from Microsoft provides specific guidance on prompt engineering within the context of their Azure OpenAI Service.",
    url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering",
    image: "",
    color: "hsl(220, 90%, 50%)",
  },
  {
    title: "Anthropic's Prompt Engineering Overview",
    description: "Official documentation from Anthropic on designing effective prompts and understanding techniques for their AI model, Claude.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
    image: "", // Placeholder image name
    color: "hsl(30, 90%, 70%)",
  },
  {
    title: "Cohere - Crafting Effective Prompts",
    description: "Cohere's official guide covering best practices, formatting, context, and examples for prompting their language models.",
    url: "https://docs.cohere.com/v2/docs/crafting-effective-prompts",
    image: "", // Placeholder image name
    color: "hsl(260, 80%, 75%)",
  },
  {
    title: "ChatGPT Prompt Engineering for Developers (DeepLearning.AI)",
    description: "A popular short course by Isa Fulford and Andrew Ng focusing on practical prompt engineering principles and techniques for developers using the OpenAI API.",
    url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
    image: "", // Placeholder image name
    color: "hsl(50, 100%, 60%)",
  },
   {
    title: "Awesome Prompt Engineering (GitHub - promptslab)",
    description: "A curated list on GitHub (by promptslab) featuring a wide range of prompt engineering resources, tools, models, papers, and guides.",
    url: "https://github.com/promptslab/Awesome-Prompt-Engineering",
    image: "", // Placeholder image name
    color: "hsl(100, 60%, 65%)",
  },
  // Add more resources here
]

// Define the Resource type interface if you haven't already
interface Resource {
  title: string;
  description: string;
  url: string;
  image: string; // Assuming image is a path or filename
  color: string; // Assuming color is a CSS HSL string
}

export default function ResourceLibrary() {
  // Helper function to extract domain from URL
  const getDomainFromUrl = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (e) {
      console.error("Invalid URL:", url, e);
      return null;
    }
  };

  return (
    <div className="container mx-auto px-1 md:px-4 mb-12">
      {/* Header */}
      <div className="mb-12 text-center">
        
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          Resource Library
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Explore our curated collection of prompt engineering resources and guides
        </p>
      </div>

      {/* 4. Wrap Grid in max-width container */}
      <div className="max-w-6xl mx-auto">


        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => {
            const domain = getDomainFromUrl(resource.url);
            // Construct favicon URL only if domain is valid
            const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
            
            // Decide which image source to use (original first, fallback to favicon)
            const imageSrc = resource.image; // Prioritize explicitly defined image
            const illustrationElement = imageSrc
              ? <img src={imageSrc} alt={resource.title} width={160} height={160} />
              : faviconUrl // Fallback to favicon if no explicit image and favicon URL is valid
              ? <img src={faviconUrl} alt={`${resource.title} favicon`} width={64} height={64} className="ml-12 mx-auto mt-10 opacity-80" /> // Smaller size for favicon
              : undefined; // No image if neither is available

            return (
              <div key={index} className="group relative">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-200 group-hover:scale-105"
                >
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                    <div className="mb-12 flex justify-center h-[160px] items-center"> {/* Set fixed height for consistency */}
                      <Book
                        width={160}
                        depth={5}
                        color={resource.color}
                        illustration={illustrationElement} // Use the determined illustration
                      >
                        <div className="p-2 grid gap-1 text-center">
                          <p className="text-xs font-medium">Learn More</p>
                          <InfoIcon className="w-4 h-4 mx-auto" />
                        </div>
                      </Book>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{resource.description}</p>
                  </div>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 