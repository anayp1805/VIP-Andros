"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { ChevronsUpDown, Loader2, Mail, Phone, Send } from "lucide-react"

type CompanyOption = { id: string; name: string }

export default function ConnectPage() {
  const { user } = useAuth()
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([])
  const [companySearch, setCompanySearch] = useState("")
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    questions: "",
    notes: "",
  })

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
    } catch (error) {
      console.error("[connect] Failed to create Supabase client:", error)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const [first, ...rest] = (user.name || "").split(" ")
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || first || "",
      lastName: prev.lastName || rest.join(" "),
      email: prev.email || user.email,
    }))
  }, [user])

  useEffect(() => {
    if (!supabase) return
    const handler = setTimeout(async () => {
      try {
        setCompanyLoading(true)
        const { data, error } = await supabase
          .from("users")
          .select("id, name")
          .eq("user_type", "company")
          .ilike("name", `%${companySearch || ""}%`)
          .order("name", { ascending: true })
          .limit(10)

        if (error) {
          console.error("[connect] Error searching companies:", error)
          return
        }

        setCompanyOptions(data?.map((row) => ({ id: row.id, name: row.name })) || [])
      } catch (error) {
        console.error("[connect] Unexpected error loading companies:", error)
      } finally {
        setCompanyLoading(false)
      }
    }, 250)

    return () => clearTimeout(handler)
  }, [companySearch, supabase])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!selectedCompany) newErrors.company = "Choose a company to contact"
    if (!formData.questions.trim()) newErrors.questions = "Please add your question or concern"
    return newErrors
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase) return

    const validation = validate()
    setErrors(validation)
    setStatus(null)
    if (Object.keys(validation).length > 0) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("connect_requests").insert({
        user_id: user?.id ?? null,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        company_id: selectedCompany?.id,
        company_name: selectedCompany?.name,
        questions: formData.questions.trim(),
        notes: formData.notes.trim() || null,
        status: "open",
      })

      if (error) {
        console.error("[connect] Failed to submit request:", error)
        setStatus({ type: "error", message: "Could not send your request. Please try again." })
        return
      }

      setStatus({ type: "success", message: "Request sent! The company will reach out shortly." })
      setFormData((prev) => ({
        ...prev,
        questions: "",
        notes: "",
      }))
    } catch (error) {
      console.error("[connect] Unexpected error submitting request:", error)
      setStatus({ type: "error", message: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusColor = useMemo(
    () => (status?.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"),
    [status],
  )

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <section className="bg-gradient-to-r from-ocean-blue to-ocean-dark text-white py-14">
        <div className="container mx-auto px-4 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">Connect</p>
          <h1 className="text-4xl md:text-5xl font-bold">Get in touch with a business.</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Ask questions, plan custom experiences, and hear directly from companies across the Bahamas.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tell us what you need</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Jamie"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                    {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                    {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <div className="relative">
                      <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={companyOpen}
                        className="w-full justify-between"
                      >
                        {selectedCompany ? selectedCompany.name : "Search for a company"}
                        {companyLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-60" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput
                          value={companySearch}
                          onValueChange={setCompanySearch}
                          placeholder="Start typing a company name..."
                        />
                        <CommandList>
                          <CommandEmpty>
                            {companyLoading ? "Searching companies..." : "No companies found"}
                          </CommandEmpty>
                          <CommandGroup>
                            {companyOptions.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.name}
                                onSelect={() => {
                                  setSelectedCompany(company)
                                  setCompanyOpen(false)
                                }}
                              >
                                {company.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll route your message directly to the selected company.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questions">Questions or concerns</Label>
                  <Textarea
                    id="questions"
                    placeholder="What would you like to ask?"
                    rows={4}
                    value={formData.questions}
                    onChange={(e) => updateField("questions", e.target.value)}
                  />
                  {errors.questions && <p className="text-sm text-red-600">{errors.questions}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Share any extra context or preferences"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Submissions are delivered instantly to the company inbox.
                  </p>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending
                      </>
                    ) : (
                      <>
                        Send Request <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {status && (
            <Alert className={statusColor}>
              <AlertTitle>{status.type === "success" ? "Request sent" : "Something went wrong"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">1. Submit</p>
                <p>Your details are sent to the chosen company instantly.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">2. Routed via our secure database</p>
                <p>Requests are stored securely and streamed in real time.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">3. Company replies</p>
                <p>They&apos;ll contact you directly from their Andros inbox.</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
