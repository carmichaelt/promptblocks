"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function LoadingSparkles() {
  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="text-amber-500 dark:text-amber-400"
      >
        <Sparkles size={24} />
      </motion.div>
      <motion.div
        className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        Generating AI content...
      </motion.div>
    </div>
  )
}
