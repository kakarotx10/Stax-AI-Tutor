'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Code, FileText, Users, ArrowRight } from 'lucide-react'
import StaxInterviewer from '@/components/StaxInterviewer'

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

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold neon-text mb-4">
            Meet <span className="text-neon-purple">Stax</span> AI Interviewer
          </h1>
          <p className="text-xl text-muted-foreground">
            Practice interviews with AI-powered voice conversations
          </p>
        </motion.div>

        {/* Interview Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedType('technical')}
            className={`glass-card p-8 rounded-lg border cursor-pointer transition-all ${
              selectedType === 'technical'
                ? 'border-neon-cyan shadow-card'
                : 'border-border hover:border-neon-cyan/50'
            }`}
          >
            <Code className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2">Technical Round</h2>
            <p className="text-muted-foreground text-center mb-4">
              Practice coding problems, algorithms, and domain-specific questions
            </p>
            <ul className="text-sm text-foreground/80 space-y-1">
              <li>• Real-time coding challenges</li>
              <li>• Algorithm & DSA questions</li>
              <li>• Domain-specific problems</li>
              <li>• Cross-questioning & follow-ups</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedType('hr')}
            className={`glass-card p-8 rounded-lg border cursor-pointer transition-all ${
              selectedType === 'hr'
                ? 'border-neon-purple shadow-card'
                : 'border-border hover:border-neon-purple/50'
            }`}
          >
            <Users className="w-16 h-16 text-neon-purple mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2">HR Round</h2>
            <p className="text-muted-foreground text-center mb-4">
              Practice behavioral questions and soft skills
            </p>
            <ul className="text-sm text-foreground/80 space-y-1">
              <li>• Behavioral questions</li>
              <li>• Situation-based scenarios</li>
              <li>• Teamwork & leadership</li>
              <li>• Career goals discussion</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedType('resume')}
            className={`glass-card p-8 rounded-lg border cursor-pointer transition-all ${
              selectedType === 'resume'
                ? 'border-neon-green shadow-card'
                : 'border-border hover:border-neon-green/50'
            }`}
          >
            <FileText className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2">Resume Round</h2>
            <p className="text-muted-foreground text-center mb-4">
              Discuss your projects, experience, and achievements
            </p>
            <ul className="text-sm text-foreground/80 space-y-1">
              <li>• Project deep-dives</li>
              <li>• Experience discussion</li>
              <li>• Skills validation</li>
              <li>• Achievement highlights</li>
            </ul>
          </motion.div>
        </div>

        {/* Domain Selection (for Technical Round) */}
        {selectedType === 'technical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <h3 className="text-xl font-bold mb-4">Select Domain:</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {(['all', 'placement', 'frontend', 'backend', 'fullstack', 'aiml'] as InterviewDomain[]).map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-4 py-3 rounded-lg transition-all ${
                    selectedDomain === domain
                      ? 'bg-neon-cyan text-primary-foreground font-bold'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {domain === 'fullstack' ? 'Full Stack' : domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={() => setStarted(true)}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
            >
              Start Interview with Stax
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

