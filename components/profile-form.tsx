"use client"

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react"
import { toast } from "sonner"
import { Camera, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const MAX_BIO_LENGTH = 500
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
const AVATAR_BUCKET = "user-avatars"

export function ProfileForm() {
  const { user, refreshUserProfile } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState(user?.name ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? "")
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Avatar must be an image file.")
      event.target.value = ""
      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Avatar image is too large.", {
        description: "Please choose an image under 2 MB.",
      })
      event.target.value = ""
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return user.avatarUrl ?? null

    const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "png"
    const path = `${user.id}/${Date.now()}.${extension}`
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, avatarFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: avatarFile.type,
    })

    if (error) throw error

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedBio = bio.trim()

    if (!trimmedName) {
      toast.error("Name is required.")
      return
    }

    if (trimmedBio.length > MAX_BIO_LENGTH) {
      toast.error("Bio is too long.", {
        description: `Please keep it under ${MAX_BIO_LENGTH} characters.`,
      })
      return
    }

    setSaving(true)

    try {
      const avatarUrl = await uploadAvatar()
      const { error } = await supabase
        .from("users")
        .update({
          name: trimmedName,
          bio: trimmedBio || null,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id)

      if (error) throw error

      await refreshUserProfile()
      setAvatarFile(null)
      if (avatarUrl) setAvatarPreview(avatarUrl)
      toast.success("Profile updated.", {
        description: "Your changes have been saved.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again."
      toast.error("Could not update profile.", {
        description: message,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
        <CardDescription>Update the details other Tokuma members see.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24">
              {avatarPreview && <AvatarImage src={avatarPreview} alt={`${user.name}'s avatar`} />}
              <AvatarFallback className="text-xl font-semibold">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "TU"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex items-center gap-2">
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} disabled={saving} />
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF, or WebP under 2 MB.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={user.email} readOnly disabled />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="profile-bio">Bio</Label>
              <span className="text-xs text-muted-foreground">
                {bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
            <Textarea
              id="profile-bio"
              value={bio}
              maxLength={MAX_BIO_LENGTH}
              onChange={(event) => setBio(event.target.value)}
              disabled={saving}
              placeholder="Share your background, interests, or organization focus."
              className="min-h-32"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
