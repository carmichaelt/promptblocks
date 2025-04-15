"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function LoadingSparkles() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 bg-amber-500/20 dark:bg-amber-400/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Main sparkle icon */}
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
          className="relative z-10 text-amber-500 dark:text-amber-400"
        >
          <Sparkles size={24} />
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 0.3,
            }}
          >
            <motion.div
              className="h-1 w-1 rounded-full bg-amber-500 dark:bg-amber-400"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginLeft: "-2px",
                marginTop: "-2px",
                transformOrigin: "20px 20px",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400"
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
