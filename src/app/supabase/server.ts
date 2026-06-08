import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export function createApiClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll() {},
      },
    }
  )
}

export async function requireAuth(req: NextRequest) {
  const supabase = createApiClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}
