"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Clock3,
  FileText,
  HandCoins,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"

type PlatformRole = "explorer" | "founder" | "investor"
type CampaignStatus = "Draft" | "Under Review" | "Live" | "Funded" | "Closed" | "Repaying"

interface Campaign {
  id: string
  name: string
  pitch: string
  fundingType: "Grant" | "Donation" | "Reward" | "Equity" | "Loan" | "RBF"
  status: CampaignStatus
  raised: number
  target: number
  daysLeft: number
  founder: string
  tags: string[]
}

const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Closed Loop Textiles",
    pitch: "Campus-to-manufacturer fiber recovery platform for surplus garments and uniforms.",
    fundingType: "Equity",
    status: "Live",
    raised: 820000,
    target: 1200000,
    daysLeft: 14,
    founder: "Loop Foundry",
    tags: ["Circular economy", "Atlanta", "Textiles"],
  },
  {
    id: "c2",
    name: "ReVolt Microgrid Kits",
    pitch: "Deployable solar storage kits for resilient community hubs and vocational labs.",
    fundingType: "RBF",
    status: "Under Review",
    raised: 210000,
    target: 750000,
    daysLeft: 31,
    founder: "ReVolt Energy",
    tags: ["Energy", "Southeast", "Workforce"],
  },
  {
    id: "c3",
    name: "BioPack Leasing",
    pitch: "Reusable food packaging service paired with return logistics for local merchants.",
    fundingType: "Loan",
    status: "Repaying",
    raised: 640000,
    target: 640000,
    daysLeft: 0,
    founder: "BioPack Systems",
    tags: ["Reuse", "Restaurants", "Waste reduction"],
  },
  {
    id: "c4",
    name: "Open Soil Commons",
    pitch: "Grant-backed soil regeneration data network connecting growers, students, and buyers.",
    fundingType: "Grant",
    status: "Funded",
    raised: 300000,
    target: 300000,
    daysLeft: 0,
    founder: "Commons Lab",
    tags: ["Agriculture", "Open data", "Impact metrics"],
  },
]

const statusChips: CampaignStatus[] = ["Draft", "Under Review", "Live", "Funded", "Closed", "Repaying"]

const reportCards = [
  {
    title: "Portfolio snapshot",
    value: "$4.8M",
    detail: "Across active Tokuma investment campaigns and blended capital pilots.",
  },
  {
    title: "Repayment pipeline",
    value: "$182K",
    detail: "Expected over the next 90 days from loan and revenue-based structures.",
  },
  {
    title: "Impact reporting",
    value: "12 themes",
    detail: "Mapped to sector, region, SDG, and circularity-aligned reporting tags.",
  },
]

const messageFeed = [
  {
    title: "Founder Q&A",
    detail: "Loop Foundry answered diligence questions on procurement partnerships.",
    time: "12m ago",
  },
  {
    title: "Milestone update",
    detail: "ReVolt uploaded a manufacturing readiness checkpoint for review.",
    time: "2h ago",
  },
  {
    title: "Repayment notice",
    detail: "BioPack Systems posted its April repayment schedule and ledger export.",
    time: "1d ago",
  },
]

const roleContent: Record<
  PlatformRole,
  {
    title: string
    summary: string
    dashboardTitle: string
    dashboardPoints: string[]
    createLabel: string
  }
> = {
  explorer: {
    title: "Public discovery mode",
    summary: "Browse live campaigns, compare funding structures, and understand the venture pipeline before you participate.",
    dashboardTitle: "Explorer dashboard",
    dashboardPoints: [
      "Shortlist campaigns by funding type, region, and impact theme.",
      "Track new questions, milestones, and public reporting drops.",
      "Move into investor or founder workflows as Tokuma expands this module.",
    ],
    createLabel: "Founder access required",
  },
  founder: {
    title: "Founder workspace",
    summary: "Launch new applications, update milestones, answer investor questions, and keep your campaign moving through review.",
    dashboardTitle: "My dashboard",
    dashboardPoints: [
      "Create new applications or campaigns from the top bar.",
      "Move ventures from draft to under review with milestones and documents.",
      "Monitor questions, progress, and repayment obligations in one shell.",
    ],
    createLabel: "New application",
  },
  investor: {
    title: "Investor workspace",
    summary: "Review campaigns, monitor repayments, compare structures, and keep impact reporting aligned across your portfolio.",
    dashboardTitle: "My dashboard",
    dashboardPoints: [
      "Track live deals, funded ventures, and repayment timelines.",
      "Centralize Q&A, campaign updates, and diligence status changes.",
      "Export investor-ready reporting once backend data is wired in.",
    ],
    createLabel: "Investor view",
  },
}

function getRoleFromUserType(userType?: string): PlatformRole {
  if (userType === "company") return "founder"
  if (userType === "philanthropist") return "investor"
  return "explorer"
}

function getStatusClassName(status: CampaignStatus) {
  return {
    Draft: "border-slate-300 bg-slate-100 text-slate-700",
    "Under Review": "border-amber-200 bg-amber-50 text-amber-800",
    Live: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Funded: "border-sky-200 bg-sky-50 text-sky-800",
    Closed: "border-zinc-200 bg-zinc-100 text-zinc-700",
    Repaying: "border-violet-200 bg-violet-50 text-violet-800",
  }[status]
}

function getFundingTypeClassName(fundingType: Campaign["fundingType"]) {
  return {
    Grant: "bg-sky-100 text-sky-800",
    Donation: "bg-rose-100 text-rose-800",
    Reward: "bg-amber-100 text-amber-900",
    Equity: "bg-emerald-100 text-emerald-900",
    Loan: "bg-violet-100 text-violet-900",
    RBF: "bg-indigo-100 text-indigo-900",
  }[fundingType]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function InvestmentsPage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const role = useMemo(() => getRoleFromUserType(user?.type), [user?.type])
  const roleDetails = roleContent[role]

  const sidebarItems = useMemo(
    () => [
      { label: "Marketplace", icon: Store, helper: "All users" },
      { label: "My Dashboard", icon: LayoutDashboard, helper: role === "founder" ? "Founder" : role === "investor" ? "Investor" : "Public" },
      { label: "Messages / Q&A", icon: MessageSquare, helper: "Updates" },
      { label: "Reports", icon: FileText, helper: role === "investor" ? "Investor / admin" : "Preview" },
      { label: "Settings", icon: Settings, helper: "Profile + preferences" },
    ],
    [role],
  )

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              Investment Platform
            </Badge>
            <Badge variant="secondary">Frontend scaffold</Badge>
          </div>
          <h1 className="text-4xl font-bold text-slate">Tokuma Investments</h1>
          <p className="max-w-4xl text-muted-foreground">
            First-pass implementation of the attached wireframe: a persistent investment workspace with a public
            marketplace, role-based dashboarding, messages, reports, funding chips, and progress indicators.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-dark text-white shadow-lg">
              <CardHeader className="space-y-3">
                <Badge className="w-fit bg-white/15 text-white hover:bg-white/15">{roleDetails.title}</Badge>
                <CardTitle className="text-2xl leading-tight">Persistent investment shell</CardTitle>
                <CardDescription className="text-white/75">{roleDetails.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-white/80">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Avatar className="h-11 w-11 border border-white/20">
                    <AvatarFallback className="bg-white/10 text-white">
                      {user?.name?.slice(0, 2).toUpperCase() || "TK"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{user?.name || "Tokuma user"}</p>
                    <p className="text-xs uppercase tracking-wide text-white/60">{role}</p>
                  </div>
                </div>
                <p>
                  This shell mirrors the wireframe structure first and uses demo data so the visual container is in
                  place before backend workflows are connected.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sidebar</CardTitle>
                <CardDescription>Role-based navigation from the wireframe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border bg-white px-3 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3 text-slate">
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {item.helper}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Global UI components</CardTitle>
                <CardDescription>Status chips, funding badges, impact tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {statusChips.map((status) => (
                    <Badge key={status} variant="outline" className={cn("border", getStatusClassName(status))}>
                      {status}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Grant", "Donation", "Reward", "Equity", "Loan", "RBF"].map((type) => (
                    <Badge key={type} className={cn("font-medium", getFundingTypeClassName(type as Campaign["fundingType"]))}>
                      {type}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Sector", "Region", "SDG", "Impact theme"].map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            <Card className="border-primary/15">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-11 border-slate-200 pl-10"
                      placeholder="Global search (ventures, campaigns, founders, categories)"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button className="gap-2" disabled={role !== "founder"}>
                      <Plus className="h-4 w-4" />
                      {role === "founder" ? roleDetails.createLabel : "Create"}
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </Button>
                    <Button variant="outline" asChild className="bg-transparent">
                      <Link href="/profile">Profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardDescription>Live campaigns</CardDescription>
                    <CardTitle className="text-3xl">24</CardTitle>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Marketplace-first discovery with a public directory and status-aware filtering.
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardDescription>Capital in motion</CardDescription>
                    <CardTitle className="text-3xl">$6.4M</CardTitle>
                  </div>
                  <HandCoins className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Mix of grants, donations, rewards, equity, loans, and revenue-based finance.
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardDescription>Q&amp;A + milestones</CardDescription>
                    <CardTitle className="text-3xl">18</CardTitle>
                  </div>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Notifications aggregate campaign updates, diligence questions, milestones, and repayments.
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="marketplace" className="space-y-4">
              <TabsList>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="dashboard">{roleDetails.dashboardTitle}</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
                  <Card>
                    <CardHeader className="space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle>Marketplace campaign directory</CardTitle>
                          <CardDescription>
                            Public discovery view with campaign cards, funding badges, progress bars, and primary tags.
                          </CardDescription>
                        </div>
                        <Badge variant="outline">1) Marketplace</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["All funding types", "Circular economy", "Climate", "Atlanta", "Open data"].map((filter) => (
                          <Badge key={filter} variant="secondary">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {campaigns.map((campaign) => {
                        const progressValue = Math.min(100, Math.round((campaign.raised / campaign.target) * 100))

                        return (
                          <article key={campaign.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-slate">{campaign.name}</h3>
                                <p className="text-sm text-muted-foreground">{campaign.pitch}</p>
                              </div>
                              <Badge variant="outline" className={cn("border", getStatusClassName(campaign.status))}>
                                {campaign.status}
                              </Badge>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <Badge className={getFundingTypeClassName(campaign.fundingType)}>{campaign.fundingType}</Badge>
                              <span className="text-xs text-muted-foreground">Founder: {campaign.founder}</span>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate">{formatCurrency(campaign.raised)} raised</span>
                                <span className="text-muted-foreground">
                                  {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : "Closed window"}
                                </span>
                              </div>
                              <Progress value={progressValue} className="h-2.5" />
                              <div className="text-xs text-muted-foreground">
                                Target: {formatCurrency(campaign.target)} • {progressValue}% complete
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {campaign.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <Button variant="outline" size="sm" className="bg-transparent">
                                View campaign
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1 px-0 text-primary">
                                Open details
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </article>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Shell summary</CardTitle>
                        <CardDescription>Wireframe components translated into Tokuma sections</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                          <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                          <p>Global top bar for search, create, notifications, and user controls.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Wallet className="mt-0.5 h-4 w-4 text-primary" />
                          <p>Funding badges show structure at a glance across grants, equity, loans, and RBF.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Shield className="mt-0.5 h-4 w-4 text-primary" />
                          <p>Role-aware navigation anticipates investor, founder, and admin workflows.</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Messages / Q&amp;A</CardTitle>
                        <CardDescription>Campaign updates, diligence threads, milestones, repayments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {messageFeed.map((item, index) => (
                          <div key={item.title} className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.detail}</p>
                              </div>
                              <span className="whitespace-nowrap text-xs text-muted-foreground">{item.time}</span>
                            </div>
                            {index < messageFeed.length - 1 && <Separator />}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
                  <Card>
                    <CardHeader>
                      <CardTitle>{roleDetails.dashboardTitle}</CardTitle>
                      <CardDescription>Role-based dashboard container from the wireframe</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {roleDetails.dashboardPoints.map((point) => (
                        <div key={point} className="flex items-start gap-3 rounded-xl border p-3">
                          <LayoutDashboard className="mt-0.5 h-4 w-4 text-primary" />
                          <p className="text-sm text-muted-foreground">{point}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming milestones</CardTitle>
                      <CardDescription>Placeholder cards until live backend data is connected</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Manufacturing review", date: "Apr 09", status: "Under Review" },
                        { label: "Impact report upload", date: "Apr 12", status: "Live" },
                        { label: "Repayment checkpoint", date: "Apr 18", status: "Repaying" },
                      ].map((milestone) => (
                        <div key={milestone.label} className="rounded-xl border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-slate">{milestone.label}</p>
                            <Badge variant="outline" className={cn("border", getStatusClassName(milestone.status as CampaignStatus))}>
                              {milestone.status}
                            </Badge>
                          </div>
                          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="h-4 w-4" />
                            {milestone.date}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {reportCards.map((report) => (
                    <Card key={report.title}>
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <CardDescription>{report.title}</CardDescription>
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">{report.value}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">{report.detail}</CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Report center</CardTitle>
                    <CardDescription>Investor/admin export zone from the wireframe</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    {[
                      "Campaign performance report",
                      "Repayment schedule export",
                      "Impact theme distribution",
                      "Questions and diligence log",
                    ].map((reportName) => (
                      <div key={reportName} className="flex items-center justify-between rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-slate">{reportName}</span>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Preview
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
