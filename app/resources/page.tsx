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
    image: "guide1.png",
    color: "hsl(300, 100%, 80%)",
  },
  {
    title: "Gemini Workspace Guide",
    description: "Master prompting techniques for Google's Gemini AI model",
    url: "https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf",
    image: "guide1.png",
    color: "hsl(230, 100%, 80%)",
  },
  // Add more resources here
]

export default function ResourceLibrary() {
  return (
    <div className="container mt-12 relative mx-auto px-4 py-8 bg-gray-100/90 dark:bg-slate-900/90 shadow-md border border-slate-200 dark:border-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Back to Builder
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          Resource Library
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Explore our curated collection of prompt engineering resources and guides
        </p>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((resource, index) => (
          <div key={index} className="group relative">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform duration-200 group-hover:scale-105"
            >
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="mb-12 flex justify-center">
                  <Book
                    width={160}
                    depth={5}
                    color={resource.color}
                    illustration={resource.image ? <img src={resource.image} alt={resource.title} width={160} height={160} /> : undefined}
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
        ))}
      </div>
    </div>
  )
} 