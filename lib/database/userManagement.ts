// User management utilities - ensures users exist in database with proper UUIDs
import { supabase, isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase'

/**
 * Get or create a user in the database
 * Returns the UUID of the user
 * Works on both client and server
 */
export async function getOrCreateUser(localStorageUserId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return localStorageUserId // Fallback to localStorage ID if no database
  }

  // Use admin client for server-side, regular client for client-side
  const client = typeof window === 'undefined' ? getSupabaseAdmin() : supabase
  
  if (!client) {
    return localStorageUserId
  }

  try {
    // Check if user exists by username (using localStorage ID as username)
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('username', localStorageUserId)
      .single()

    if (existingUser) {
      return existingUser.id
    }

    // Create new user with proper UUID
    const { data: newUser, error } = await client
      .from('users')
      .insert({
        username: localStorageUserId,
        display_name: `User ${localStorageUserId.split('-')[1] || 'Anonymous'}`,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error || !newUser) {
      console.error('Error creating user:', error)
      return localStorageUserId // Fallback
    }

    return newUser.id
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    return localStorageUserId // Fallback
  }
}

/**
 * Get user ID from localStorage and ensure it exists in database
 */
export async function ensureUserExists(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'temp-user' // SSR fallback
  }

  let sessionUserId: string | null = null
  try {
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    sessionUserId = session?.user?.id ?? null
  } catch {
    sessionUserId = null
  }

  const saved = localStorage.getItem('userId')
  const localStorageUserId = sessionUserId || saved || `user-${Date.now()}`
  
  if (!sessionUserId && !saved) {
    localStorage.setItem('userId', localStorageUserId)
  }

  // Get or create user in database
  const dbUserId = await getOrCreateUser(localStorageUserId)
  
  // Store mapping if different
  if (dbUserId !== localStorageUserId) {
    localStorage.setItem('dbUserId', dbUserId)
  }

  return dbUserId
}
