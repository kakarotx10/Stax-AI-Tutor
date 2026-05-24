// Badge Management System
import { Badge } from '@/lib/types/profile'
import { SUBJECTS } from './subjects'

/**
 * Check if Arrays unit is completed
 * A unit is considered completed when all subtopics are marked as completed
 */
export function isArraysUnitCompleted(): boolean {
  try {
    // Check completion from localStorage
    const completedSubtopics = localStorage.getItem('completedSubtopics')
    if (!completedSubtopics) return false

    const subtopics = JSON.parse(completedSubtopics)
    
    // Get Arrays unit
    const arraysUnit = SUBJECTS.dsa.units.find(u => u.id === 'arrays')
    if (!arraysUnit) return false

    // Check if all subtopics are completed
    const allCompleted = arraysUnit.subtopics.every(subtopic => subtopics[subtopic.id])
    
    return allCompleted
  } catch (error) {
    console.error('Error checking Arrays completion:', error)
    return false
  }
}

/**
 * Get Arrays completion badge
 */
export function getArraysBadge(): Badge {
  return {
    id: 'arrays-master',
    name: 'Arrays Master',
    description: 'Completed all phases of the Arrays unit',
    icon: '🔢',
    earnedAt: new Date(),
    rarity: 'epic'
  }
}

/**
 * Check and add Arrays badge to profile if unit is completed
 */
export function checkAndAddArraysBadge(profile: any): any {
  if (!profile) return profile

  // Check if Arrays unit is completed
  const isCompleted = isArraysUnitCompleted()
  
  // Check if badge already exists
  const hasBadge = profile.badges?.some((b: Badge) => b.id === 'arrays-master')
  
  if (isCompleted && !hasBadge) {
    // Add the badge
    const newBadge = getArraysBadge()
    const updatedProfile = {
      ...profile,
      badges: [...(profile.badges || []), newBadge]
    }
    
    // Sync badge to database if possible
    if (typeof window !== 'undefined') {
      import('@/lib/database/badges').then(({ saveBadgeToDatabase }) => {
        const userId = localStorage.getItem('dbUserId') || localStorage.getItem('userId')
        if (userId) {
          saveBadgeToDatabase(userId, newBadge).catch(console.error)
        }
      })
    }
    
    return updatedProfile
  }

  return profile
}

