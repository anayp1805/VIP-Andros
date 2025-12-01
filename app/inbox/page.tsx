"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  User,
} from "lucide-react"

type RequestStatus = "open" | "closed"

type ConnectRequest = {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  companyId: string
  companyName: string
  questions: string
  notes: string | null
  status: RequestStatus
  createdAt: string
}

export default function InboxPage() {
  const { user } = useAuth()
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [requests, setRequests] = useState<ConnectRequest[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("open")
  const [loading, setLoading] = useState(true)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
    } catch (error) {
      console.error("[inbox] Failed to create Supabase client:", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user || user.type !== "company") return

    const mapRequest = (row: any): ConnectRequest => ({
      id: row.id,
      userId: row.user_id ?? null,
      firstName: row.first_name ?? "",
      lastName: row.last_name ?? "",
      email: row.email ?? "",
      phone: row.phone ?? null,
      companyId: row.company_id,
      companyName: row.company_name ?? "",
      questions: row.questions ?? "",
      notes: row.notes ?? null,
      status: (row.status as RequestStatus) || "open",
      createdAt: row.created_at,
    })

    const fetchRequests = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("connect_requests")
          .select("*")
          .eq("company_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[inbox] Error fetching connect requests:", error)
          setLoading(false)
          return
        }

        const mapped = data?.map(mapRequest) || []
        setRequests(mapped)
        if (mapped.length > 0 && !selectedId) {
          setSelectedId(mapped[0].id)
        }
      } catch (error) {
        console.error("[inbox] Unexpected error fetching requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()

    const channel = supabase
      .channel(`connect-requests:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connect_requests",
          filter: `company_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const mapped = mapRequest(payload.new)
            setRequests((prev) => {
              const exists = prev.find((req) => req.id === mapped.id)
              if (exists) return prev
              return [mapped, ...prev]
            })
            setSelectedId((prev) => prev || mapped.id)
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const mapped = mapRequest(payload.new)
            setRequests((prev) => prev.map((req) => (req.id === mapped.id ? mapped : req)))
          } else if (payload.eventType === "DELETE" && payload.old) {
            setRequests((prev) => prev.filter((req) => req.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  const filteredRequests = useMemo(() => {
    const term = search.toLowerCase()
    return requests.filter((req) => {
      const matchesStatus = filterStatus === "all" || req.status === filterStatus
      const matchesSearch =
        !term ||
        `${req.firstName} ${req.lastName} ${req.email} ${req.questions} ${req.notes ?? ""}`
          .toLowerCase()
          .includes(term)
      return matchesStatus && matchesSearch
    })
  }, [filterStatus, requests, search])

  const selectedRequest = useMemo(
    () => requests.find((req) => req.id === selectedId) || filteredRequests[0],
    [filteredRequests, requests, selectedId],
  )

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    if (!supabase) return
    setStatusUpdatingId(id)
    try {
      const { error } = await supabase.from("connect_requests").update({ status }).eq("id", id)
      if (error) {
        console.error("[inbox] Failed to update status:", error)
      }
    } catch (error) {
      console.error("[inbox] Unexpected error updating status:", error)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold">Company Inbox</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Sign in as a company to view and respond to Connect requests in real time.
          </p>
          <Button onClick={() => setShowAuthModal(true)}>Sign in</Button>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  if (user.type !== "company") {
    return (
      <div className="min-h-screen bg-sand">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold">Company Inbox</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This view is only available for company accounts.
          </p>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Inbox</p>
            <h1 className="text-3xl font-bold">Messages from travelers</h1>
            <p className="text-muted-foreground">
              New Connect submissions arrive here instantly. Search, filter, and reply from one place.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-5 w-5" />
            <span>{requests.length} total</span>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-[70vh] flex flex-col">
          <CardHeader className="space-y-4">
            <CardTitle>Messages</CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or question..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "open", "closed"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading messages...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm px-6 text-center">
                No messages match your filters.
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {filteredRequests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => setSelectedId(request.id)}
                      className={`w-full text-left px-4 py-3 transition ${
                        selectedRequest?.id === request.id ? "bg-primary/5" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {request.firstName} {request.lastName}
                          </p>
                        </div>
                        <Badge variant={request.status === "open" ? "secondary" : "outline"}>
                          {request.status === "open" ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{request.questions}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 h-[70vh] flex flex-col">
          {selectedRequest ? (
            <>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <h2 className="text-2xl font-semibold">
                      {selectedRequest.firstName} {selectedRequest.lastName}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedRequest.status === "open" ? "secondary" : "outline"}>
                      {selectedRequest.status === "open" ? "Open" : "Closed"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={statusUpdatingId === selectedRequest.id}
                      onClick={() =>
                        handleStatusChange(
                          selectedRequest.id,
                          selectedRequest.status === "open" ? "closed" : "open",
                        )
                      }
                    >
                      {statusUpdatingId === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : selectedRequest.status === "open" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Mark closed
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" /> Reopen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedRequest.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-1 space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <h3 className="font-semibold mb-3">Contact</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a className="text-primary hover:underline" href={`mailto:${selectedRequest.email}`}>
                          {selectedRequest.email}
                        </a>
                      </div>
                      {selectedRequest.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <a className="text-primary hover:underline" href={`tel:${selectedRequest.phone}`}>
                            {selectedRequest.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedRequest.notes && (
                    <div className="p-4 rounded-lg bg-muted">
                      <h3 className="font-semibold mb-2">Additional Notes</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="p-4 rounded-lg border bg-white h-full">
                    <h3 className="font-semibold mb-2">Questions / Concerns</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{selectedRequest.questions}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <Inbox className="h-4 w-4" />
                    Replies are managed outside this demo. Mark messages closed when you have responded.
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a message to view its details.
            </div>
          )}
        </Card>
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
