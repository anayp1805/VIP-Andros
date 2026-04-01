"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Upload } from "lucide-react"

interface RoomType {
  id: string
  name: string
  description: string
  maxOccupancy: number
  bedTypes: string
  nightlyRate: string
  amenities: string[]
  images: string[]
}

interface LodgeProfileData {
  name: string
  tagline: string
  description: string
  location: string
  contactEmail: string
  contactPhone: string
  website: string
  externalBookingLink: string
  roomTypes: RoomType[]
  amenities: string[]
  images: string[]
  checkInTime: string
  checkOutTime: string
  cancellationPolicy: string
  minimumStay: string
  houseRules: string
  ourStory: string
  ourStoryImage: string
}

interface LodgeProfileFormProps {
  initialData?: Partial<LodgeProfileData>
  onSubmit: (data: LodgeProfileData) => void
  onCancel: () => void
  onBusinessTypeChange?: (type: 'activity' | 'lodge') => void
}

const COMMON_AMENITIES = [
  "Free WiFi",
  "Pool",
  "Kayak Use",
  "Airport Pickup",
  "Breakfast Included",
  "Restaurant On Site",
  "Spa Services",
  "Beach Access",
  "Nature Trails",
  "Bar/Lounge",
  "Gym/Fitness Center",
  "Parking",
  "Air Conditioning",
  "Pet Friendly",
  "Laundry Service",
]

export function LodgeProfileForm({ initialData, onSubmit, onCancel, onBusinessTypeChange }: LodgeProfileFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [tagline, setTagline] = useState(initialData?.tagline || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || "")
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || "")
  const [website, setWebsite] = useState(initialData?.website || "")
  const [externalBookingLink, setExternalBookingLink] = useState(initialData?.externalBookingLink || "")
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialData?.roomTypes || [])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || [])
  const [customAmenity, setCustomAmenity] = useState("")
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [checkInTime, setCheckInTime] = useState(initialData?.checkInTime || "")
  const [checkOutTime, setCheckOutTime] = useState(initialData?.checkOutTime || "")
  const [cancellationPolicy, setCancellationPolicy] = useState(initialData?.cancellationPolicy || "")
  const [minimumStay, setMinimumStay] = useState(initialData?.minimumStay || "")
  const [houseRules, setHouseRules] = useState(initialData?.houseRules || "")
  const [ourStory, setOurStory] = useState(initialData?.ourStory || "")
  const [ourStoryImage, setOurStoryImage] = useState(initialData?.ourStoryImage || "")

  const addRoomType = () => {
    const newRoom: RoomType = {
      id: Date.now().toString(),
      name: "",
      description: "",
      maxOccupancy: 2,
      bedTypes: "",
      nightlyRate: "",
      amenities: [],
      images: [],
    }
    setRoomTypes([...roomTypes, newRoom])
  }

  const removeRoomType = (id: string) => {
    setRoomTypes(roomTypes.filter((room) => room.id !== id))
  }

  const updateRoomType = (id: string, field: keyof RoomType, value: any) => {
    setRoomTypes(
      roomTypes.map((room) => (room.id === id ? { ...room, [field]: value } : room))
    )
  }

  const addRoomAmenity = (roomId: string, amenity: string) => {
    if (!amenity.trim()) return
    setRoomTypes(
      roomTypes.map((room) =>
        room.id === roomId ? { ...room, amenities: [...room.amenities, amenity.trim()] } : room
      )
    )
  }

  const removeRoomAmenity = (roomId: string, index: number) => {
    setRoomTypes(
      roomTypes.map((room) =>
        room.id === roomId ? { ...room, amenities: room.amenities.filter((_, i) => i !== index) } : room
      )
    )
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities([...selectedAmenities, customAmenity.trim()])
      setCustomAmenity("")
    }
  }

  const removeCustomAmenity = (amenity: string) => {
    setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImages((prev) => [...prev, base64String])
      }
      
      reader.readAsDataURL(file)
    }
    
    e.target.value = ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lodgeData: LodgeProfileData = {
      name,
      tagline,
      description,
      location,
      contactEmail,
      contactPhone,
      website,
      externalBookingLink,
      roomTypes,
      amenities: selectedAmenities,
      images,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      minimumStay,
      houseRules,
      ourStory,
      ourStoryImage,
    }

    onSubmit(lodgeData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
      {onBusinessTypeChange && (
        <Card>
          <CardHeader>
            <CardTitle>Business Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="business-type">What type of business are you? *</Label>
              <select
                id="business-type"
                value="lodge"
                onChange={(e) => onBusinessTypeChange(e.target.value as 'activity' | 'lodge')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="activity">Activity Provider (Tours, Excursions)</option>
                <option value="lodge">Lodge/Accommodation</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Lodges get a full profile page with tabs. Activity providers get a simple business page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Lodge Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cove Haven Eco-Lodge"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short marketing phrase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your lodge, what makes it special..."
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. North Andros, Bahamas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (242) 555-0123"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@yourlodge.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourlodge.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalBookingLink">External Booking Link</Label>
            <Input
              id="externalBookingLink"
              type="url"
              value={externalBookingLink}
              onChange={(e) => setExternalBookingLink(e.target.value)}
              placeholder="https://yourlodge.com/book or your PMS booking link"
            />
            <p className="text-xs text-muted-foreground">
              Link to your booking system (ResNexus, Cloudbeds, Airbnb, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Room Types / Accommodations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Add the different room types you offer</p>
            </div>
            <Button type="button" onClick={addRoomType} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Room Type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {roomTypes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No room types added yet. Click "Add Room Type" to get started.
            </p>
          ) : (
            roomTypes.map((room, index) => (
              <div key={room.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Room Type {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRoomType(room.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Name *</Label>
                    <Input
                      value={room.name}
                      onChange={(e) => updateRoomType(room.id, "name", e.target.value)}
                      placeholder="e.g. Deluxe Waterfront Room"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Occupancy *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={room.maxOccupancy}
                      onChange={(e) => updateRoomType(room.id, "maxOccupancy", parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Room Description</Label>
                  <Textarea
                    value={room.description}
                    onChange={(e) => updateRoomType(room.id, "description", e.target.value)}
                    placeholder="Describe this room type..."
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bed Types</Label>
                    <Input
                      value={room.bedTypes}
                      onChange={(e) => updateRoomType(room.id, "bedTypes", e.target.value)}
                      placeholder="e.g. 1 King or 2 Queens"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nightly Rate (optional)</Label>
                    <Input
                      type="number"
                      value={room.nightlyRate}
                      onChange={(e) => updateRoomType(room.id, "nightlyRate", e.target.value)}
                      placeholder="250"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank if using external booking</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Room Amenities</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Private balcony, Ocean view..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addRoomAmenity(room.id, e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        addRoomAmenity(room.id, input.value)
                        input.value = ""
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {room.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                          <span className="text-sm">{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeRoomAmenity(room.id, idx)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lodge Amenities</CardTitle>
          <p className="text-sm text-muted-foreground">Select all amenities your lodge offers</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {COMMON_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={amenity} className="cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Add Custom Amenity</Label>
            <div className="flex gap-2">
              <Input
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Enter custom amenity..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomAmenity()
                  }
                }}
              />
              <Button type="button" onClick={addCustomAmenity} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedAmenities.filter((a) => !COMMON_AMENITIES.includes(a)).length > 0 && (
            <div className="space-y-2">
              <Label>Custom Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {selectedAmenities
                  .filter((a) => !COMMON_AMENITIES.includes(a))
                  .map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                      <span className="text-sm">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomAmenity(amenity)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lodge Images</CardTitle>
          <p className="text-sm text-muted-foreground">Add 10-20 images. First image will be the cover.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Choose Files or Drag & Drop</p>
                      <p className="text-xs text-muted-foreground">Upload images (JPG, PNG, etc.)</p>
                    </div>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or add image URL</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addImage()
                  }
                }}
              />
              <Button type="button" onClick={addImage} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Lodge image ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 bg-ocean-blue text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policies & Important Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <Input
                id="checkInTime"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumStay">Minimum Stay</Label>
            <Input
              id="minimumStay"
              value={minimumStay}
              onChange={(e) => setMinimumStay(e.target.value)}
              placeholder="e.g. 2 nights, 1 week"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              placeholder="Describe your cancellation policy..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="houseRules">House Rules</Label>
            <Textarea
              id="houseRules"
              value={houseRules}
              onChange={(e) => setHouseRules(e.target.value)}
              placeholder="List your house rules..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
          <p className="text-sm text-muted-foreground">Share the story behind your lodge</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ourStory">Your Story</Label>
            <Textarea
              id="ourStory"
              value={ourStory}
              onChange={(e) => setOurStory(e.target.value)}
              placeholder="Tell guests about your lodge's history, mission, values..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ourStoryImage">Story Image URL</Label>
            <Input
              id="ourStoryImage"
              type="url"
              value={ourStoryImage}
              onChange={(e) => setOurStoryImage(e.target.value)}
              placeholder="https://example.com/story-image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-ocean-blue hover:bg-ocean-dark">
          Save Lodge Profile
        </Button>
      </div>
    </form>
  )
}
