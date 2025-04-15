export default function KeyboardShortcutsGuide() {
  const shortcuts = [
    { keys: ["Alt", "1-9"], description: "Focus on a specific block" },
    { keys: ["Tab"], description: "Move to the next block" },
    { keys: ["Shift", "Tab"], description: "Move to the previous block" },
    { keys: ["Ctrl/Cmd", "C"], description: "Copy the assembled prompt" },
  ]

  return (
    <div className="space-y-2">
      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
        >
          <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
          <div className="flex gap-1">
            {shortcut.keys.map((key, keyIndex) => (
              <span
                key={keyIndex}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono border border-slate-300 dark:border-slate-600"
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
