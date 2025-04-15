import PromptBuilder from "@/components/prompt-builder"

export default function Home() {
  return (
    <main className="min-h-screen blocks-bg flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl glass-container rounded-xl shadow-xl overflow-hidden">
        <PromptBuilder />
      </div>
    </main>
  )
}
