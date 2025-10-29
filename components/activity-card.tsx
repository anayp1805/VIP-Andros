"use client"

import type { Activity } from "@/lib/activities-context"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const availableDates = activity.availability.filter((av) => av.slots.some((s) => s.booked < s.capacity))
  const included = activity.included || []
  const displayDescription = activity.tagline || activity.experienceDescription || "No description available"
  // </CHANGE>

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-muted">
        {activity.images?.[0] ? (
          <Image src={activity.images[0] || "/placeholder.svg"} alt={activity.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
        )}
        <div className="absolute top-4 right-4">
          <Badge className="bg-coral text-white">
            ${activity.price}/{activity.pricePer || "person"}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold text-slate line-clamp-1">{activity.title}</h3>
            {activity.tagline && <p className="text-sm text-slate-light mt-1">{activity.tagline}</p>}
            {/* </CHANGE> */}
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {activity.companyName}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-slate-light line-clamp-2 mb-4">{displayDescription}</p>
        {/* </CHANGE> */}

        {included.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {included.slice(0, 3).map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
            {included.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{included.length - 3} more
              </Badge>
            )}
          </div>
        )}
        {/* </CHANGE> */}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{activity.duration ? `${activity.duration} hrs` : "Duration not set"}</span>
          </div>
          <span>{availableDates.length} dates available</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full bg-ocean-blue hover:bg-ocean-dark text-white">
          <Link href={`/activity/${activity.id}`}>View Details & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
