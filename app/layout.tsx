import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, Nunito } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ActivitiesProvider } from "@/lib/activities-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-display",
})
const nunito = Nunito({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-button",
})

export const metadata: Metadata = {
  title: "Andros - Activity Booking Platform",
  description: "Book amazing activities or list your experiences",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable} ${nunito.variable}`}>
        <AuthProvider>
          <ActivitiesProvider>{children}</ActivitiesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
