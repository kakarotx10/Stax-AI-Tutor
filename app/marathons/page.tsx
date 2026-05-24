'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, Users, Zap, Trophy } from 'lucide-react'
import { Marathon } from '@/lib/types/contests'
import { Domain, DOMAINS } from '@/lib/subjects'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function MarathonsPage() {
  const [marathons, setMarathons] = useState<Marathon[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all')

  useEffect(() => {
    loadMarathons()
    // Auto-seed if no marathons exist
    const checkAndSeed = async () => {
      const response = await axios.get('/api/marathons')
      if (response.data.marathons.length === 0) {
        try {
          await axios.get('/api/marathons/seed')
          loadMarathons()
        } catch (error) {
          console.error('Error seeding marathons:', error)
        }
      }
    }
    checkAndSeed()
    // Polling disabled - replication is off
  }, [])

  const loadMarathons = async () => {
    try {
      const url = domainFilter !== 'all' 
        ? `/api/marathons?domain=${domainFilter}`
        : '/api/marathons'
      const response = await axios.get(url)
      const serverMarathons: Marathon[] = response.data.marathons || []

      if (serverMarathons.length === 0) {
        const now = new Date()
        const day = 24 * 60 * 60 * 1000
        const fallback: Marathon[] = [
          {
            id: 'sample-marathon-placement',
            title: 'Placement Prep Marathon',
            description: 'A 24-hour DSA + CS fundamentals marathon.',
            status: 'active',
            startDate: now,
            endDate: new Date(now.getTime() + day),
            xpMultiplier: 3,
            duration: 24,
            domain: 'placement',
            problems: [],
            participants: 150,
            leaderboard: [],
          },
          {
            id: 'sample-marathon-frontend',
            title: 'Frontend Weekend Sprint',
            description: '48-hour React/JS marathon with UI challenges.',
            status: 'upcoming',
            startDate: new Date(now.getTime() + 2 * day),
            endDate: new Date(now.getTime() + 4 * day),
            xpMultiplier: 2.5,
            duration: 48,
            domain: 'frontend',
            problems: [],
            participants: 90,
            leaderboard: [],
          },
          {
            id: 'sample-marathon-backend',
            title: 'Backend Weekly Challenge',
            description: '7-day API + database marathon for backend devs.',
            status: 'upcoming',
            startDate: new Date(now.getTime() + 7 * day),
            endDate: new Date(now.getTime() + 14 * day),
            xpMultiplier: 2,
            duration: 168,
            domain: 'backend',
            problems: [],
            participants: 70,
            leaderboard: [],
          },
        ]

        setMarathons(fallback)
      } else {
        setMarathons(serverMarathons)
      }
    } catch (error: any) {
      console.error('Error loading marathons:', error)
      toast.error('Failed to load marathons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarathons()
  }, [domainFilter])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marathons...</p>
        </div>
      </div>
    )
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
            <Flame className="w-12 h-12 text-neon-orange" />
            Coding Marathons
          </h1>
          <p className="text-xl text-muted-foreground">Extended coding sessions with massive XP multipliers!</p>
        </motion.div>

        {/* Domain Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-neon-cyan">Filter by Domain</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDomainFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                domainFilter === 'all'
                  ? 'bg-neon-cyan text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-card/80'
              }`}
            >
              All Domains
            </button>
            {(Object.keys(DOMAINS) as Domain[]).map(domainId => {
              const domain = DOMAINS[domainId]
              return (
                <button
                  key={domainId}
                  onClick={() => setDomainFilter(domainId)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    domainFilter === domainId
                      ? 'bg-neon-cyan text-primary-foreground'
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

        {/* Marathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marathons.map((marathon, idx) => (
            <motion.div
              key={marathon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 hover: transition-transform"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    marathon.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                    marathon.status === 'upcoming' ? 'bg-neon-cyan/20 text-neon-cyan' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {marathon.status.toUpperCase()}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple">
                    {DOMAINS[marathon.domain]?.icon} {DOMAINS[marathon.domain]?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-neon-orange">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">{marathon.xpMultiplier}x XP</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">{marathon.title}</h2>
              <p className="text-muted-foreground mb-4">{marathon.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-neon-purple" />
                  <span className="text-foreground/80">{marathon.duration} hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  <span className="text-foreground/80">{marathon.participants} participants</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-neon-yellow" />
                  <span className="text-foreground/80">{marathon.xpMultiplier}x XP Multiplier</span>
                </div>
              </div>

              <Link href={`/marathons/${marathon.id}`}>
                <button className="btn-primary w-full">
                  {marathon.status === 'active' ? 'Join Marathon' : 'View Details'}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}










