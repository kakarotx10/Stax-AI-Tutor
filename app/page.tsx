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
    <main className="relative -mt-16 bg-[#0b0a08] pt-16 text-stone-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(201,180,138,0.18), transparent 40%), radial-gradient(circle at 88% 95%, rgba(120,113,108,0.20), transparent 45%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <section className="relative min-h-[calc(100vh-4rem)] px-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex h-full max-w-7xl flex-col">
          <div className="flex items-center justify-between border-b border-stone-100/10 py-6 text-[11px] font-medium uppercase tracking-[0.28em] text-stone-400">
            <span>Stax &mdash; Volume 01</span>
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
              <p className="mb-10 text-[11px] font-medium uppercase tracking-[0.32em] text-stone-400">
                <span className="text-[#c9b48a]">&mdash;</span>&nbsp;&nbsp;A new way to learn computer science
              </p>

              <h1 className="font-serif text-[15vw] leading-[0.92] tracking-[-0.04em] text-stone-50 sm:text-[10vw] lg:text-[8.2vw]">
                Master
                <br />
                <span className="italic font-light text-[#c9b48a]">the craft,</span>
                <br />
                quietly.
              </h1>

              <p className="mt-10 max-w-xl font-serif text-xl leading-relaxed text-stone-300 sm:text-2xl">
                A measured study of computer science &mdash; placement, frontend, backend,
                AI, and the interview. Read at your pace. Practice in your terms.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
                <motion.button
                  type="button"
                  onClick={scrollToJourney}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 border-b border-stone-50 pb-1 text-sm font-medium uppercase tracking-[0.22em] text-stone-50"
                >
                  Begin reading
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
                <button
                  type="button"
                  onClick={scrollToJourney}
                  className="text-sm font-medium uppercase tracking-[0.22em] text-stone-400 underline-offset-4 hover:text-stone-50 hover:underline"
                >
                  View curriculum
                </button>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="lg:col-span-4 lg:border-l lg:border-stone-100/10 lg:pl-12"
            >
              <p className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em] text-stone-400">
                Contents
              </p>
              <ol className="space-y-5">
                {chapters.map((c) => (
                  <li
                    key={c.num}
                    className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-4 border-b border-stone-100/10 pb-4 transition-colors hover:border-[#c9b48a]/40"
                  >
                    <span className="font-serif text-base italic text-[#c9b48a]">{c.num}.</span>
                    <span className="font-serif text-lg text-stone-50">{c.title}</span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      &rarr;
                    </span>
                    <span className="col-start-2 -mt-3 text-sm leading-relaxed text-stone-400">
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
            className="mt-auto grid grid-cols-3 border-t border-stone-100/10 py-6"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-baseline gap-4 ${i > 0 ? 'border-l border-stone-100/10 pl-6' : ''}`}
              >
                <span className="font-serif text-3xl text-stone-50 sm:text-4xl">{s.value}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-400 sm:text-[11px]">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-stone-100/10 bg-[#0b0a08] px-4 py-20 text-stone-100 sm:px-6 lg:px-8">
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
