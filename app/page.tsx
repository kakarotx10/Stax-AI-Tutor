'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import JourneyMap from '@/components/JourneyMap'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Code2,
  Sparkles,
  Trophy,
} from 'lucide-react'

const stats = [
  { value: '5', label: 'Learning domains' },
  { value: '36', label: 'Skill tracks' },
  { value: '6', label: 'Practice modes' },
]

const workflows = [
  { icon: BookOpenCheck, label: 'Structured curriculum', detail: 'Domain paths, units, and XP checkpoints' },
  { icon: Code2, label: 'Hands-on challenges', detail: 'MCQ, coding, SQL, and assignments' },
  { icon: Brain, label: 'AI interview practice', detail: 'Technical, HR, and resume rounds' },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const journeyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToJourney = () => {
    journeyRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!mounted) return null

  return (
    <main className="relative -mt-16 bg-transparent pt-16 text-foreground">
      <section className="relative overflow-hidden px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="subtle-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.88fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.1, 1] }}
            className="max-w-3xl"
          >
            <Badge variant="default" className="mb-5">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              AI-powered CS learning platform
            </Badge>
            <h1 className="text-display text-foreground sm:text-6xl">
              Stax AI Tutor
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-muted-foreground sm:text-xl">
              A focused workspace for computer science learning, interview prep, and competitive practice with saved progress and AI feedback.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button type="button" size="lg" variant="secondary" onClick={scrollToJourney}>
                View curriculum
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="surface-panel p-4">
                  <p className="text-h3 text-foreground">{stat.value}</p>
                  <p className="mt-1 text-caption uppercase text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="surface-card p-4 sm:p-5"
          >
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-caption uppercase text-muted-foreground">Learning command center</p>
                  <h2 className="mt-1 text-h4 text-foreground">Today&apos;s focus</h2>
                </div>
                <span className="icon-tile h-11 w-11">
                  <BarChart3 className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {workflows.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl border border-border bg-card/90 p-4 shadow-soft">
                      <div className="flex items-start gap-3">
                        <span className="icon-tile h-10 w-10 rounded-xl">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <p className="mt-1 text-body-sm text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-success/25 bg-success/10 p-4">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="mt-3 text-2xl font-bold text-foreground">78%</p>
                  <p className="text-caption uppercase text-muted-foreground">Weekly accuracy</p>
                </div>
                <div className="rounded-2xl border border-warning/25 bg-warning/10 p-4">
                  <Trophy className="h-5 w-5 text-warning" />
                  <p className="mt-3 text-2xl font-bold text-foreground">12</p>
                  <p className="text-caption uppercase text-muted-foreground">XP events</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          ref={journeyRef}
          id="learning-paths"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-7xl"
        >
          <JourneyMap />
        </motion.div>
      </section>
    </main>
  )
}
