'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Code, X, RotateCcw, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { InterviewType, InterviewDomain } from '@/app/stax-interview/page'
import MonacoEditor from './MonacoEditor'

interface StaxInterviewerProps {
  interviewType: InterviewType
  domain: InterviewDomain
  onEnd: () => void
}

interface Message {
  id: string
  role: 'stax' | 'user'
  content: string
  timestamp: Date
  type?: 'question' | 'coding' | 'feedback'
}

export default function StaxInterviewer({ interviewType, domain, onEnd }: StaxInterviewerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [codingChallenge, setCodingChallenge] = useState<any>(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [code, setCode] = useState('')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [engineState, setEngineState] = useState<any>(null)
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      const SpeechSynthesis = window.speechSynthesis

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          handleUserResponse(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          toast.error('Speech recognition error. Please try again.')
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }

      synthesisRef.current = SpeechSynthesis
    }

    // Start interview
    startInterview()

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startInterview = async () => {
    try {
      const response = await axios.post('/api/stax/interview/start', {
        interviewType,
        domain,
      })

      if (response.data.greeting) {
        addMessage('stax', response.data.greeting, 'question')
        speak(response.data.greeting)
        setInterviewStarted(true)
        setEngineState(response.data.engineState)
        setCurrentQuestion(response.data.questionId)
      }
    } catch (error: any) {
      console.error('Error starting interview:', error)
      toast.error('Failed to start interview')
    }
  }

  const handleUserResponse = async (transcript: string) => {
    addMessage('user', transcript)

    try {
      const response = await axios.post('/api/stax/interview/respond', {
        interviewType,
        domain,
        userResponse: transcript,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        engineState,
      })

      if (response.data.response) {
        addMessage('stax', response.data.response, response.data.type || 'question')
        speak(response.data.response)

        // Update engine state
        if (response.data.engineState) {
          setEngineState(response.data.engineState)
        }

        if (response.data.codingChallenge) {
          setCodingChallenge(response.data.codingChallenge)
          setShowCodeEditor(true)
          setCurrentQuestion(response.data.codingChallenge.title)
        } else {
          setCurrentQuestion(response.data.nextQuestion?.id || null)
        }

        // Show evaluation feedback if available
        if (response.data.evaluation) {
          const evalMsg = `[Evaluation: ${response.data.evaluation.quality.toUpperCase()}] ${response.data.evaluation.feedback}`
          // Could add this as a separate message or include in response
        }

        if (response.data.interviewComplete) {
          setTimeout(() => {
            handleEndInterview()
          }, 3000)
        }
      }
    } catch (error: any) {
      console.error('Error processing response:', error)
      toast.error('Failed to process response')
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
      toast.success('Listening...')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speak = (text: string) => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthesisRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const addMessage = (role: 'stax' | 'user', content: string, type?: 'question' | 'coding' | 'feedback') => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type,
    }
    setMessages((prev) => [...prev, message])
  }

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    try {
      const response = await axios.post('/api/stax/interview/submit-code', {
        code,
        challenge: codingChallenge,
        interviewType,
        domain,
      })

      if (response.data.feedback) {
        addMessage('stax', response.data.feedback, 'feedback')
        speak(response.data.feedback)
        setShowCodeEditor(false)
        setCode('')
        setCodingChallenge(null)
        
        // Continue with next question after code review
        // The next question will come in the next user response
      }
    } catch (error: any) {
      console.error('Error submitting code:', error)
      toast.error('Failed to submit code')
    }
  }

  const handleEndInterview = () => {
    stopListening()
    stopSpeaking()
    onEnd()
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center text-3xl font-bold"
            >
              S
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold neon-text">Stax AI Interviewer</h1>
              <p className="text-muted-foreground capitalize">
                {interviewType} Round {domain !== 'all' && `- ${domain}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleEndInterview}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Messages */}
            <div className="glass-card p-6 h-[500px] overflow-y-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-neon-cyan/20 text-foreground'
                          : 'bg-neon-purple/20 text-foreground'
                      }`}
                    >
                      {message.role === 'stax' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-neon-purple">STAX</span>
                          {message.type === 'coding' && (
                            <Code className="w-4 h-4 text-neon-cyan" />
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>

            {/* Code Editor */}
            {showCodeEditor && codingChallenge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-bold mb-4">{codingChallenge.title}</h3>
                <p className="text-foreground/80 mb-4">{codingChallenge.description}</p>
                <div className="border border-neon-cyan/30 rounded-lg overflow-hidden mb-4">
                  <MonacoEditor
                    height="300px"
                    language={codingChallenge.language || 'python'}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
                <button
                  onClick={handleSubmitCode}
                  className="btn-primary w-full"
                >
                  Submit Code
                </button>
              </motion.div>
            )}

            {/* Voice Controls */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isSpeaking}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-neon-cyan hover:bg-neon-cyan/80'
                  } disabled:opacity-50`}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 text-foreground" />
                  ) : (
                    <Mic className="w-8 h-8 text-foreground" />
                  )}
                </button>
                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="w-12 h-12 rounded-full bg-neon-purple/20 hover:bg-neon-purple/30 flex items-center justify-center disabled:opacity-50"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-6 h-6 text-neon-purple" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-center text-muted-foreground mt-4">
                {isListening ? 'Listening... Speak now' : isSpeaking ? 'Stax is speaking...' : 'Click mic to respond'}
              </p>
            </div>
          </div>

          {/* Stax Character & Info */}
          <div className="space-y-4">
            {/* Stax Character */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="glass-card p-8 text-center"
            >
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-neon-purple via-neon-cyan to-neon-green rounded-full flex items-center justify-center text-6xl font-bold shadow-card">
                S
              </div>
              <h2 className="text-2xl font-bold mb-2">Stax</h2>
              <p className="text-muted-foreground text-sm mb-4">Your AI Interviewer</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-neon-green animate-pulse' : 'bg-muted'}`} />
                <span className="text-xs text-muted-foreground">
                  {isSpeaking ? 'Speaking' : 'Ready'}
                </span>
              </div>
            </motion.div>

            {/* Interview Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Interview Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize font-semibold">{interviewType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="ml-2 capitalize font-semibold">{domain}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="ml-2 font-semibold">{messages.filter(m => m.type === 'question').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

