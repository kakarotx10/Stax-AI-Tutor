'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, Trophy, Clock, User, UserPlus, Search } from 'lucide-react'
import { Standoff } from '@/lib/types/contests'
import { Domain } from '@/lib/subjects'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import {
  CompetitionHeader,
  DomainFilterBar,
  ModeTabs,
} from '@/components/competition/CompetitionUI'

const standoffTabs = [
  { value: 'find' as const, label: 'Find Match', icon: Search },
  { value: 'active' as const, label: 'Active Standoffs', icon: Users },
  { value: 'history' as const, label: 'History', icon: Clock },
]

export default function StandoffsPage() {
  const router = useRouter()
  const [standoffs, setStandoffs] = useState<Standoff[]>([])
  const [activeTab, setActiveTab] = useState<'find' | 'active' | 'history'>('find')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [findingMatch, setFindingMatch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<Domain>('placement')

  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initUser = async () => {
      if (typeof window === 'undefined') return
      const { ensureUserExists } = await import('@/lib/database/userManagement')
      const dbUserId = await ensureUserExists()
      setUserId(dbUserId)
    }
    initUser()
  }, [])

  useEffect(() => {
    if (userId && (activeTab === 'active' || activeTab === 'history')) {
      loadStandoffs()
    }
  }, [activeTab, userId])

  const loadStandoffs = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const type = activeTab === 'history' ? 'history' : 'active'
      const response = await axios.get(`/api/standoffs/user/${userId}?type=${type}`)
      setStandoffs(response.data.standoffs || [])
    } catch (error: any) {
      console.error('Error loading standoffs:', error)
      toast.error('Failed to load standoffs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    setCreatingTeam(true)
    try {
      const response = await axios.post('/api/standoffs/create-team', { 
        userId,
        domain: selectedDomain
      })
      toast.success('Team created! Waiting for members...')
      setCreatingTeam(false)
      // Navigate to team page or show team details
    } catch (error: any) {
      console.error('Error creating team:', error)
      toast.error('Failed to create team')
      setCreatingTeam(false)
    }
  }

  const handleFindMatch = async () => {
    setFindingMatch(true)
    try {
      // This would find a match for an existing team
      toast('Finding match...')
      setTimeout(() => {
        setFindingMatch(false)
        toast.success('Match found!')
      }, 2000)
    } catch (error: any) {
      console.error('Error finding match:', error)
      toast.error('Failed to find match')
      setFindingMatch(false)
    }
  }

  return (
    <main className="page-shell pt-24">
      <div className="page-container space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CompetitionHeader
            icon={Users}
            title="3v3 Standoffs"
            description="Form a small team and queue for a timed group battle."
          />
        </motion.div>

        <ModeTabs tabs={standoffTabs} value={activeTab} onChange={setActiveTab} />

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'find' && (
            <motion.div
              key="find"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[10px] border border-border bg-card p-6 shadow-card sm:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                  <div className="text-left">
                    <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary shadow-soft">
                      <Users className="h-9 w-9" />
                    </span>
                    <h2 className="text-h2 text-foreground">Ready for Team Battle?</h2>
                    <p className="mt-3 max-w-xl text-body-lg text-muted-foreground">
                      Create a three-person squad, pick a domain, and enter the team queue.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[1, 2, 3].map((num) => (
                        <motion.div
                          key={num}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: num * 0.1 }}
                          className="rounded-[8px] border border-border bg-surface-1 p-3 text-center"
                        >
                          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </span>
                          <p className="mt-2 text-caption uppercase text-muted-foreground">Member {num}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-border bg-surface-1 p-4 shadow-soft sm:p-5">
                    <DomainFilterBar
                      selectedDomain={selectedDomain}
                      onSelect={(domain) => {
                        if (domain !== 'all') setSelectedDomain(domain)
                      }}
                      label="Select Domain"
                      includeAll={false}
                    />

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={handleCreateTeam}
                        disabled={creatingTeam}
                        className="h-12 flex-1 text-base"
                      >
                        <UserPlus className="h-5 w-5" />
                        {creatingTeam ? 'Creating Team...' : 'Create Team'}
                      </Button>
                      <Button
                        onClick={handleFindMatch}
                        disabled={findingMatch}
                        variant="secondary"
                        className="h-12 flex-1 text-base"
                      >
                        <Search className="h-5 w-5" />
                        {findingMatch ? 'Finding Match...' : 'Find Random Match'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="rounded-[10px] border border-border bg-card p-8 text-center shadow-card">
                  <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">Loading active standoffs...</p>
                </div>
              ) : standoffs.length === 0 ? (
                <div className="rounded-[10px] border border-border bg-card p-8 text-center shadow-card">
                  <Clock className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active standoffs</p>
                </div>
              ) : (
                standoffs.map((standoff) => (
                  <motion.div
                    key={standoff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer rounded-[10px] border border-border bg-card p-5 shadow-card transition hover:border-primary/60 hover:bg-muted/30"
                    onClick={() => router.push(`/standoffs/${standoff.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Team Battle</h3>
                        <p className="text-muted-foreground mb-2">{standoff.problem.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground/80">
                          <span>Team 1: {standoff.team1.length}/3</span>
                          <span>vs</span>
                          <span>Team 2: {standoff.team2.length}/3</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-primary">{standoff.xpReward} XP</div>
                        <div className="text-sm text-muted-foreground">Reward</div>
                        <div className="mt-2 text-xs font-semibold text-success">Active</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="rounded-[10px] border border-border bg-card p-8 text-center shadow-card">
                  <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">Loading standoff history...</p>
                </div>
              ) : standoffs.length === 0 ? (
                <div className="rounded-[10px] border border-border bg-card p-8 text-center shadow-card">
                  <Trophy className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No standoff history yet</p>
                </div>
              ) : (
                standoffs.map((standoff) => (
                  <motion.div
                    key={standoff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-[10px] border border-border bg-card p-5 shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {standoff.winnerTeam && userId && standoff.team1.includes(userId) && standoff.winnerTeam === 1 ? (
                          <Trophy className="h-12 w-12 text-warning" />
                        ) : (
                          <Users className="w-12 h-12 text-muted-foreground/60" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold mb-1">Team Battle</h3>
                          <p className="text-muted-foreground">{standoff.problem.title}</p>
                          <p className="text-sm text-muted-foreground/80 mt-1">
                            {standoff.endTime?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {standoff.winnerTeam && userId && standoff.team1.includes(userId) && standoff.winnerTeam === 1 ? (
                          <div className="font-semibold text-success">Victory!</div>
                        ) : (
                          <div className="text-muted-foreground/80">Completed</div>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">{standoff.xpReward} XP</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
