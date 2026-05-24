'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Clock, Zap, MapPin, Award } from 'lucide-react'
import { Contest, ContestLevel } from '@/lib/types/contests'
import { Domain, DOMAINS } from '@/lib/subjects'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<ContestLevel | 'all'>('all')
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all')

  useEffect(() => {
    loadContests()
    // Auto-seed if no contests exist
    const checkAndSeed = async () => {
      const response = await axios.get('/api/contests')
      if (response.data.contests.length === 0) {
        try {
          await axios.get('/api/contests/seed')
          loadContests()
        } catch (error) {
          console.error('Error seeding contests:', error)
        }
      }
    }
    checkAndSeed()
    // Polling disabled - replication is off
  }, [])

  const loadContests = async () => {
    try {
      const url = domainFilter !== 'all' 
        ? `/api/contests?domain=${domainFilter}`
        : '/api/contests'
      const response = await axios.get(url)
      const serverContests: Contest[] = response.data.contests || []

      if (serverContests.length === 0) {
        // Fallback sample contests by domain/level when Supabase is unavailable
        const now = new Date()
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        const fallback: Contest[] = [
          {
            id: 'sample-contest-placement',
            title: 'Placement DSA Showdown',
            description: 'Solve core DSA problems for product-based interviews.',
            level: 'city',
            status: 'active',
            startDate: now,
            endDate: new Date(now.getTime() + sevenDays),
            xpMultiplier: 1.5,
            participants: 120,
            maxParticipants: 500,
            domain: 'placement',
            problems: [],
            leaderboard: [],
          },
          {
            id: 'sample-contest-frontend',
            title: 'Frontend UI Battle',
            description: 'React/JS challenges focused on UI and performance.',
            level: 'state',
            status: 'upcoming',
            startDate: new Date(now.getTime() + sevenDays),
            endDate: new Date(now.getTime() + 2 * sevenDays),
            xpMultiplier: 2,
            participants: 80,
            maxParticipants: 400,
            domain: 'frontend',
            problems: [],
            leaderboard: [],
          },
          {
            id: 'sample-contest-backend',
            title: 'Backend API Challenge',
            description: 'Design and optimise APIs and database queries.',
            level: 'national',
            status: 'upcoming',
            startDate: new Date(now.getTime() + 2 * sevenDays),
            endDate: new Date(now.getTime() + 3 * sevenDays),
            xpMultiplier: 3,
            participants: 60,
            maxParticipants: 300,
            domain: 'backend',
            problems: [],
            leaderboard: [],
          },
        ]

        setContests(fallback)
      } else {
        setContests(serverContests)
      }
    } catch (error: any) {
      console.error('Error loading contests:', error)
      toast.error('Failed to load contests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContests()
  }, [domainFilter])

  const getLevelColor = (level: ContestLevel) => {
    switch (level) {
      case 'city':
        return 'text-neon-green'
      case 'state':
        return 'text-neon-cyan'
      case 'national':
        return 'text-neon-purple'
    }
  }

  const getLevelBg = (level: ContestLevel) => {
    switch (level) {
      case 'city':
        return 'bg-neon-green/20 border-neon-green'
      case 'state':
        return 'bg-neon-cyan/20 border-neon-cyan'
      case 'national':
        return 'bg-neon-purple/20 border-neon-purple'
    }
  }

  const filteredContests = contests.filter(c => {
    const levelMatch = levelFilter === 'all' || c.level === levelFilter
    const domainMatch = domainFilter === 'all' || c.domain === domainFilter
    return levelMatch && domainMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">Contests</h1>
          <p className="page-description">Compete and climb the leaderboards.</p>
        </motion.div>

        {/* Domain Filters */}
        <div className="mb-6">
          <h3 className="mb-3 text-body-sm font-semibold text-muted-foreground">Filter by Domain</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={() => setDomainFilter('all')}
              variant={domainFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
            >
              All Domains
            </Button>
            {(Object.keys(DOMAINS) as Domain[]).map(domainId => {
              const domain = DOMAINS[domainId]
              return (
                <Button
                  key={domainId}
                  onClick={() => setDomainFilter(domainId)}
                  variant={domainFilter === domainId ? 'primary' : 'outline'}
                  size="sm"
                >
                  <span>{domain.icon}</span>
                  <span>{domain.name}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Level Filters */}
        <div className="mb-6">
          <h3 className="mb-3 text-body-sm font-semibold text-muted-foreground">Filter by Level</h3>
          <div className="flex gap-3">
            <Button
              onClick={() => setLevelFilter('all')}
              variant={levelFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
            >
              All Levels
            </Button>
            <Button
              onClick={() => setLevelFilter('city')}
              variant={levelFilter === 'city' ? 'primary' : 'outline'}
              size="sm"
            >
              City
            </Button>
            <Button
              onClick={() => setLevelFilter('state')}
              variant={levelFilter === 'state' ? 'primary' : 'outline'}
              size="sm"
            >
              State
            </Button>
            <Button
              onClick={() => setLevelFilter('national')}
              variant={levelFilter === 'national' ? 'primary' : 'outline'}
              size="sm"
            >
              National
            </Button>
          </div>
        </div>

        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest, idx) => (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card cursor-pointer p-6 transition-colors hover:border-primary/60"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelBg(contest.level)} ${getLevelColor(contest.level)}`}>
                    {contest.level.toUpperCase()}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple">
                    {DOMAINS[contest.domain]?.icon} {DOMAINS[contest.domain]?.name}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  contest.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                  contest.status === 'upcoming' ? 'bg-neon-cyan/20 text-neon-cyan' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {contest.status.toUpperCase()}
                </div>
              </div>

              <h2 className="mb-2 text-h4">{contest.title}</h2>
              <p className="mb-4 text-muted-foreground">{contest.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  <span className="text-muted-foreground">{contest.participants} / {contest.maxParticipants} participants</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-neon-yellow" />
                  <span className="text-muted-foreground">{contest.xpMultiplier}x XP Multiplier</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-neon-purple" />
                  <span className="text-muted-foreground">
                    {contest.status === 'active' ? 'Ends in ' : 'Starts in '}
                    {Math.ceil((new Date(contest.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>

              <Link href={`/contests/${contest.id}`}>
                <Button className="w-full">
                  {contest.status === 'active' ? 'Join Contest' : 'View Details'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}









