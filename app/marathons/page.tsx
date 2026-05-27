'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, Users, Zap } from 'lucide-react'
import { Marathon } from '@/lib/types/contests'
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

function getFallbackMarathons(): Marathon[] {
  const now = new Date()
  const day = 24 * 60 * 60 * 1000

  return [
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
}

export default function MarathonsPage() {
  const [marathons, setMarathons] = useState<Marathon[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all')

  useEffect(() => {
    loadMarathons()
    // Auto-seed if no marathons exist
    const checkAndSeed = async () => {
      try {
        const response = await axios.get('/api/marathons')
        if (response.data.marathons.length === 0) {
          await axios.get('/api/marathons/seed')
          loadMarathons()
        }
      } catch (error) {
        console.error('Error checking marathons:', error)
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
        setMarathons(getFallbackMarathons())
      } else {
        setMarathons(serverMarathons)
      }
    } catch (error: any) {
      console.error('Error loading marathons:', error)
      setMarathons(getFallbackMarathons())
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
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading marathons...</p>
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
            icon={Flame}
            title="Coding Marathons"
            description="Extended practice windows with larger XP multipliers and focused problem sets."
          />
        </motion.div>

        <section className="rounded-[10px] border border-border bg-surface-1 p-4 shadow-soft">
          <DomainFilterBar selectedDomain={domainFilter} onSelect={setDomainFilter} />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {marathons.map((marathon, idx) => (
            <motion.div
              key={marathon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex h-full flex-col rounded-[10px] border border-border bg-card p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/30"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={marathon.status} />
                  <DomainBadge domain={marathon.domain} />
                </div>
                <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-sm font-semibold text-warning">
                  <Flame className="h-4 w-4" />
                  {marathon.xpMultiplier}x XP
                </span>
              </div>

              <h2 className="text-h3 text-foreground">{marathon.title}</h2>
              <p className="mt-2 min-h-[3.1rem] text-body text-muted-foreground">{marathon.description}</p>

              <div className="my-5 space-y-2">
                <MetricRow icon={Clock} tone="primary">{marathon.duration} hours</MetricRow>
                <MetricRow icon={Users} tone="info">{marathon.participants} participants</MetricRow>
                <MetricRow icon={Zap} tone="warning">{marathon.xpMultiplier}x XP multiplier</MetricRow>
              </div>

              <Button asChild className="mt-auto w-full">
                <Link href={`/marathons/${marathon.id}`}>
                  {marathon.status === 'active' ? 'Join Marathon' : 'View Details'}
                </Link>
              </Button>
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  )
}






