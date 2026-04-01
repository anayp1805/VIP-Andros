"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Globe2, Users, HeartHandshake, Layers, ArrowRight } from "lucide-react"

const highlights = [
  {
    title: "Learn & build",
    desc: "Hands-on activities and circular-economy experiences hosted by vetted partners.",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: "Collaborate",
    desc: "Students, organizations, and philanthropists co-design projects with clear outcomes.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Fund impact",
    desc: "Directed donations and project funding with transparent tracking.",
    icon: <HeartHandshake className="h-5 w-5" />,
  },
  {
    title: "Interoperability",
    desc: "Open data mindset so your work and learnings move across teams and tools.",
    icon: <Globe2 className="h-5 w-5" />,
  },
]

export default function WelcomePage() {
  const { user } = useAuth()
  const [ctaHref, setCtaHref] = useState("/activities")

  useEffect(() => {
    if (!user) {
      setCtaHref("/activities")
    } else if (user.type === "philanthropist") {
      setCtaHref("/philanthropy")
    } else if (user.type === "company") {
      setCtaHref("/dashboard")
    } else {
      setCtaHref("/activities")
    }
  }, [user])

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => {}} />

      <section className="bg-gradient-to-br from-ocean-blue to-ocean-dark text-white py-20">
        <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="bg-white/15 text-white border-white/30">
              Welcome to Tokuma
            </Badge>
            <h1 className="text-5xl font-bold leading-tight text-balance">
              Build sustainable impact with learning, collaboration, and philanthropy in one place.
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Tokuma connects learners, organizations, and philanthropists to create circular-economy projects, fund what
              matters, and track outcomes together.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-white text-ocean-dark hover:bg-white/90">
                <a href={ctaHref}>Get started</a>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-white/15 text-white border border-white/50 hover:bg-white/25"
              >
                <a href="/activities">Explore activities</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <Card key={item.title} className="bg-white/10 border-white/20 text-white">
                <CardHeader className="flex-row items-center gap-3 pb-2">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">{item.icon}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-white/80">{item.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>Find and book experiences aligned to sustainability and circular economy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" asChild className="px-0 text-ocean-blue">
              <a href="/activities" className="flex items-center gap-2">
                Browse activities <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Submit or apply to projects that advance education and interoperability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" asChild className="px-0 text-ocean-blue">
              <a href="/projects" className="flex items-center gap-2">
                See projects <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investments</CardTitle>
            <CardDescription>Discover ventures, compare funding structures, and preview investor workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" asChild className="px-0 text-ocean-blue">
              <a href="/investments" className="flex items-center gap-2">
                Open investments <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Philanthropy</CardTitle>
            <CardDescription>Invite-only space to coordinate funding and measure results.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" asChild className="px-0 text-ocean-blue">
              <a href="/philanthropy" className="flex items-center gap-2">
                Open philanthropy <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Why Tokuma?</CardTitle>
              <CardDescription>Education • Interoperability • Philanthropy</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-slate">Education</p>
              <p>Real-world experiences that upskill students and teams.</p>
            </div>
            <div>
              <p className="font-semibold text-slate">Interoperability</p>
              <p>Shared standards and data so work is portable across partners.</p>
            </div>
            <div>
              <p className="font-semibold text-slate">Philanthropy</p>
              <p>Transparent funding flows and reporting to measure outcomes.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
