'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import axios from 'axios'
import { CheckCircle2, Loader2, Code2, BookOpen, ArrowRight, Sparkles, Clock, List } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import YouTubeVideos from './YouTubeVideos'
import { SUBJECTS, type Subject } from '@/content/subjects'

interface TheoryData {
  title: string
  overview: string
  sections: Array<{
    heading: string
    content: string
    codeExample: string
    visualDescription: string
  }>
  keyTakeaways: string[]
}

interface ConceptLearningProps {
  subject: string
  unit: string
  subtopic?: string
  onComplete: () => void
  subjectId?: Subject
  unitId?: string
  subtopicId?: string
}

export default function ConceptLearning({ subject, unit, subtopic, onComplete, subjectId, unitId, subtopicId }: ConceptLearningProps) {
  const [theory, setTheory] = useState<TheoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [completed, setCompleted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: contentRef, offset: ['start start', 'end end'] })
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })

  const readingTime = useMemo(() => {
    if (!theory) return 0
    const words = theory.sections.reduce(
      (acc, s) => acc + (s.content?.split(/\s+/).length || 0) + (s.heading?.split(/\s+/).length || 0),
      theory.overview?.split(/\s+/).length || 0,
    )
    return Math.max(1, Math.round(words / 220))
  }, [theory])

  const detectLang = (code: string): string => {
    if (!code) return 'code'
    if (/SELECT\s|FROM\s|WHERE\s/i.test(code)) return 'sql'
    if (/function\s|const\s|=>|console\./.test(code)) return 'javascript'
    if (/def\s|print\(|import\s+\w+$/m.test(code)) return 'python'
    if (/#include|int\s+main\s*\(/.test(code)) return 'cpp'
    if (/public\s+class|System\.out/.test(code)) return 'java'
    return 'code'
  }

  useEffect(() => {
    fetchTheory()
  }, [subject, unit, subtopic])

  const fetchTheory = async () => {
    try {
      setLoading(true)
      // Use subtopic prop if provided, otherwise default to 'intro'
      const subtopicName = subtopic || 'intro'
      
      console.log('📚 Fetching theory:', { subject, unit, subtopic: subtopicName })
      
      const response = await axios.post('/api/gemini/theory', {
        subject,
        unit,
        subtopic: subtopicName,
      })
      
      console.log('📚 Theory API Response:', {
        hasTheory: !!response.data?.theory,
        hasError: !!response.data?.error,
        title: response.data?.theory?.title
      })
      
      if (response.data) {
        // Handle both success and error responses
        if (response.data.theory) {
          console.log('✅ Theory loaded from database!')
          console.log('Title:', response.data.theory.title)
          console.log('Sections:', response.data.theory.sections?.length || 0)
          setTheory(response.data.theory)
          if (response.data.error) {
            toast(response.data.error, { icon: '⚠️' })
          }
        } else if (response.data.error) {
          // Show error message
          console.error('❌ Theory error:', response.data.error)
          toast.error(response.data.error)
          throw new Error(response.data.error || 'Failed to load theory')
        } else {
          throw new Error('Invalid response format')
        }
      } else {
        throw new Error('No response data')
      }
    } catch (error: any) {
      console.error('Error fetching theory:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load theory content'
      toast.error(errorMessage)
      
      // Don't set fallback - let user see the error and retry
      setTheory(null)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (theory && currentSection < theory.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setCompleted(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading lesson…</p>
        </div>
      </div>
    )
  }

  if (!theory) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-destructive">Failed to load theory content</p>
        <button onClick={fetchTheory} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    )
  }

  const section = theory.sections[currentSection]
  const totalSections = theory.sections.length

  const youtubeVideos: string[] = []
  if (subjectId && unitId && subtopicId) {
    const subjectData = SUBJECTS[subjectId]
    const unitData = subjectData?.units.find(u => u.id === unitId)
    const subtopicData = unitData?.subtopics.find(s => s.id === subtopicId)
    if (subtopicData?.youtubeVideos) {
      youtubeVideos.push(...subtopicData.youtubeVideos)
    }
  }

  const codeLang = section.codeExample ? detectLang(section.codeExample) : ''

  return (
    <div ref={contentRef} className="relative">
      {/* Top reading progress bar */}
      <motion.div
        style={{ scaleX: progressX, transformOrigin: '0% 50%' }}
        className="fixed left-0 right-0 top-0 z-40 h-[2px] bg-primary"
      />

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar — sticky TOC */}
        <aside className="hidden lg:block col-span-3">
          <div className="sticky top-8 space-y-6">
            {/* Lesson meta */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Lesson</p>
              <h2 className="text-lg font-semibold leading-tight">{theory.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime} min read
                </span>
                <span className="text-border-strong">·</span>
                <span>{totalSections} sections</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* TOC */}
            <nav aria-label="Table of contents" className="space-y-1">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                <List className="w-3.5 h-3.5" />
                On this page
              </p>
              {theory.sections.map((s, idx) => {
                const isActive = idx === currentSection
                const isDone = idx < currentSection
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentSection(idx)}
                    className={`group flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isDone
                          ? 'border-success/40 bg-success/10 text-success'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3 h-3" /> : String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2 leading-tight">{s.heading}</span>
                  </button>
                )
              })}
            </nav>

            {/* Step progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-mono">{currentSection + 1} / {totalSections}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <article className="col-span-12 lg:col-span-9 space-y-10">
          {/* Lesson intro */}
          <motion.header
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 border-b border-border pb-8"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{subject}</span>
              <span className="text-border-strong">/</span>
              <span>{unit}</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{theory.title}</h1>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl">
              {theory.overview}
            </p>
          </motion.header>

          {/* Section */}
          <motion.section
            key={currentSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span className="inline-flex h-6 items-center rounded-md border border-border bg-card px-2">
                  {String(currentSection + 1).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
                </span>
                <span className="uppercase tracking-wider">Section</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">{section.heading}</h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-base leading-7 text-foreground/90 whitespace-pre-line">
                {section.content}
              </p>
            </div>

            {section.codeExample && (
              <div className="overflow-hidden rounded-lg border border-border bg-[hsl(240_8%_4%)]">
                {/* Code block header — mac dots + lang */}
                <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="font-mono">{codeLang}</span>
                  </div>
                </div>
                <pre className="overflow-x-auto p-5">
                  <code className="text-[13px] leading-6 font-mono text-foreground/90">{section.codeExample}</code>
                </pre>
              </div>
            )}

            {section.visualDescription && (
              <aside className="flex gap-3 rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-primary">Visual intuition</p>
                  <p className="text-sm leading-6 text-foreground/85">{section.visualDescription}</p>
                </div>
              </aside>
            )}
          </motion.section>

          {/* Key Takeaways */}
          {currentSection === totalSections - 1 && theory.keyTakeaways.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wider text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Key Takeaways
              </div>
              <ul className="space-y-3">
                {theory.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-6">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-mono text-success">
                      {idx + 1}
                    </span>
                    <span className="text-foreground/90">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Recommended Videos */}
          {youtubeVideos.length > 0 && (
            <YouTubeVideos videoIds={youtubeVideos} title="Recommended Video Lectures" />
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {completed ? (
              <button onClick={handleComplete} className="btn-primary">
                Proceed to MCQ Gate
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                {currentSection < totalSections - 1 ? 'Next section' : 'Finish lesson'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}


