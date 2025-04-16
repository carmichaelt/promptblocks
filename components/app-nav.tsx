"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Book, Sparkles, Blocks } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

const navigation = [
  {
    name: "Quick Prompt",
    href: "/",
    icon: Sparkles,
  },
  {
    name: "Block Builder",
    href: "/builder",
    icon: Blocks,
  },
  {
    name: "Resource Library",
    href: "/resources",
    icon: Book,
  },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
          >
            <div className="glass-container p-1.5 rounded-md">
              <Blocks className="h-6 w-6 text-primary dark:text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl text-gray-900 dark:text-gray-100">
              PromptBlocks
            </span>
          </Link>

          {/* Navigation Links and Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors relative",
                      "hover:text-gray-900 dark:hover:text-gray-100",
                      isActive
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400",
                      "flex items-center gap-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-foreground" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "p-2 rounded-md transition-colors relative",
                      "hover:text-gray-900 dark:hover:text-gray-100",
                      isActive
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-foreground" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <div className="border-l border-slate-200/80 dark:border-slate-800/80 pl-4 ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 