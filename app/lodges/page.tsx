"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Search, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Lodge {
  id: string
  name: string
  businessDescription?: string
  location?: string
  businessImages?: string[]
  tagline?: string
}

export default function LodgesPage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [lodges, setLodges] = useState<Lodge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLodges()
  }, [])

  const fetchLodges = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'company')
        .eq('business_type', 'lodge')

      if (error) throw error

      if (data) {
        setLodges(data.map(lodge => ({
          id: lodge.id,
          name: lodge.name,
          businessDescription: lodge.business_description,
          location: lodge.location,
          businessImages: lodge.business_images || [],
          tagline: lodge.tagline,
        })))
      }
    } catch (error) {
      console.error('Error fetching lodges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLodges = lodges.filter((lodge) => {
    const query = searchQuery.toLowerCase()
    const name = lodge.name?.toLowerCase() || ""
    const description = lodge.businessDescription?.toLowerCase() || ""
    const location = lodge.location?.toLowerCase() || ""
    const tagline = lodge.tagline?.toLowerCase() || ""

    return name.includes(query) || description.includes(query) || location.includes(query) || tagline.includes(query)
  })

  return (
    <div className="min-h-screen bg-sand">
      <Navbar onAuthClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean-blue to-ocean-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 text-balance">Discover Amazing Lodges</h1>
          <p className="text-xl mb-8 text-balance max-w-2xl mx-auto">
            Find your perfect accommodation from trusted lodge providers
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate" />
            <Input
              type="text"
              placeholder="Search for lodges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white text-slate"
            />
          </div>
        </div>
      </section>

      {/* Lodges List */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate">Lodges & Accommodations</h2>
          <p className="text-muted-foreground">{filteredLodges.length} lodges found</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading lodges...</p>
          </div>
        ) : filteredLodges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No lodges found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLodges.map((lodge) => (
              <Card key={lodge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full bg-muted">
                  {lodge.businessImages && lodge.businessImages.length > 0 ? (
                    <Image
                      src={lodge.businessImages[0] || "/placeholder.svg"}
                      alt={lodge.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{lodge.name}</CardTitle>
                  {lodge.tagline && (
                    <p className="text-sm text-slate-light italic">{lodge.tagline}</p>
                  )}
                  {lodge.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lodge.location}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  {lodge.businessDescription && (
                    <p className="text-sm text-slate-light line-clamp-3 mb-4">
                      {lodge.businessDescription}
                    </p>
                  )}
                  <Button asChild className="w-full bg-ocean-blue hover:bg-ocean-dark text-white">
                    <Link href={`/business/${lodge.id}`}>View Lodge</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
