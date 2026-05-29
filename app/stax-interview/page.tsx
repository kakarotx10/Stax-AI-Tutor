'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, FileText, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import StaxInterviewer from '@/components/StaxInterviewer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'

export type InterviewType = 'technical' | 'hr' | 'resume'
export type InterviewDomain = 'placement' | 'frontend' | 'backend' | 'fullstack' | 'aiml' | 'all'

export default function StaxInterviewPage() {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<InterviewDomain>('all')
  const [started, setStarted] = useState(false)

  if (started && selectedType) {
    return (
      <StaxInterviewer
        interviewType={selectedType}
        domain={selectedDomain}
        onEnd={() => {
          setStarted(false)
          setSelectedType(null)
        }}
      />
    )
  }

  const interviewOptions = [
    {
      value: 'technical' as const,
      title: 'Technical Round',
      description: 'Practice coding problems, algorithms, and domain-specific questions.',
      icon: Code,
      bullets: ['Real-time coding challenges', 'Algorithm and DSA questions', 'Domain-specific problems', 'Follow-up questions'],
      tone: 'text-primary bg-primary/10 border-primary/25',
    },
    {
      value: 'hr' as const,
      title: 'HR Round',
      description: 'Practice behavioral questions and communication clarity.',
      icon: Users,
      bullets: ['Behavioral questions', 'Situation-based scenarios', 'Teamwork and leadership', 'Career goals discussion'],
      tone: 'text-accent bg-accent/10 border-accent/25',
    },
    {
      value: 'resume' as const,
      title: 'Resume Round',
      description: 'Discuss your projects, experience, and achievements.',
      icon: FileText,
      bullets: ['Project deep-dives', 'Experience discussion', 'Skills validation', 'Achievement highlights'],
      tone: 'text-success bg-success/10 border-success/25',
    },
  ]

  return (
    <main className="page-shell pt-24">
      <div className="page-container max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header text-center"
        >
          <Badge variant="default" className="mb-4">AI mock interviews</Badge>
          <h1 className="page-title">Meet Stax AI Interviewer</h1>
          <p className="page-description mx-auto">
            Practice interviews with focused voice conversations, structured prompts, and domain-aware rounds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {interviewOptions.map((option, index) => {
            const Icon = option.icon
            const selected = selectedType === option.value

            return (
              <motion.button
                key={option.value}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(option.value)}
                className={`surface-card p-6 text-left transition-all ${
                  selected ? 'border-primary ring-2 ring-primary/40' : 'hover:border-primary/50'
                }`}
              >
                <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl border ${option.tone}`}>
                  <Icon className="h-7 w-7" />
                </span>
                <h2 className="text-h4 text-foreground">{option.title}</h2>
                <p className="mt-2 text-body-sm text-muted-foreground">{option.description}</p>
                <ul className="mt-5 space-y-2 text-body-sm text-muted-foreground">
                  {option.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.button>
            )
          })}
        </div>

        {selectedType === 'technical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card p-6"
          >
            <h3 className="mb-4 text-h4">Select domain</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              {(['all', 'placement', 'frontend', 'backend', 'fullstack', 'aiml'] as InterviewDomain[]).map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(domain)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                    selectedDomain === domain
                      ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                      : 'border-border bg-card/80 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {domain === 'fullstack' ? 'Full Stack' : domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              onClick={() => setStarted(true)}
              size="lg"
              className="mx-auto"
            >
              Start Interview with Stax
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  )
}

