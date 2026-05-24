'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import JourneyMap from '@/components/JourneyMap'
import { ArrowUpRight } from 'lucide-react'

const stats = [
  { value: '05', label: 'Learning domains' },
  { value: '36', label: 'Skill tracks' },
  { value: '06', label: 'Practice formats' },
]

const chapters = [
  { num: 'I', title: 'Placement', note: 'DSA, system design, behavioral.' },
  { num: 'II', title: 'Frontend', note: 'React, modern web craft.' },
  { num: 'III', title: 'Backend', note: 'APIs, services, infra.' },
  { num: 'IV', title: 'AI / ML', note: 'Models, data, deployment.' },
  { num: 'V', title: 'Interview', note: 'Live AI mock practice.' },
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
    <main className="relative -mt-16 bg-background pt-16 text-foreground">
      <section className="relative min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-7xl flex-col">
          <div className="flex items-center justify-between border-b border-border py-6 text-caption uppercase text-muted-foreground">
            <span>Stax - Volume 01</span>
            <span className="hidden sm:inline">A Quiet Manual for Engineers</span>
            <span>MMXXVI</span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.1, 1] }}
              className="lg:col-span-8"
            >
              <p className="mb-8 text-caption uppercase text-muted-foreground">
                A new way to learn computer science
              </p>

              <h1 className="max-w-4xl text-h1 text-foreground sm:text-6xl lg:text-7xl">
                Master computer science with structured AI practice.
              </h1>

              <p className="mt-8 max-w-2xl text-body-lg text-muted-foreground sm:text-xl">
                A measured study of computer science - placement, frontend, backend,
                AI, and the interview. Read at your pace. Practice in your terms.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <motion.button
                  type="button"
                  onClick={scrollToJourney}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary group"
                >
                  Start learning
                  <ArrowUpRight className="h-4 w-4" />
                </motion.button>
                <button
                  type="button"
                  onClick={scrollToJourney}
                  className="btn-secondary"
                >
                  View curriculum
                </button>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="lg:col-span-4 lg:border-l lg:border-border lg:pl-12"
            >
              <p className="mb-8 text-caption uppercase text-muted-foreground">
                Contents
              </p>
              <ol className="space-y-5">
                {chapters.map((c) => (
                  <li
                    key={c.num}
                    className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-4 border-b border-border pb-4 transition-colors hover:border-primary/60"
                  >
                    <span className="text-base font-semibold text-primary">{c.num}.</span>
                    <span className="text-lg font-semibold text-foreground">{c.title}</span>
                    <span className="text-caption uppercase text-muted-foreground">
                      -
                    </span>
                    <span className="col-start-2 -mt-3 text-body-sm text-muted-foreground">
                      {c.note}
                    </span>
                  </li>
                ))}
              </ol>
            </motion.aside>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-auto grid grid-cols-1 gap-4 border-t border-border py-6 sm:grid-cols-3"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-baseline gap-4 ${i > 0 ? 'sm:border-l sm:border-border sm:pl-6' : ''}`}
              >
                <span className="text-h3 text-foreground">{s.value}</span>
                <span className="text-caption uppercase text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-border bg-background px-4 py-20 text-foreground sm:px-6 lg:px-8">
        <motion.div
          ref={journeyRef}
          id="learning-paths"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl"
        >
          <JourneyMap />
        </motion.div>
      </section>
    </main>
  )
}
