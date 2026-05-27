'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Clock, Zap } from 'lucide-react'
import { Contest, ContestLevel } from '@/lib/types/contests'
import { Domain } from '@/lib/subjects'
import Link from 'next/link'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import {
  CompetitionHeader,
  DomainBadge,
  DomainFilterBar,
  MetricRow,
  StatusBadge,
} from '@/components/competition/CompetitionUI'

const levelFilters: Array<{ value: ContestLevel | 'all'; label: string }> = [
  { value: 'all', label: 'All Levels' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'national', label: 'National' },
]

const levelBadgeStyles: Record<ContestLevel, string> = {
  city: 'border-success/30 bg-success/10 text-success',
  state: 'border-info/30 bg-info/10 text-info',
  national: 'border-primary/30 bg-primary/10 text-primary',
}

function getFallbackContests(): Contest[] {
  const now = new Date()
  const sevenDays = 7 * 24 * 60 * 60 * 1000

  return [
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
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<ContestLevel | 'all'>('all')
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all')

  useEffect(() => {
    loadContests()
    // Auto-seed if no contests exist
    const checkAndSeed = async () => {
      try {
        const response = await axios.get('/api/contests')
        if (response.data.contests.length === 0) {
          await axios.get('/api/contests/seed')
          loadContests()
        }
      } catch (error) {
        console.error('Error checking contests:', error)
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
        setContests(getFallbackContests())
      } else {
        setContests(serverContests)
      }
    } catch (error: any) {
      console.error('Error loading contests:', error)
      setContests(getFallbackContests())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContests()
  }, [domainFilter])

  const filteredContests = contests.filter(c => {
    const levelMatch = levelFilter === 'all' || c.level === levelFilter
    const domainMatch = domainFilter === 'all' || c.domain === domainFilter
    return levelMatch && domainMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="page-shell pt-24">
      <div className="page-container space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CompetitionHeader
            icon={Trophy}
            title="Contests"
            description="Pick a live bracket, solve under pressure, and climb the leaderboard."
          />
        </motion.div>

        <section className="grid gap-5 rounded-[10px] border border-border bg-surface-1 p-4 shadow-soft lg:grid-cols-[1fr_auto] lg:items-end">
          <DomainFilterBar selectedDomain={domainFilter} onSelect={setDomainFilter} />
          <div className="space-y-3">
            <h3 className="text-caption font-semibold uppercase text-muted-foreground">Filter by Level</h3>
            <div className="flex flex-wrap gap-2">
              {levelFilters.map((level) => (
                <Button
                  key={level.value}
                  type="button"
                  onClick={() => setLevelFilter(level.value)}
                  variant={levelFilter === level.value ? 'primary' : 'outline'}
                  size="sm"
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredContests.map((contest, idx) => (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex h-full flex-col rounded-[10px] border border-border bg-card p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/30"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold ${levelBadgeStyles[contest.level]}`}>
                    {contest.level.toUpperCase()}
                  </span>
                  <DomainBadge domain={contest.domain} />
                </div>
                <StatusBadge status={contest.status} />
              </div>

              <h2 className="text-h4 text-foreground">{contest.title}</h2>
              <p className="mt-2 min-h-[3.1rem] text-body text-muted-foreground">{contest.description}</p>

              <div className="my-5 space-y-2">
                <MetricRow icon={Users} tone="info">
                  {contest.participants} / {contest.maxParticipants} participants
                </MetricRow>
                <MetricRow icon={Zap} tone="warning">
                  {contest.xpMultiplier}x XP multiplier
                </MetricRow>
                <MetricRow icon={Clock} tone="primary">
                  {contest.status === 'active' ? 'Ends in ' : 'Starts in '}
                  {Math.ceil((new Date(contest.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                </MetricRow>
              </div>

              <Button asChild className="mt-auto w-full">
                <Link href={`/contests/${contest.id}`}>
                  {contest.status === 'active' ? 'Join Contest' : 'View Details'}
                </Link>
              </Button>
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  )
}



