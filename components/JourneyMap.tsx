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
    icon: 'bg-primary/10 text-primary ring-primary/20',
    border: 'hover:border-primary/40',
    chip: 'border-primary/20 bg-primary/10 text-primary',
    progress: 'bg-primary',
  },
  frontend: {
    icon: 'bg-success/10 text-success ring-success/20',
    border: 'hover:border-success/40',
    chip: 'border-success/20 bg-success/10 text-success',
    progress: 'bg-success',
  },
  backend: {
    icon: 'bg-info/10 text-info ring-info/20',
    border: 'hover:border-info/40',
    chip: 'border-info/20 bg-info/10 text-info',
    progress: 'bg-info',
  },
  aiml: {
    icon: 'bg-accent/10 text-accent ring-accent/20',
    border: 'hover:border-accent/40',
    chip: 'border-accent/20 bg-accent/10 text-accent',
    progress: 'bg-accent',
  },
  'stax-interview': {
    icon: 'bg-warning/10 text-warning ring-warning/20',
    border: 'hover:border-warning/40',
    chip: 'border-warning/20 bg-warning/10 text-warning',
    progress: 'bg-warning',
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
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4 text-primary" />
          Curriculum pathways
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Choose your learning path
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
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
              className={`overflow-hidden rounded-2xl border border-border bg-card/90 shadow-card backdrop-blur-xl transition duration-200 ${styles.border}`}
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
                className="flex w-full flex-col gap-5 p-5 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border ring-1 shadow-soft ${styles.icon}`}>
                    <DomainIcon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        {domain.name}
                      </h3>
                      {domainId === 'stax-interview' && (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles.chip}`}>
                          AI practice suite
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
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
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-warning">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
                        {domainSubjects.length} subjects
                      </span>
                      <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
                        {totalUnits} units
                      </span>
                      <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold shadow-soft ${styles.chip}`}>
                        {totalXP} XP
                      </span>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-foreground"
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
                  className="border-t border-border bg-background/10 p-5 sm:p-6"
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
                          className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => handleSubjectClick(subject.id)}
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                                <SubjectIcon className="h-5 w-5" />
                              </span>
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {subject.name}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground/80">
                                  {subject.units.length} units
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/80 transition group-hover:translate-x-1 group-hover:text-primary" />
                          </div>

                          <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-normal text-muted-foreground/80">
                              <span>Progress</span>
                              <span>{subjectProgress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
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
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                ) : unit.locked ? (
                                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                                ) : (
                                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                                )}
                                <span className={unit.completed ? 'text-success' : unit.locked ? 'text-muted-foreground/60' : 'text-foreground'}>
                                  {unit.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
                            <span className="text-muted-foreground/80">Total XP</span>
                            <span className="font-semibold text-primary">
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
