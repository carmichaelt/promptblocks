import PromptBuilder from "@/components/prompt-builder"
import ThreeBackground from "@/components/three-background"

export default function Home() {
  return (
    <main className="min-h-screen blocks-bg flex items-center justify-center p-4 sm:p-6 md:p-8">
      <ThreeBackground />
      <div className="w-full max-w-6xl glass-container rounded-xl shadow-xl overflow-hidden">
        <PromptBuilder />
      </div>
    </main>
  )
}
