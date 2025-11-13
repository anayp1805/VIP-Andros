"use client"

import React, { useMemo, useState } from "react"
import FilterBar from "./filter-bar"
import { ActivityCard } from "@/components/activity-card"
import { useActivities } from "@/lib/activities-context"
import { ACTIVITY_TYPES, ACTIVITY_TYPE_KEYWORDS } from "./activity-filter-config"

function matchesType(activity: any, type: string) {
  const hay = [
    activity.title,
    activity.tagline,
    activity.experienceDescription,
    activity.companyName,
    ...(Array.isArray(activity.categories) ? activity.categories : []),
    ...(Array.isArray(activity.included) ? activity.included : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const keywords = ACTIVITY_TYPE_KEYWORDS[type] ?? [type.toLowerCase()]
  return keywords.some((kw) => hay.includes(kw.toLowerCase()))
}

export default function ActivitiesFilteredList() {
  const { activities = [] } = useActivities()
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const types = useMemo(() => ACTIVITY_TYPES, [])

  const toggleType = (t: string) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((p) => p !== t) : [...prev, t]))

  const clear = () => setSelectedTypes([])

  const filtered = useMemo(() => {
    if (!activities) return []
    if (selectedTypes.length === 0) return activities
    return activities.filter((a: any) => selectedTypes.some((t) => matchesType(a, t)))
  }, [activities, selectedTypes])


  return (
    <div>
      <div className="mb-6">
  <h2 className="text-2xl md:text-3xl font-bold text-slate mb-3 font-display">Filter</h2>
        <FilterBar
          types={types}
          selected={selectedTypes}
          onToggle={toggleType}
          onClear={clear}
        />
        <div className="mt-3 text-lg text-slate-600">Available Activities</div>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No activities match your filters.</div>
        ) : (
          filtered.map((a: any) => (
            <ActivityCard key={a.id} activity={a} />
          ))
        )}
      </div>
    </div>
  )
}
