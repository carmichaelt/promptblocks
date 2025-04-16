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
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Blocks className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
                PromptBlocks
              </span>
            </Link>
          </div>

          {/* Navigation Links and Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-slate-100 dark:hover:bg-slate-800",
                      "flex items-center gap-2",
                      isActive
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      "hover:bg-slate-100 dark:hover:bg-slate-800",
                      isActive
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 