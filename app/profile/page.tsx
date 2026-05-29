'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Target, TrendingUp, Clock, Flame, Star } from 'lucide-react'
import { UserProfile } from '@/lib/types/profile'
import { checkAndAddArraysBadge } from '@/lib/badges'
import { useUserStats } from '@/lib/hooks/useDatabase'
import { syncProfileWithDatabase } from '@/lib/database/profileSync'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Get userId from localStorage or generate one (client-side only)
  useEffect(() => {
    const getUserId = async () => {
      if (typeof window === 'undefined') return
      
      const saved = localStorage.getItem('userId')
      const localUserId = saved || `user-${Date.now()}`
      
      if (!saved) {
        localStorage.setItem('userId', localUserId)
      }
      
      // Ensure user exists in database
      try {
        const { ensureUserExists } = await import('@/lib/database/userManagement')
        const dbUserId = await ensureUserExists()
        setUserId(dbUserId)
      } catch (error) {
        console.error('Error ensuring user exists:', error)
        setUserId(localUserId)
      }
    }
    
    getUserId()
  }, [])

  const { stats: dbStats, loading: statsLoading } = useUserStats(userId)

  useEffect(() => {
    if (!userId) return
    // Load profile from localStorage and sync with database
    loadProfile()
  }, [dbStats, userId])

  // Check for new badges periodically
  useEffect(() => {
    if (!profile) return
    
    const interval = setInterval(() => {
      const updatedProfile = checkAndAddArraysBadge(profile)
      if (updatedProfile.badges.length !== profile.badges.length) {
        // New badge added, update profile
        setProfile(updatedProfile)
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
      }
    }, 3000) // Check every 3 seconds
    
    return () => clearInterval(interval)
  }, [profile])

  const loadProfile = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      
      // Load badges from database
      const { getUserBadgesFromDatabase, syncBadgesToDatabase } = await import('@/lib/database/badges')
      const dbBadges = await getUserBadgesFromDatabase(userId)
      
      // Try to load from localStorage first
      const savedProfile = localStorage.getItem('userProfile')
      let profileData: UserProfile
      
      if (savedProfile) {
        profileData = JSON.parse(savedProfile)
        // Merge database badges with local badges
        const badgeMap = new Map(dbBadges.map(b => [b.id, b]))
        profileData.badges.forEach(b => badgeMap.set(b.id, b))
        profileData.badges = Array.from(badgeMap.values())
      } else {
        // Create default profile
        profileData = {
          id: userId,
          username: 'Coder',
          displayName: 'Code Master',
          totalXP: 0,
          level: 1,
          rank: 999,
          badges: dbBadges,
          stats: {
            problemsSolved: 0,
            contestsWon: 0,
            duelsWon: 0,
            duelsLost: 0,
            marathonsCompleted: 0,
            averageTime: 0,
            longestStreak: 0,
            currentStreak: 0,
            totalTimeSpent: 0,
          },
          mastery: [],
          achievements: [],
          createdAt: new Date(),
          lastActive: new Date(),
        }
      }

      // Sync badges to database
      await syncBadgesToDatabase(userId, profileData.badges)

      // Sync with database if available
      try {
        profileData = await syncProfileWithDatabase(userId, profileData)
      } catch (error) {
        console.warn('Database sync failed, using local data:', error)
      }

      // Update with real-time database stats if available
      if (dbStats) {
        profileData.totalXP = dbStats.total_xp
        profileData.level = dbStats.level
        profileData.rank = dbStats.rank
        profileData.stats = {
          problemsSolved: dbStats.problems_solved,
          contestsWon: dbStats.contests_won,
          duelsWon: dbStats.duels_won,
          duelsLost: dbStats.duels_lost,
          marathonsCompleted: dbStats.marathons_completed,
          averageTime: dbStats.average_time_per_problem,
          longestStreak: dbStats.longest_streak,
          currentStreak: dbStats.current_streak,
          totalTimeSpent: profileData.stats.totalTimeSpent, // Keep from sync
        }
        if (dbStats.last_activity_date) {
          profileData.lastActive = new Date(dbStats.last_activity_date)
        }
      }

      // Set fake data for demo
      profileData.stats.problemsSolved = 10
      profileData.stats.currentStreak = 5
      profileData.stats.averageTime = 14
      profileData.stats.contestsWon = 1
      
      // Add Arrays badge if not already present
      const hasArraysBadge = profileData.badges.some((b: any) => b.id === 'arrays-master')
      if (!hasArraysBadge) {
        profileData.badges.push({
          id: 'arrays-master',
          name: 'Arrays Master',
          description: 'Completed all phases of the Arrays unit',
          icon: '🔢',
          earnedAt: new Date(),
          rarity: 'epic'
        })
      }

      // Check and add Arrays badge if unit is completed
      profileData = checkAndAddArraysBadge(profileData)
      
      // Sync new badges to database
      if (profileData.badges.length > (savedProfile ? JSON.parse(savedProfile).badges?.length || 0 : 0)) {
        await syncBadgesToDatabase(userId, profileData.badges)
      }
      
      // Save updated profile
      localStorage.setItem('userProfile', JSON.stringify(profileData))
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || statsLoading || !profile || !userId) {
    return <LoadingState label="Loading profile..." />
  }

  const levelProgress = (profile.totalXP % 1000) / 10 // Assuming 1000 XP per level
  const nextLevelXP = 1000 - (profile.totalXP % 1000)

  return (
    <main className="page-shell pt-24">
      <div className="page-container space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-primary text-5xl font-bold text-primary-foreground shadow-soft sm:h-32 sm:w-32 sm:text-6xl">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-background bg-success p-2">
                <Star className="w-6 h-6 text-success-foreground" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="mb-2 text-h2">{profile.displayName}</h1>
              <p className="mb-4 text-muted-foreground">@{profile.username}</p>
              {profile.bio && <p className="text-foreground/80">{profile.bio}</p>}
              
              {/* Level Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm text-muted-foreground">Level {profile.level}</span>
                  <span className="text-body-sm text-primary">{nextLevelXP} XP to Level {profile.level + 1}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-1/80 p-4 text-left lg:text-right">
              <div className="mb-2 text-h2 text-primary">{profile.totalXP}</div>
              <div className="text-muted-foreground">Total XP</div>
              <div className="mt-4 text-h4 text-accent">#{profile.rank}</div>
              <div className="text-muted-foreground">Global Rank</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="surface-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-success/10 p-3 text-success">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <div className="text-h3 text-success">{profile.stats.problemsSolved}</div>
                <div className="text-body-sm text-muted-foreground">Problems Solved</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="surface-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-accent/10 p-3 text-accent">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <div className="text-h3 text-accent">{profile.stats.contestsWon}</div>
                <div className="text-body-sm text-muted-foreground">Contests Won</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="surface-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Flame className="h-8 w-8" />
              </div>
              <div>
                <div className="text-h3 text-primary">{profile.stats.currentStreak}</div>
                <div className="text-body-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="surface-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-info/10 p-3 text-info">
                <Clock className="h-8 w-8" />
              </div>
              <div>
                <div className="text-h3 text-info">{Math.round(profile.stats.averageTime)}</div>
                <div className="text-body-sm text-muted-foreground">Avg Time (min)</div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="surface-card p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-h4">
            <Award className="h-6 w-6 text-warning" />
            Badges
            {profile.badges.length > 0 && (
              <span className="ml-2 text-body-sm text-muted-foreground">({profile.badges.length})</span>
            )}
          </h2>
          {profile.badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {profile.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  className="relative rounded-2xl border border-border bg-card/80 p-4 text-center shadow-soft transition-colors hover:border-primary/60"
                >
                  {badge.rarity === 'epic' && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-accent" />
                  )}
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="text-body-sm font-bold">{badge.name}</div>
                  <div className={`text-xs mt-1 ${
                    badge.rarity === 'epic' ? 'text-accent' :
                    badge.rarity === 'rare' ? 'text-primary' :
                    badge.rarity === 'legendary' ? 'text-warning' :
                    'text-muted-foreground'
                  }`}>
                    {badge.rarity}
                  </div>
                  <div className="mt-1 text-caption text-muted-foreground">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No badges earned yet"
              description="Complete units to earn badges and show progress on your profile."
            />
          )}
        </motion.div>

        {profile.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="surface-card p-6"
          >
            <h2 className="mb-4 flex items-center gap-2 text-h4">
              <TrendingUp className="h-6 w-6 text-success" />
              Achievements
            </h2>
            <div className="space-y-3">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold">{achievement.name}</div>
                    <div className="text-body-sm text-muted-foreground">{achievement.description}</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-body-sm text-muted-foreground">
                    {achievement.progress} / {achievement.maxProgress}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
