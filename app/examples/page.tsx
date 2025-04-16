import { ButtonDemo } from "./button-demo"
import { InputDemo } from "./input-demo"

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Components Showcase</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A demonstration of our design system components
          </p>
        </div>

        <div className="grid gap-12">
          <section className="rounded-lg border bg-card p-6">
            <ButtonDemo />
          </section>

          <section className="rounded-lg border bg-card p-6">
            <InputDemo />
          </section>
        </div>
      </div>
    </div>
  )
} 