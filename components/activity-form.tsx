"use client"

import type React from "react"
import { useState } from "react"
import type { Activity } from "@/lib/activities-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Calendar, Upload } from "lucide-react"

interface ActivityFormProps {
  activity?: Activity
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ActivityForm({ activity, onSubmit, onCancel }: ActivityFormProps) {
  const [title, setTitle] = useState(activity?.title || "")
  const [tagline, setTagline] = useState(activity?.tagline || "")
  const [experienceDescription, setExperienceDescription] = useState(activity?.experienceDescription || "")
  const [price, setPrice] = useState(activity?.price.toString() || "")
  const [pricePer, setPricePer] = useState(activity?.pricePer || "person")
  const [duration, setDuration] = useState(activity?.duration || "")
  const [capacity, setCapacity] = useState(activity?.capacity.toString() || "10")
  const [included, setIncluded] = useState<string[]>(activity?.included || [])
  const [newIncluded, setNewIncluded] = useState("")
  const [whatToBring, setWhatToBring] = useState<string[]>(activity?.whatToBring || [])
  const [newWhatToBring, setNewWhatToBring] = useState("")
  const [images, setImages] = useState<string[]>(activity?.images || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isAvailable, setIsAvailable] = useState(activity?.isAvailable ?? true)
  const [availability, setAvailability] = useState(
    activity?.availability || [
      {
        date: "",
        slots: [{ time: "", capacity: 10, booked: 0 }],
      },
    ],
  )
  const [ourStory, setOurStory] = useState(activity?.ourStory || "")
  const [ourStoryImage, setOurStoryImage] = useState(activity?.ourStoryImage || "")

  const addIncluded = () => {
    if (newIncluded.trim()) {
      setIncluded([...included, newIncluded.trim()])
      setNewIncluded("")
    }
  }

  const removeIncluded = (index: number) => {
    setIncluded(included.filter((_, i) => i !== index))
  }

  const addWhatToBring = () => {
    if (newWhatToBring.trim()) {
      setWhatToBring([...whatToBring, newWhatToBring.trim()])
      setNewWhatToBring("")
    }
  }

  const removeWhatToBring = (index: number) => {
    setWhatToBring(whatToBring.filter((_, i) => i !== index))
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setImages((prev) => [...prev, base64String])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleOurStoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setOurStoryImage(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const addAvailabilityDate = () => {
    setAvailability([
      ...availability,
      {
        date: "",
        slots: [{ time: "", capacity: Number.parseInt(capacity) || 10, booked: 0 }],
      },
    ])
  }

  const removeAvailabilityDate = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const updateAvailabilityDate = (index: number, date: string) => {
    const updated = [...availability]
    updated[index].date = date
    setAvailability(updated)
  }

  const addTimeSlot = (dateIndex: number) => {
    const updated = [...availability]
    updated[dateIndex].slots.push({ time: "", capacity: Number.parseInt(capacity) || 10, booked: 0 })
    setAvailability(updated)
  }

  const removeTimeSlot = (dateIndex: number, slotIndex: number) => {
    const updated = [...availability]
    updated[dateIndex].slots = updated[dateIndex].slots.filter((_, i) => i !== slotIndex)
    setAvailability(updated)
  }

  const updateTimeSlot = (dateIndex: number, slotIndex: number, time: string) => {
    const updated = [...availability]
    updated[dateIndex].slots[slotIndex].time = time
    setAvailability(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const activityData = {
      title,
      tagline,
      experienceDescription,
      price: Number.parseFloat(price),
      pricePer,
      duration,
      capacity: Number.parseInt(capacity) || 10,
      included,
      whatToBring,
      images,
      isAvailable,
      availability: availability.filter((av) => av.date && av.slots.some((s) => s.time)),
      ourStory,
      ourStoryImage,
    }

    onSubmit(activityData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Package Title */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Package Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  required
                />
                <p className="text-xs text-muted-foreground">Short and Sweet.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="A brief catchy description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Max Capacity */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Label htmlFor="capacity">Max Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => {
                  setCapacity(e.target.value)
                  const newCapacity = Number.parseInt(e.target.value) || 10
                  setAvailability(
                    availability.map((av) => ({
                      ...av,
                      slots: av.slots.map((s) => ({ ...s, capacity: newCapacity })),
                    })),
                  )
                }}
                placeholder="Max Number of Guests per Price"
                required
              />
              <p className="text-xs text-muted-foreground">e.g. 5, 10, 20+, unlimited...</p>
            </CardContent>
          </Card>

          {/* Price */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Cost of Package"
                  required
                />
                <p className="text-xs text-muted-foreground">Input a number.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePer">Per *</Label>
                <Input
                  id="pricePer"
                  value={pricePer}
                  onChange={(e) => setPricePer(e.target.value)}
                  placeholder="Price per..."
                  required
                />
                <p className="text-xs text-muted-foreground">e.g. total, person, kayak, lesson...</p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Status</Label>
                  <p className="text-sm text-muted-foreground">{isAvailable ? "available" : "unavailable"}</p>
                </div>
                <Switch id="status" checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* What you'll do */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="experience">What you'll do *</Label>
                <Textarea
                  id="experience"
                  value={experienceDescription}
                  onChange={(e) => setExperienceDescription(e.target.value)}
                  placeholder="Describe the experience in detail..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">Describe the experience.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">How long will it be *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="0.5, 1, 2, 5 hrs"
                    required
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Total time</span>
                </div>
                <p className="text-xs text-muted-foreground">e.g. 45 minutes for ..., and 1 hr for ...</p>
                <p className="text-xs text-muted-foreground font-medium">Must enter in hours</p>
              </div>
            </CardContent>
          </Card>

          {/* What is included */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>What is included</Label>
                <div className="flex gap-2">
                  <Input
                    value={newIncluded}
                    onChange={(e) => setNewIncluded(e.target.value)}
                    placeholder="e.g. drinks, food, etc..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addIncluded()
                      }
                    }}
                  />
                  <Button type="button" onClick={addIncluded} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {included.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {included.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeIncluded(idx)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* What to bring */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>What to bring</Label>
                <div className="flex gap-2">
                  <Input
                    value={newWhatToBring}
                    onChange={(e) => setNewWhatToBring(e.target.value)}
                    placeholder="e.g. sunscreen, driver's license, snacks, water"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addWhatToBring()
                      }
                    }}
                  />
                  <Button type="button" onClick={addWhatToBring} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {whatToBring.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {whatToBring.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeWhatToBring(idx)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Images - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Choose File</p>
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
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addImage()
                  }
                }}
              />
              <Button type="button" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div className="relative h-32 w-full bg-muted rounded-md overflow-hidden">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Add multiple images to create a gallery. The first image will be the cover image.
          </p>
        </CardContent>
      </Card>

      {/* Availability - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Availability & Time Slots</CardTitle>
            <Button type="button" onClick={addAvailabilityDate} variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Add Date
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {availability.map((av, dateIdx) => (
            <div key={dateIdx} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor={`date-${dateIdx}`}>Date</Label>
                  <Input
                    id={`date-${dateIdx}`}
                    type="date"
                    value={av.date}
                    onChange={(e) => updateAvailabilityDate(dateIdx, e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAvailabilityDate(dateIdx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Time Slots</Label>
                {av.slots.map((slot, slotIdx) => (
                  <div key={slotIdx} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateTimeSlot(dateIdx, slotIdx, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeSlot(dateIdx, slotIdx)}
                      disabled={av.slots.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addTimeSlot(dateIdx)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Our Story - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
          <p className="text-sm text-muted-foreground">Share the story behind your business</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Story Text Area */}
          <div className="space-y-2">
            <Label htmlFor="our-story">What is the story behind your business? *</Label>
            <Textarea
              id="our-story"
              value={ourStory}
              onChange={(e) => setOurStory(e.target.value)}
              placeholder="Describe your business — what you do, why you serve, and the story behind it."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describe your business — what you do, why you serve, and the story behind it.
            </p>
          </div>

          {/* Story Image Upload */}
          <div className="space-y-4">
            <Label>Image for About Us Section</Label>
            
            {/* File Upload */}
            <div className="space-y-4">
              <Label htmlFor="story-file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Choose File</p>
                    <p className="text-xs text-muted-foreground">(Upload images (JPG, PNG, etc.))</p>
                  </div>
                </div>
                <Input
                  id="story-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleOurStoryImageUpload}
                  className="hidden"
                />
              </Label>

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
                  value={ourStoryImage && !ourStoryImage.startsWith('data:') ? ourStoryImage : ''}
                  onChange={(e) => setOurStoryImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    const input = document.querySelector('input[type="url"]') as HTMLInputElement
                    if (input?.value) setOurStoryImage(input.value)
                  }}
                  disabled={!ourStoryImage || ourStoryImage.startsWith('data:')}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Image Preview */}
            {ourStoryImage && (
              <div className="relative">
                <div className="relative h-48 w-full bg-muted rounded-md overflow-hidden">
                  <img
                    src={ourStoryImage || "/placeholder.svg"}
                    alt="Our Story Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOurStoryImage("")}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Upload an image that represents your business and its story.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center pb-8">
        <Button type="submit" size="lg" className="bg-ocean-blue hover:bg-ocean-dark min-w-[200px]">
          {activity ? "Update Activity" : "Submit"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
