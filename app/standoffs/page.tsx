'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, Trophy, Clock, Zap, UserPlus, Search, Sparkles } from 'lucide-react'
import { Standoff } from '@/lib/types/contests'
import { Domain, DOMAINS } from '@/lib/subjects'
import toast from 'react-hot-toast'
import axios from 'axios'

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
      toast('Finding match...', { icon: '🔍' })
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold neon-text mb-4 flex items-center gap-3">
            <Users className="w-12 h-12 text-neon-purple" />
            3v3 Standoffs
          </h1>
          <p className="text-xl text-muted-foreground">Team up and compete in epic 3v3 battles!</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'find'
                ? 'bg-neon-purple text-foreground'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            Find Match
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-neon-purple text-foreground'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            Active Standoffs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-neon-purple text-foreground'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            History
          </button>
        </div>

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
                className="glass-card p-12 text-center relative overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      x: [0, 50, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      x: [0, -50, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="inline-block mb-8"
                  >
                    <Users className="w-32 h-32 text-neon-purple drop-shadow-card" />
                  </motion.div>

                  <h2 className="text-4xl font-bold mb-4 neon-text">Ready for Team Battle?</h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
                    Form a team of 3 and compete against other teams! The team that solves the problem fastest wins!
                  </p>

                  {/* Domain Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold mb-3 text-neon-cyan">Select Domain</label>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {(Object.keys(DOMAINS) as Domain[]).map(domainId => {
                        const domain = DOMAINS[domainId]
                        return (
                          <button
                            key={domainId}
                            onClick={() => setSelectedDomain(domainId)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                              selectedDomain === domainId
                                ? 'bg-neon-purple text-foreground'
                                : 'bg-card text-muted-foreground hover:bg-card/80'
                            }`}
                          >
                            <span>{domain.icon}</span>
                            <span>{domain.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Team Formation Display */}
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
                    {[1, 2, 3].map((num) => (
                      <motion.div
                        key={num}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: num * 0.1 }}
                        className="glass-card p-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-2xl font-bold mx-auto mb-2">
                          {num === 1 ? '👤' : num === 2 ? '👤' : '👤'}
                        </div>
                        <p className="text-sm text-muted-foreground">Member {num}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-6 justify-center">
                    <motion.button
                      onClick={handleCreateTeam}
                      disabled={creatingTeam}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary text-lg px-10 py-5 flex items-center gap-3 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <UserPlus className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">
                        {creatingTeam ? 'Creating Team...' : 'Create Team'}
                      </span>
                    </motion.button>
                    <motion.button
                      onClick={handleFindMatch}
                      disabled={findingMatch}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary text-lg px-10 py-5 flex items-center gap-3"
                    >
                      <Search className="w-6 h-6" />
                      {findingMatch ? 'Finding Match...' : 'Find Random Match'}
                    </motion.button>
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
                <div className="glass-card p-8 text-center">
                  <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading active standoffs...</p>
                </div>
              ) : standoffs.length === 0 ? (
                <div className="glass-card p-8 text-center">
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
                    className="glass-card p-6 cursor-pointer"
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
                        <div className="text-neon-purple font-bold text-xl">{standoff.xpReward} XP</div>
                        <div className="text-sm text-muted-foreground">Reward</div>
                        <div className="mt-2 text-xs text-neon-green">Active</div>
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
                <div className="glass-card p-8 text-center">
                  <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading standoff history...</p>
                </div>
              ) : standoffs.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No standoff history yet</p>
                </div>
              ) : (
                standoffs.map((standoff) => (
                  <motion.div
                    key={standoff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {standoff.winnerTeam && userId && standoff.team1.includes(userId) && standoff.winnerTeam === 1 ? (
                          <Trophy className="w-12 h-12 text-neon-yellow" />
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
                          <div className="text-neon-green font-bold">Victory!</div>
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
    </div>
  )
}
