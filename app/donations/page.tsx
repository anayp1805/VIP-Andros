"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Heart, Target, Clock, ArrowUpRight, Loader2 } from "lucide-react"

interface DonationRow {
  id: string
  project_id: string | null
  cause: string
  amount: number
  currency: string
  donation_date: string
  message: string | null
  project?: {
    id: string
    title: string
    category: string
    current_amount: number | null
    target_amount: number | null
  }
}

interface ProjectOption {
  id: string
  title: string
  category: string
}

export default function DonationsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [supabase] = useState(() => (typeof window !== "undefined" ? createClient() : null))
  const [showAuthModal, setShowAuthModal] = useState(false)

  const [philanthropistId, setPhilanthropistId] = useState<string | null>(null)
  const [donations, setDonations] = useState<DonationRow[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [amount, setAmount] = useState(50)
  const [currency, setCurrency] = useState("USD")
  const [cause, setCause] = useState("General fund")
  const [projectId, setProjectId] = useState<string | undefined>()
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.type !== "philanthropist") {
        router.replace("/")
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const bootstrap = async () => {
      if (!supabase || !user || user.type !== "philanthropist") return

      // Load philanthropist profile (needed to tie donations)
      const { data: philanthropist, error: philErr } = await supabase
        .from("philanthropists")
        .select("id, total_donated")
        .eq("user_id", user.id)
        .maybeSingle()

      if (philErr) {
        console.error("[donations] load philanthropist error", philErr)
      }

      if (!philanthropist) {
        setLoading(false)
        return
      }

      setPhilanthropistId(philanthropist.id)

      // Load projects list for selection (used to hydrate donation rows with titles)
      const { data: projectRows, error: projErr } = await supabase
        .from("projects")
        .select("id, title, category, current_amount, target_amount")
        .order("created_at", { ascending: false })

      if (projErr) {
        console.error("[donations] load projects error", projErr)
      }

      // Load donations for this philanthropist
      const { data: donationRows, error: donationErr } = await supabase
        .from("donations")
        .select("id, project_id, cause, amount, currency, donation_date, message")
        .eq("philanthropist_id", philanthropist.id)
        .order("donation_date", { ascending: false })

      if (donationErr) {
        console.error("[donations] load donations error", donationErr)
      }

      const projectMap = new Map((projectRows || []).map((p) => [p.id, p]))
      const withProjects = (donationRows || []).map((d) => ({
        ...d,
        project: d.project_id ? projectMap.get(d.project_id) : undefined,
      })) as DonationRow[]

      setDonations(withProjects)

      // Load projects list for selection
      setProjects((projectRows || []) as ProjectOption[])
      setLoading(false)
    }

    bootstrap()
  }, [supabase, user])

  const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0)
  const latestDonation = donations[0]

  const projectBreakdown = donations.reduce<Record<string, { total: number; title: string }>>((acc, d) => {
    if (!d.project_id) return acc
    const key = d.project_id
    const title = d.project?.title || "Project"
    if (!acc[key]) acc[key] = { total: 0, title }
    acc[key].total += Number(d.amount || 0)
    return acc
  }, {})

  const causeBreakdown = donations.reduce<Record<string, number>>((acc, d) => {
    if (!acc[d.cause]) acc[d.cause] = 0
    acc[d.cause] += Number(d.amount || 0)
    return acc
  }, {})

  const handleSubmit = async () => {
    if (!supabase || !philanthropistId) return

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount greater than 0.")
      return
    }

    // only allow project ids that exist in the loaded list
    const validProjectId = projectId && projects.some((p) => p.id === projectId) ? projectId : undefined

    setSaving(true)
    const payload: any = {
      philanthropist_id: philanthropistId,
      cause: cause.trim() || "General",
      amount: numericAmount,
      currency,
      message: message.trim() || null,
    }
    if (validProjectId) payload.project_id = validProjectId

    const { data, error } = await supabase
      .from("donations")
      .insert(payload)
      .select("id, project_id, cause, amount, currency, donation_date, message")
      .maybeSingle()

    if (error) {
      console.error("[donations] insert error", error)
      alert(`Could not process donation right now. ${error.message || ""}`)
      setSaving(false)
      return
    }

    if (data) {
      const projectLookup = validProjectId ? projects.find((p) => p.id === validProjectId) : undefined
      setDonations((prev) => [
        {
          ...(data as DonationRow),
          project: projectLookup as DonationRow["project"],
        },
        ...prev,
      ])
      setAmount(50)
      setCurrency("USD")
      setCause("General fund")
      setProjectId(undefined)
      setMessage("")
    }

    setSaving(false)
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading donations...</div>
      </div>
    )
  }

  if (!user || user.type !== "philanthropist") {
    return null
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-primary">Philanthropist workspace</p>
          <h1 className="text-4xl font-bold text-slate">Donations</h1>
          <p className="text-muted-foreground max-w-2xl">
            Make gifts, track every contribution, and see exactly which projects you are powering.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardDescription>Total donated</CardDescription>
                <CardTitle className="text-3xl">${totalDonated.toFixed(0)}</CardTitle>
              </div>
              <Heart className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Across {donations.length} gift{donations.length === 1 ? "" : "s"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardDescription>Most recent</CardDescription>
                <CardTitle className="text-xl">
                  {latestDonation ? `$${Number(latestDonation.amount).toFixed(0)}` : "—"}
                </CardTitle>
              </div>
              <Clock className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {latestDonation
                ? new Date(latestDonation.donation_date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No donations yet"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardDescription>Active focus</CardDescription>
                <CardTitle className="text-xl">{Object.keys(projectBreakdown).length || "—"} projects</CardTitle>
              </div>
              <Target className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {Object.values(projectBreakdown)
                .slice(0, 2)
                .map((p) => p.title)
                .join(", ") || "Choose a project to get started"}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="give" className="w-full">
          <TabsList>
            <TabsTrigger value="give">Donate</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="where">Where it goes</TabsTrigger>
          </TabsList>

          <TabsContent value="give" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Make a donation</CardTitle>
                  <CardDescription>Direct your gift to a project or general cause.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cause">Cause / purpose</Label>
                    <Input
                      id="cause"
                      placeholder="e.g., Circular economy labs, Scholarships"
                      value={cause}
                      onChange={(e) => setCause(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project (optional)</Label>
                    <Select value={projectId} onValueChange={(val) => setProjectId(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Direct this gift to a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title} ({p.category})
                          </SelectItem>
                        ))}
                        {projects.length === 0 && (
                          <SelectItem value="no-projects" disabled>
                            No projects yet
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Share intent or constraints for this gift"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={saving} className="w-full md:w-auto">
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Donate now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" /> Impact tip
                  </CardTitle>
                  <CardDescription>Tag a project to keep reporting aligned.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Donations tied to projects appear in the breakdown and can be reconciled later.</p>
                  <p className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4" /> You can leave a message for project leads.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Donation activity</CardTitle>
                <CardDescription>Your recent gifts in reverse chronological order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {donations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No donations yet. Make your first contribution above.</p>
                )}

                {donations.map((d) => (
                  <div key={d.id} className="flex flex-col gap-2 rounded-lg border p-4 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{d.currency}</Badge>
                        <div>
                          <div className="text-lg font-semibold text-slate">${Number(d.amount).toFixed(0)}</div>
                          <div className="text-sm text-muted-foreground">{d.cause}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(d.donation_date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {d.project && <Badge variant="outline">{d.project.title}</Badge>}
                      <Badge variant="outline">Cause</Badge>
                      {d.message && <span className="text-slate">“{d.message}”</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="where" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>By project</CardTitle>
                  <CardDescription>Shows gifts linked to specific projects.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(projectBreakdown).length === 0 && (
                    <p className="text-sm text-muted-foreground">No project-directed gifts yet.</p>
                  )}
                  {Object.entries(projectBreakdown).map(([id, info]) => (
                    <div key={id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Project</Badge>
                        <span className="font-medium text-slate">{info.title}</span>
                      </div>
                      <span className="font-semibold text-primary">${info.total.toFixed(0)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By cause</CardTitle>
                  <CardDescription>Quick view of where your intent is focused.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(causeBreakdown).length === 0 && (
                    <p className="text-sm text-muted-foreground">No cause breakdown yet.</p>
                  )}
                  {Object.entries(causeBreakdown).map(([label, total]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Cause</Badge>
                        <span className="font-medium text-slate">{label}</span>
                      </div>
                      <span className="font-semibold text-primary">${total.toFixed(0)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
