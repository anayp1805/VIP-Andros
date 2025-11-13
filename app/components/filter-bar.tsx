"use client"

import React from "react"

type Props = {
  types: string[]
  selected: string[]
  onToggle: (t: string) => void
  onClear: () => void
}

export default function FilterBar({ types, selected, onToggle, onClear }: Props) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        {types.map((t) => {
          const active = selected.includes(t)
          return (
            <button
              key={t}
              onClick={() => onToggle(t)}
              aria-pressed={active}
              className={`px-4 py-2 rounded-lg text-base border transition font-button ${
                active ? "bg-ocean-blue text-white" : "bg-white text-slate-700"
              }`}
            >
              {t}
            </button>
          )
        })}
        <button
          onClick={onClear}
          className="ml-2 px-4 py-2 rounded-lg text-base border bg-white text-slate-700 font-button"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
