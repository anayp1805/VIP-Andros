"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles, ShieldCheck } from "lucide-react"

const demoEvents = [
  {
    id: "e1",
    title: "Circular Economy Summit",
    date: "2026-04-18",
    location: "Hybrid (NYC + Virtual)",
    description: "Workshop on funding student-led reuse and upcycling labs.",
  },
  {
    id: "e2",
    title: "Interoperable Giving Sandbox",
    date: "2026-05-09",
    location: "Virtual",
    description: "Design review for open donation APIs and transparent impact metrics.",
  },
]

export default function PhilanthropyPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const isAuthorized = useMemo(() => user && user.type === "philanthropist", [user])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [donationTotal, setDonationTotal] = useState<number | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/")
    }
  }, [isAuthorized, isLoading, router])

  useEffect(() => {
    const load = async () => {
      if (!user || !isAuthorized) return
      const supabase = createClient()
      const { data: philanthropist, error } = await supabase
        .from("philanthropists")
        .select("id, total_donated")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("[philanthropy] profile load error", error)
      }

      if (philanthropist) {
        setProfileId(philanthropist.id)
        setDonationTotal(philanthropist.total_donated ?? 0)
      }

      if (philanthropist?.id) {
        const { data: sumData, error: sumErr } = await supabase
          .from("donations")
          .select("amount")
          .eq("philanthropist_id", philanthropist.id)

        if (sumErr) {
          console.error("[philanthropy] donation sum error", sumErr)
        } else if (sumData) {
          const total = sumData.reduce((acc, d) => acc + Number(d.amount || 0), 0)
          setDonationTotal(total)
        }
      }
    }

    load()
  }, [user, isAuthorized])

  if (isLoading || !isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-primary">Philanthropy Section</p>
          <h1 className="text-4xl font-bold text-slate">Collaborate for Sustainable, Long-Term Impact</h1>
          <p className="text-muted-foreground max-w-3xl">
            Tokuma connects philanthropists to co-design education, interoperability, and circular economy initiatives.
            This space is invite-only so you can coordinate resources, share learnings, and accelerate trusted projects.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>Private discussions for philanthropists (placeholder)</CardDescription>
              </div>
              <MessageSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Forum functionality will live here. For now, use this placeholder to capture topics you want to see:
                sustainable supply chains, open data standards, blended finance, student fellowships, and impact
                measurement.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Education", "Interoperability", "Sustainability", "Circular Economy", "Impact Metrics"].map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access & Safety</CardTitle>
              <CardDescription>Invite-only with backend code validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-slate">Verified access</p>
                  <p>Signups require a philanthropy access code. Invalid codes are blocked server-side.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-slate">Aligned with Tokuma&apos;s pillars</p>
                  <p>Education, interoperability, and philanthropy drive every program we greenlight.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Special Events</CardTitle>
              <CardDescription>Admins can invite philanthropists; you can view your invitations.</CardDescription>
            </div>
            <Badge>Invite-only</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoEvents.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {event.location}
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Invitation required
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Upcoming: admins will be able to create events and send invites directly from this section.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Your Impact Snapshot</CardTitle>
              <CardDescription>Donations recorded for your account</CardDescription>
            </div>
            <Badge variant="secondary">Realtime</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Philanthropist profile: {profileId ? profileId : "not found (create on signup)"}{" "}
              {donationTotal !== null && <span className="ml-2 font-medium text-slate">Total donated: ${donationTotal}</span>}
            </p>
            <p>Donations and projects map to the Supabase tables shown in your schema.</p>
          </CardContent>
        </Card>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
