import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { AppNav } from "@/components/app-nav"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "PromptBlocks - Build Better AI Prompts",
  description: "A visual tool to help you build better AI prompts by assembling specialized blocks",
  keywords: ["AI", "Prompts", "LLM", "ChatGPT", "Prompt Engineering", "AI Tools"],
  authors: [{ name: "PromptBlocks Team" }],
  openGraph: {
    title: "PromptBlocks - Build Better AI Prompts",
    description: "A visual tool to help you build better AI prompts by assembling specialized blocks",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("antialiased", inter.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatedGridPattern
            numSquares={200}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:linear-gradient(to_bottom,white,transparent_80%)]",
              "fixed inset-0 w-full h-full -z-10",
            )}
          />
          <div className="relative flex min-h-screen flex-col">
            <AppNav />
            <main className="flex-1">
              <div className="container relative mx-auto px-4 py-8 sm:py-12 lg:py-16">
                <div className="mx-auto rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-dark-lg shadow-gray-200/50 dark:shadow-gray-950/50 backdrop-blur-sm p-4 lg:p-10 ring-1 ring-gray-200/70 dark:ring-gray-700/30">
                  {children}
                </div>
              </div>
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
