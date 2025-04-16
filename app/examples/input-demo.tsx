"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export function InputDemo() {
  const [error, setError] = useState(false)

  const handleValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(e.target.value.length < 3)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Input Variants</h2>
        <div className="flex flex-col gap-4 max-w-sm">
          <Input placeholder="Default input" />
          <Input variant="ghost" placeholder="Ghost input" />
          <Input variant="glass" placeholder="Glass effect input" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Input Sizes</h2>
        <div className="flex flex-col gap-4 max-w-sm">
          <Input size="sm" placeholder="Small input" />
          <Input size="default" placeholder="Default size input" />
          <Input size="lg" placeholder="Large input" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">States</h2>
        <div className="flex flex-col gap-4 max-w-sm">
          <Input disabled placeholder="Disabled input" />
          <Input
            error={error}
            placeholder="Input with validation"
            onChange={handleValidation}
          />
          <div className="text-sm text-destructive">
            {error && "Input must be at least 3 characters"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Input Types</h2>
        <div className="flex flex-col gap-4 max-w-sm">
          <Input type="email" placeholder="Email input" />
          <Input type="password" placeholder="Password input" />
          <Input type="number" placeholder="Number input" />
          <Input type="search" placeholder="Search input" />
          <Input type="file" />
        </div>
      </div>
    </div>
  )
} 