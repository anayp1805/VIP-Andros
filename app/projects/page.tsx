"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { RequireRole } from "@/components/require-role"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Leaf, Users, Rocket } from "lucide-react"

interface Project {
  id: string
  title: string
  org: string
  summary: string
  theme: string
  fundedBy?: string
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    title: "",
    org: "",
    summary: "",
    theme: "",
  })

  const isOrg = useMemo(() => user && (user.type === "company" || user.type === "philanthropist"), [user])
  const isStudent = useMemo(() => user && (user.type === "user" || user.type === "philanthropist"), [user])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, description, category, created_by, current_amount, image_url")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[projects] load error", error)
      }

      const transformed =
        data?.map((p) => ({
          id: p.id,
          title: p.title,
          org: p.category || "Impact Project",
          summary: p.description,
          theme: p.category || "Impact",
          fundedBy: p.current_amount ? `Raised ${p.current_amount}` : undefined,
        })) || []

      setProjects(transformed)
      setLoading(false)
    }

    load()
  }, [])

  const createProject = async () => {
    if (!isOrg || !newProject.title || !newProject.org || !newProject.summary) return
    const supabase = createClient()
    const payload = {
      title: newProject.title,
      description: newProject.summary,
      category: newProject.theme || newProject.org,
      status: "active",
      created_by: user?.id,
    }
    const { data, error } = await supabase.from("projects").insert(payload).select("id")
    if (error) {
      console.error("[projects] create error", error)
      return
    }
    const insertedId = data?.[0]?.id || Math.random().toString(36).slice(2, 10)
    setProjects((prev) => [...prev, { ...newProject, id: insertedId }])
    setNewProject({ title: "", org: "", summary: "", theme: "" })
  }

  const applyToProject = async (projectId: string) => {
    if (!isStudent || !user) return
    const supabase = createClient()

    // Schema expects volunteer_id to reference philanthropists; only persist if philanthropist account exists
    if (user.type === "philanthropist") {
      const { data: philanthropistRow } = await supabase
        .from("philanthropists")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      let philanthropistId = philanthropistRow?.id
      if (!philanthropistId) {
        const { data, error } = await supabase
          .from("philanthropists")
          .insert({ user_id: user.id, full_name: user.name, email: user.email })
          .select("id")
          .maybeSingle()
        if (error) {
          console.error("[projects] philanthropist insert error", error)
          toast.error("Could not apply right now.", {
            description: error.message,
          })
          return
        }
        philanthropistId = data?.id
      }

      if (philanthropistId) {
        const { error } = await supabase.from("project_volunteers").insert({
          project_id: projectId,
          volunteer_id: philanthropistId,
          role: "participant",
        })

        if (error) {
          console.error("[projects] volunteer error", error)
          toast.error("Could not apply right now.", {
            description: error.message,
          })
        } else {
          toast.success("Applied to project.", {
            description: "Your application was saved in Supabase.",
          })
        }
      }
    } else {
      // Student flow (user table) not represented in schema FK; keep as placeholder
      toast.info("Application noted locally.", {
        description: "Schema expects philanthropists as volunteers.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <div className="container mx-auto px-4 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-primary">Projects</p>
          <h1 className="text-4xl font-bold text-slate">Funded projects for sustainable, circular outcomes</h1>
          <p className="text-muted-foreground max-w-3xl">
            Organizations post projects, students apply, and philanthropists fund and mentor. Separate from the
            marketplace to keep impact work focused on education, interoperability, and circular economy principles.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Browse Projects</CardTitle>
                <CardDescription>Students can apply to collaborate; philanthropists can fund.</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Leaf className="h-4 w-4 text-primary" />
                Sustainability focus
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading projects from Supabase...</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects posted yet.</p>
              ) : (
                projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.org}</p>
                    </div>
                    {project.fundedBy && <Badge variant="outline">Funded</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{project.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{project.theme || "Impact"}</Badge>
                    {project.fundedBy && <span>Supported by {project.fundedBy}</span>}
                  </div>
                  {isStudent && (
                    <Button size="sm" variant="outline" onClick={() => applyToProject(project.id)}>
                      Apply
                    </Button>
                  )}
                </div>
              )))}
            </CardContent>
          </Card>

          {isOrg ? (
            <RequireRole roles={["company", "philanthropist"]} fallback="/projects">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>Post a Project</CardTitle>
                    <CardDescription>Organizations and philanthropists can propose new initiatives.</CardDescription>
                  </div>
                  <Rocket className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      placeholder="Project title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                    <Input
                      placeholder="Organization name"
                      value={newProject.org}
                      onChange={(e) => setNewProject({ ...newProject, org: e.target.value })}
                    />
                    <Textarea
                      placeholder="Describe the project, partners, and expected impact"
                      value={newProject.summary}
                      onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                    />
                    <Input
                      placeholder="Theme (e.g., circular economy, education tech)"
                      value={newProject.theme}
                      onChange={(e) => setNewProject({ ...newProject, theme: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={createProject}>
                    Submit to Supabase
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Projects here are distinct from the marketplace. Funding flows from philanthropists, and students apply
                    to participate.
                  </p>
                </CardContent>
              </Card>
            </RequireRole>
          ) : (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Post a Project</CardTitle>
                  <CardDescription>Organizations and philanthropists can propose new initiatives.</CardDescription>
                </div>
                <Rocket className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sign in as a company or philanthropist to post projects. This keeps governance aligned with Tokuma&apos;s
                  nonprofit mission.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How it fits</CardTitle>
            <CardDescription>
              Education • Interoperability • Philanthropy anchored in sustainability and circular economy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Education: students gain applied experience on projects with measurable impact.</p>
            <p>Interoperability: open data and collaboration patterns keep projects portable across partners.</p>
            <p>Philanthropy: contributions fund build-out and ensure transparent reporting.</p>
          </CardContent>
        </Card>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
