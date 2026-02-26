import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ActivitiesProvider } from "@/lib/activities-context"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Tokuma - Sustainability-First Platform",
  description: "Tokuma connects learners, organizations, and philanthropists to build sustainable, circular-economy impact.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <AuthProvider>
          <ActivitiesProvider>{children}</ActivitiesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
