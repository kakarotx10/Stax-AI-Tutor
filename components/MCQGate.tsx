'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import confetti from 'canvas-confetti'
import { CheckCircle2, XCircle, Loader2, RotateCcw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { saveUserAttempt, saveUserProgress } from '@/lib/userAttempts'

interface MCQ {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  wrongExplanations?: Record<string, string>
  difficulty: string
}

interface MCQGateProps {
  subject: string
  unit: string
  subjectId?: string
  unitId?: string
  subtopicId?: string
  subtopicName?: string
  phase?: string
  onPass: () => void
  isFirstUnit?: boolean
}

interface MCQAnswerResult {
  question: string
  options?: string[]
  selectedAnswer?: number
  correctAnswer?: number
  isCorrect: boolean
  explanation?: string
}

export default function MCQGate({
  subject,
  unit,
  subjectId,
  unitId,
  subtopicId,
  subtopicName,
  phase,
  onPass,
  isFirstUnit = false,
}: MCQGateProps) {
  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [answers, setAnswers] = useState<MCQAnswerResult[]>([])
  const [needsReinforcement, setNeedsReinforcement] = useState(false)
  const [reinforcementMCQ, setReinforcementMCQ] = useState<MCQ | null>(null)

  useEffect(() => {
    fetchMCQs()
  }, [])

  const fetchMCQs = async () => {
    try {
      setLoading(true)
      
      // Extract subtopic from unit if needed
      const unitParts = unit.split(' - ')
      const mainUnit = unitParts[0]
      const subtopic = unitParts[1] || unitParts[0] || unit
      
      // Use static database via API (which generates MCQs on-the-fly if not found)
      const response = await axios.post('/api/gemini/mcq', {
        subject,
        unit: mainUnit,
        subtopic: subtopic,
        concept: subtopic, // For backward compatibility
      })

      if (response.data && Array.isArray(response.data.mcqs) && response.data.mcqs.length > 0) {
        setMcqs(response.data.mcqs)
        if (response.data.error) {
          toast(response.data.error, { icon: '⚠️' })
        }
      } else {
        throw new Error(response.data?.error || 'No MCQs available')
      }
    } catch (error: any) {
      console.error('Error fetching MCQs:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load questions'
      toast.error(errorMsg)

      // Fallback: use database directly if API fails
      try {
        const { getMCQsForSubtopic } = await import('@/lib/mcqDatabase')
        const unitParts = unit.split(' - ')
        const mainUnit = unitParts[0]
        const subtopic = unitParts[1] || unitParts[0] || unit
        
        const dbMCQs = getMCQsForSubtopic(subject, mainUnit, subtopic)
        if (dbMCQs.length > 0) {
          const formattedMCQs = dbMCQs.map(mcq => ({
            question: mcq.question,
            options: mcq.options,
            correctAnswer: mcq.correctAnswer,
            explanation: mcq.explanation,
            wrongExplanations: {},
            difficulty: mcq.difficulty.toLowerCase() as 'basic' | 'medium' | 'advanced',
          }))
          setMcqs(formattedMCQs)
        } else {
          throw new Error('No MCQs found')
        }
      } catch (dbError) {
        // Final fallback
        const fallback: MCQ[] = [
          {
            question: `Which of the following best describes ${unit} in ${subject}?`,
            options: [
              `${unit} is a fundamental concept in ${subject}.`,
              `${unit} is unrelated to ${subject}.`,
              `${unit} is only used in legacy systems.`,
              `None of the above.`,
            ],
            correctAnswer: 0,
            explanation: `${unit} is an important concept in ${subject}. Understanding it is essential for mastering this topic.`,
            difficulty: 'easy',
          },
        ]
        setMcqs(fallback)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return
    setSelectedAnswer(index)
  }

  const handleSubmit = async () => {
    if (selectedAnswer === null) return

    const currentMCQ = mcqs[currentIndex]
    const isCorrect = selectedAnswer === currentMCQ.correctAnswer

    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = {
        question: currentMCQ.question,
        options: currentMCQ.options,
        selectedAnswer,
        correctAnswer: currentMCQ.correctAnswer,
        isCorrect,
        explanation: currentMCQ.explanation,
      }
      return next
    })

    setShowExplanation(true)

    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      })
      toast.success('Correct! 🎉')
    } else {
      setWrongCount(prev => prev + 1)
      toast.error('Incorrect. Let\'s review this concept.')
      
      // Trigger reinforcement learning
      setNeedsReinforcement(true)
      await fetchReinforcementMCQ()
    }
  }

  const fetchReinforcementMCQ = async () => {
    try {
      const response = await axios.post('/api/gemini/reinforcement-mcq', {
        concept: unit,
        subject,
      })
      setReinforcementMCQ(response.data.mcq)
    } catch (error) {
      console.error('Error fetching reinforcement MCQ:', error)
    }
  }

  const handleNext = async () => {
    if (needsReinforcement && reinforcementMCQ) {
      // Complete reinforcement first
      setNeedsReinforcement(false)
      setReinforcementMCQ(null)
      return
    }

    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // All MCQs completed
      const answeredResults = mcqs.map((mcq, idx) => answers[idx] ?? {
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
        isCorrect: false,
        explanation: mcq.explanation,
      })
      const finalCorrectCount = answeredResults.filter(answer => answer.isCorrect).length
      const finalWrongCount = Math.max(0, mcqs.length - finalCorrectCount)
      const score = mcqs.length > 0 ? Math.round((finalCorrectCount / mcqs.length) * 100) : 0
      const passed = score >= 70

      await saveUserAttempt({
        type: 'mcq',
        subjectId,
        subjectName: subject,
        unitId,
        unitName: unit,
        subtopicId,
        subtopicName,
        phase: phase ?? 'mcq',
        difficulty: mcqs[currentIndex]?.difficulty,
        problemTitle: `${unit} MCQ Gate`,
        status: passed ? 'completed' : 'failed',
        score,
        passedCount: finalCorrectCount,
        totalCount: mcqs.length,
        mcqResults: answeredResults,
        metadata: {
          wrongCount: finalWrongCount,
          isFirstUnit,
        },
      })

      if (passed) {
        await saveUserProgress({
          subjectId,
          unitId,
          subtopicId,
          phase: phase ?? 'mcq',
          mcqScore: score,
        })
        // 70% threshold to pass
        onPass()
      } else {
        toast.error('You need to score at least 70% to proceed. Let\'s review!')
        // Restart MCQs
        setCurrentIndex(0)
        setCorrectCount(0)
        setWrongCount(0)
        setAnswers([])
        setSelectedAnswer(null)
        setShowExplanation(false)
      }
    }
  }

  const handleReinforcementAnswer = (index: number) => {
    if (!reinforcementMCQ) return
    
    const isCorrect = index === reinforcementMCQ.correctAnswer
    if (isCorrect) {
      toast.success('Great! You understand it now!')
      setNeedsReinforcement(false)
      setReinforcementMCQ(null)
      // Continue with next question
      handleNext()
    } else {
      toast.error('Let\'s review the concept again')
      // Re-fetch simplified explanation
      fetchReTeach()
    }
  }

  const fetchReTeach = async () => {
    try {
      const response = await axios.post('/api/gemini/reteach', {
        concept: unit,
        subject,
        previousExplanation: mcqs[currentIndex]?.explanation || '',
      })
      toast.success('Check the simplified explanation below')
      // Could show a modal with re-teach content
    } catch (error) {
      console.error('Error re-teaching:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-neon-cyan" />
        </motion.div>
      </div>
    )
  }

  if (mcqs.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400">No questions available</p>
        <button onClick={fetchMCQs} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    )
  }

  const currentMCQ = needsReinforcement && reinforcementMCQ ? reinforcementMCQ : mcqs[currentIndex]
  const isCorrect = selectedAnswer === currentMCQ.correctAnswer

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold neon-text mb-4">MCQ Gate</h1>
        <p className="text-muted-foreground">
          Answer correctly to unlock coding challenges
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-neon-green" />
            <span className="text-neon-green font-bold">{correctCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-bold">{wrongCount}</span>
          </div>
          <span className="text-muted-foreground">
            Question {currentIndex + 1} / {mcqs.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 space-y-6"
      >
        {needsReinforcement && (
          <div className="bg-neon-cyan/20 border border-neon-cyan p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-neon-cyan" />
            <span className="text-sm">Reinforcement Question - Let's make sure you understand!</span>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6">{currentMCQ.question}</h2>

        <div className="space-y-3">
          {currentMCQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const isCorrectOption = idx === currentMCQ.correctAnswer
            const showResult = showExplanation && (isSelected || isCorrectOption)

            return (
              <motion.button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showResult
                    ? isCorrectOption
                      ? 'bg-neon-green/20 border-neon-green'
                      : isSelected
                      ? 'bg-red-400/20 border-red-400'
                      : 'border-border'
                    : isSelected
                    ? 'border-neon-cyan bg-neon-cyan/10'
                    : 'border-border hover:border-neon-cyan/50'
                }`}
                whileHover={!showExplanation ? { scale: 1.02 } : {}}
                whileTap={!showExplanation ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neon-cyan w-8">{String.fromCharCode(65 + idx)}.</span>
                  <span>{option}</span>
                  {showResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      {isCorrectOption ? (
                        <CheckCircle2 className="w-6 h-6 text-neon-green" />
                      ) : isSelected ? (
                        <XCircle className="w-6 h-6 text-red-400" />
                      ) : null}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg ${
                isCorrect
                  ? 'bg-neon-green/20 border border-neon-green'
                  : 'bg-red-400/20 border border-red-400'
              }`}
            >
              <h3 className="font-bold mb-2">
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </h3>
              <p className="text-sm">{currentMCQ.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          {!showExplanation ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : needsReinforcement && reinforcementMCQ ? (
            <div className="flex gap-2">
              {reinforcementMCQ.options.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReinforcementAnswer(idx)}
                  className="btn-secondary"
                >
                  {String.fromCharCode(65 + idx)}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              {currentIndex < mcqs.length - 1 ? 'Next Question' : 'Complete'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
