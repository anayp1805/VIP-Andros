import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  // Get auth token from cookies and refresh if needed
  const authToken = request.cookies.get("sb-access-token")?.value
  if (authToken) {
    const {
      data: { user },
    } = await supabase.auth.getUser(authToken)
    if (user) {
      // Token is valid, continue
      return supabaseResponse
    }
  }

  return supabaseResponse
}
