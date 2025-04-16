import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ThemeToggle from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
        {children}
        <ThemeToggle />
        <Toaster />
      </body>
    </html>
  )
}
