import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { AppNav } from "@/components/app-nav"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "PromptBlocks - Build Better AI Prompts",
  description: "A visual tool to help you build better AI prompts by assembling specialized blocks",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
        <AppNav />
        <main className="min-h-[calc(100vh-4rem)] py-12 relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-white/98 dark:bg-slate-900/98 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 backdrop-blur-sm p-6 sm:p-8 ring-1 ring-slate-200/70 dark:ring-slate-800/70">
            {children}
          </div>
        </main>
        <Toaster />
      </body>
    </html>
  )
}
