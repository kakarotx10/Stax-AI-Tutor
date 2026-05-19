'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { SUBJECTS, DOMAINS, type Subject, type Domain } from '@/lib/subjects'
import {
  Atom,
  Binary,
  Bot,
  Boxes,
  Braces,
  Brain,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Coffee,
  Container,
  Cpu,
  Database,
  Feather,
  FileCode2,
  FileType2,
  Flame,
  FlaskConical,
  Layers,
  Leaf,
  Lock,
  MessageSquareText,
  Mic2,
  Monitor,
  Network,
  Paintbrush,
  Palette,
  Route,
  ScanEye,
  Server,
  ServerCog,
  ShipWheel,
  Sparkles,
  Sprout,
  Target,
  Triangle,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

const domainStyles: Record<Domain, {
  icon: string
  border: string
  chip: string
  progress: string
}> = {
  placement: {
    icon: 'bg-cyan-400/10 text-cyan-200 ring-cyan-300/20',
    border: 'hover:border-cyan-300/40',
    chip: 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100',
    progress: 'bg-cyan-400',
  },
  frontend: {
    icon: 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/20',
    border: 'hover:border-emerald-300/40',
    chip: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
    progress: 'bg-emerald-400',
  },
  backend: {
    icon: 'bg-sky-400/10 text-sky-200 ring-sky-300/20',
    border: 'hover:border-sky-300/40',
    chip: 'border-sky-300/20 bg-sky-400/10 text-sky-100',
    progress: 'bg-sky-400',
  },
  aiml: {
    icon: 'bg-violet-400/10 text-violet-200 ring-violet-300/20',
    border: 'hover:border-violet-300/40',
    chip: 'border-violet-300/20 bg-violet-400/10 text-violet-100',
    progress: 'bg-violet-400',
  },
  'stax-interview': {
    icon: 'bg-amber-400/10 text-amber-200 ring-amber-300/20',
    border: 'hover:border-amber-300/40',
    chip: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
    progress: 'bg-amber-400',
  },
}

const domainIcons: Record<Domain, LucideIcon> = {
  placement: Target,
  frontend: Palette,
  backend: ServerCog,
  aiml: Bot,
  'stax-interview': Mic2,
}

const subjectIcons: Record<Subject, LucideIcon> = {
  cpp: Code2,
  java: Coffee,
  python: FileCode2,
  dsa: Binary,
  oops: Boxes,
  dbms: Database,
  os: Cpu,
  cn: Network,
  'system-design': Workflow,
  html: FileCode2,
  css: Paintbrush,
  javascript: Braces,
  react: Atom,
  angular: Triangle,
  vue: Leaf,
  nextjs: Layers,
  typescript: FileType2,
  nodejs: Server,
  express: Route,
  django: Feather,
  flask: FlaskConical,
  spring: Sprout,
  nestjs: ServerCog,
  mongodb: Leaf,
  postgresql: Database,
  redis: Database,
  docker: Container,
  kubernetes: ShipWheel,
  'ml-basics': Brain,
  'deep-learning': BrainCircuit,
  'neural-networks': Network,
  nlp: MessageSquareText,
  'computer-vision': ScanEye,
  tensorflow: Flame,
  pytorch: Flame,
  'data-science': Monitor,
}

export default function JourneyMap() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [expandedDomains, setExpandedDomains] = useState<Set<Domain>>(new Set())

  const handleSubjectClick = (subjectId: Subject) => {
    router.push(`/subject/${subjectId}`)
  }

  const toggleDomain = (domainId: Domain) => {
    setExpandedDomains(prev => {
      const newSet = new Set(prev)
      if (newSet.has(domainId)) {
        newSet.delete(domainId)
      } else {
        newSet.add(domainId)
      }
      return newSet
    })
  }

  return (
    <div ref={containerRef} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-cyan-100">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Curriculum pathways
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Choose your learning path
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
          Expand a domain to see its subjects, progress signals, units, and XP
          potential in one clean view.
        </p>
      </motion.div>

      <div className="space-y-4">
        {(Object.keys(DOMAINS) as Domain[]).map((domainId, domainIdx) => {
          const domain = DOMAINS[domainId]
          const isExpanded = expandedDomains.has(domainId)
          const domainSubjects = domain.subjects.map(id => SUBJECTS[id]).filter(Boolean)
          const totalUnits = domainSubjects.reduce((sum, subject) => sum + subject.units.length, 0)
          const totalXP = domainSubjects.reduce(
            (sum, subject) => sum + subject.units.reduce((unitSum, unit) => unitSum + unit.xpReward, 0),
            0
          )
          const styles = domainStyles[domainId]
          const DomainIcon = domainIcons[domainId]

          return (
            <motion.article
              key={domainId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: domainIdx * 0.08, duration: 0.45 }}
              className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-200 ${styles.border}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (domainId === 'stax-interview') {
                    router.push('/stax-interview')
                    return
                  }
                  toggleDomain(domainId)
                }}
                aria-expanded={domainId === 'stax-interview' ? undefined : isExpanded}
                className="flex w-full flex-col gap-5 p-5 text-left transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-inset sm:p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}>
                    <DomainIcon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        {domain.name}
                      </h3>
                      {domainId === 'stax-interview' && (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles.chip}`}>
                          AI practice suite
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  {domainId === 'stax-interview' ? (
                    <>
                      <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${styles.chip}`}>
                        Click to start
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-amber-100">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm font-semibold text-slate-200">
                        {domainSubjects.length} subjects
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm font-semibold text-slate-200">
                        {totalUnits} units
                      </span>
                      <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${styles.chip}`}>
                        {totalXP} XP
                      </span>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </motion.span>
                    </>
                  )}
                </div>
              </button>

              {isExpanded && domainId !== 'stax-interview' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/10 bg-black/10 p-5 sm:p-6"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {domainSubjects.map((subject, subjectIdx) => {
                      const subjectXP = subject.units.reduce((sum, unit) => sum + unit.xpReward, 0)
                      const completedUnits = subject.units.filter(unit => unit.completed).length
                      const subjectProgress = subject.units.length
                        ? Math.round((completedUnits / subject.units.length) * 100)
                        : 0
                      const SubjectIcon = subjectIcons[subject.id]

                      return (
                        <motion.button
                          key={subject.id}
                          type="button"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: subjectIdx * 0.04, duration: 0.35 }}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0d121d] p-4 text-left shadow-[0_14px_35px_rgba(0,0,0,0.18)] transition duration-200 hover:border-white/20 hover:bg-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                          onClick={() => handleSubjectClick(subject.id)}
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-cyan-200 ring-1 ring-white/10">
                                <SubjectIcon className="h-5 w-5" />
                              </span>
                              <div>
                                <h4 className="font-semibold text-white">
                                  {subject.name}
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                  {subject.units.length} units
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                          </div>

                          <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              <span>Progress</span>
                              <span>{subjectProgress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                              <div
                                className={`h-full rounded-full ${styles.progress}`}
                                style={{ width: `${subjectProgress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mb-4 space-y-2">
                            {subject.units.slice(0, 2).map((unit) => (
                              <div key={unit.id} className="flex items-center gap-2 text-sm">
                                {unit.completed ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                                ) : unit.locked ? (
                                  <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                                ) : (
                                  <Sparkles className="h-4 w-4 shrink-0 text-cyan-300" />
                                )}
                                <span className={unit.completed ? 'text-emerald-200' : unit.locked ? 'text-slate-600' : 'text-slate-200'}>
                                  {unit.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                            <span className="text-slate-500">Total XP</span>
                            <span className="font-semibold text-cyan-200">
                              {subjectXP}
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
