'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, MessageCircle, Eye, Calendar, User, Building, Briefcase } from 'lucide-react'
import { InterviewExperience } from '@/lib/types/interviews'
import { DOMAINS } from '@/lib/subjects'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [experience, setExperience] = useState<InterviewExperience | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExperience()
  }, [params.id])

  const loadExperience = async () => {
    try {
      const response = await axios.get(`/api/interviews/experiences?id=${params.id}`)
      setExperience(response.data.experience)
    } catch (error: any) {
      console.error('Error loading experience:', error)
      toast.error('Failed to load experience')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    // TODO: Implement like functionality
    toast('Like functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading experience...</p>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Experience not found</p>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-neon-cyan transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold neon-text mb-4">{experience.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span>{experience.company}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span>{experience.position}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>{DOMAINS[experience.domain]?.icon}</span>
                  <span>{DOMAINS[experience.domain]?.name}</span>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              experience.verdict === 'selected' ? 'bg-neon-green/20 text-neon-green' :
              experience.verdict === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {experience.verdict.toUpperCase()}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{experience.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(experience.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{experience.views} views</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {experience.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 mb-6"
        >
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
              {experience.content}
            </div>
          </div>
        </motion.div>

        {/* Rounds */}
        {experience.rounds && experience.rounds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-neon-cyan">Interview Rounds</h2>
            <div className="space-y-6">
              {experience.rounds.map((round, idx) => (
                <div key={idx} className="border-l-4 border-neon-cyan pl-6">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold text-neon-cyan">Round {round.roundNumber}</span>
                    <span className="text-lg font-semibold">{round.roundName}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      round.difficulty === 'easy' ? 'bg-neon-green/20 text-neon-green' :
                      round.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {round.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{round.description}</p>
                  {round.questions && round.questions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-neon-cyan">Questions Asked:</h4>
                      <ul className="list-disc list-inside space-y-1 text-foreground/80">
                        {round.questions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {round.feedback && (
                    <div className="mt-4 p-4 bg-card rounded-lg">
                      <h4 className="font-semibold mb-2 text-neon-cyan">Feedback:</h4>
                      <p className="text-foreground/80">{round.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tips */}
        {experience.tips && experience.tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-neon-cyan">Tips & Advice</h2>
            <ul className="space-y-3">
              {experience.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-neon-cyan mt-1">💡</span>
                  <span className="text-foreground/80">{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card/80 transition-all"
            >
              <Heart className="w-5 h-5 text-red-400" />
              <span>{experience.likes}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card/80 transition-all">
              <MessageCircle className="w-5 h-5 text-neon-cyan" />
              <span>{experience.comments}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



