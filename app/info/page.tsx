"use client"

import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Share2, HeartHandshake } from "lucide-react"

export default function InfoPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-primary">About Tokuma</p>
          <h1 className="text-4xl font-bold text-slate">A nonprofit platform built on three pillars</h1>
          <p className="text-muted-foreground max-w-3xl">
            Tokuma advances education, interoperability, and philanthropy with a focus on sustainability and the circular
            economy. We connect students, organizations, and philanthropists to build long-term impact together.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-primary" />
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Hands-on learning through projects, mentorship, and responsible business training.</p>
              <p>Supports company onboarding with tailored learning paths and future curricula.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-primary" />
              <CardTitle>Interoperability</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Open standards for data, credentials, and funding flows so partners can collaborate.</p>
              <p>Marketplace, projects, and philanthropy spaces remain modular but connected.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-3">
              <HeartHandshake className="h-5 w-5 text-primary" />
              <CardTitle>Philanthropy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Invite-only philanthropist network with access-controlled signup and collaboration tools.</p>
              <p>Funds flow to projects and education while reinforcing circular, sustainable outcomes.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sustainability & Circular Economy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Tokuma prioritizes reuse, repair, resource efficiency, and transparent impact metrics across all products.
            </p>
            <p>Students, companies, and philanthropists share accountability for long-term environmental outcomes.</p>
            <p>Programs are designed for durability, equitable access, and measurable community benefit.</p>
          </CardContent>
        </Card>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
