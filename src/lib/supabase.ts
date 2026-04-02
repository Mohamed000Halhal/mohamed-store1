import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper to ensure a profile image URL is always a full, valid Supabase URL.
 * If the input is just a filename, it constructs the full path.
 */
export const getProfileImageUrl = (path: string | null | undefined) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  
  // If it's just a filename or relative path, prepend the base storage URL
  // Assuming it's in the 'avatars' bucket under 'profile-images/' folder
  return `${supabaseUrl}/storage/v1/object/public/avatars/profile-images/${path}`
}
