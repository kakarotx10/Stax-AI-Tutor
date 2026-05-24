'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Briefcase, BookOpen, Plus, X, Save } from 'lucide-react'
import { Domain, DOMAINS } from '@/lib/subjects'
import { InterviewType, ExperienceLevel, CompanyType } from '@/lib/types/interviews'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function PostInterviewPage() {
  const router = useRouter()
  const [postType, setPostType] = useState<'experience' | 'article'>('experience')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [domain, setDomain] = useState<Domain>('placement')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Experience-specific fields
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [companyType, setCompanyType] = useState<CompanyType>('product-based')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('new-grad')
  const [verdict, setVerdict] = useState<'selected' | 'rejected' | 'pending'>('pending')
  const [rounds, setRounds] = useState<any[]>([])
  const [tips, setTips] = useState<string[]>([])
  const [tipInput, setTipInput] = useState('')

  // Article-specific fields
  const [category, setCategory] = useState<'preparation' | 'resume' | 'behavioral' | 'technical' | 'negotiation' | 'general'>('general')
  const [excerpt, setExcerpt] = useState('')

  useEffect(() => {
    const initUser = async () => {
      if (typeof window === 'undefined') return
      const { ensureUserExists } = await import('@/lib/database/userManagement')
      const dbUserId = await ensureUserExists()
      setUserId(dbUserId)
    }
    initUser()
  }, [])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addTip = () => {
    if (tipInput.trim() && !tips.includes(tipInput.trim())) {
      setTips([...tips, tipInput.trim()])
      setTipInput('')
    }
  }

  const removeTip = (tip: string) => {
    setTips(tips.filter(t => t !== tip))
  }

  const addRound = () => {
    setRounds([...rounds, {
      roundNumber: rounds.length + 1,
      roundName: '',
      description: '',
      questions: [],
      difficulty: 'medium',
      duration: 60
    }])
  }

  const updateRound = (index: number, field: string, value: any) => {
    const updated = [...rounds]
    updated[index] = { ...updated[index], [field]: value }
    setRounds(updated)
  }

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('Please wait, initializing user...')
      return
    }

    if (!title || !content || !domain) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const endpoint = postType === 'experience' 
        ? '/api/interviews/experiences'
        : '/api/interviews/articles'

      const payload = {
        authorId: userId,
        title,
        content,
        domain,
        tags,
        ...(postType === 'experience' ? {
          company,
          position,
          companyType,
          experienceLevel,
          verdict,
          rounds,
          tips,
          interviewType: 'experience' as InterviewType
        } : {
          category,
          excerpt: excerpt || content.substring(0, 200),
          interviewType: 'article' as InterviewType
        })
      }

      const response = await axios.post(endpoint, payload)
      toast.success(`${postType === 'experience' ? 'Experience' : 'Article'} posted successfully!`)
      router.push(`/interviews/${postType === 'experience' ? 'experiences' : 'articles'}/${response.data.experienceId || response.data.articleId}`)
    } catch (error: any) {
      console.error('Error posting:', error)
      toast.error(error.response?.data?.error || 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold neon-text mb-4">Share Your Interview Experience</h1>
          <p className="text-muted-foreground">Help others by sharing your interview journey</p>
        </motion.div>

        {/* Post Type Selector */}
        <div className="glass-card p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setPostType('experience')}
              className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                postType === 'experience'
                  ? 'bg-neon-cyan text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-card/80'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Interview Experience
            </button>
            <button
              onClick={() => setPostType('article')}
              className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                postType === 'article'
                  ? 'bg-neon-cyan text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-card/80'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Article
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neon-cyan">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neon-cyan">Domain *</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as Domain)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-ring"
            >
              {(Object.keys(DOMAINS) as Domain[]).map(domainId => (
                <option key={domainId} value={domainId}>
                  {DOMAINS[domainId].icon} {DOMAINS[domainId].name}
                </option>
              ))}
            </select>
          </div>

          {/* Experience-specific fields */}
          {postType === 'experience' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neon-cyan">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neon-cyan">Position</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Job position"
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neon-cyan">Company Type</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-ring"
                  >
                    <option value="product-based">Product-based</option>
                    <option value="service-based">Service-based</option>
                    <option value="startup">Startup</option>
                    <option value="faang">FAANG</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neon-cyan">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-ring"
                  >
                    <option value="intern">Intern</option>
                    <option value="new-grad">New Grad</option>
                    <option value="mid-level">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-neon-cyan">Verdict</label>
                <select
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value as any)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-ring"
                >
                  <option value="pending">Pending</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </>
          )}

          {/* Article-specific fields */}
          {postType === 'article' && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neon-cyan">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-ring"
                >
                  <option value="preparation">Preparation</option>
                  <option value="resume">Resume</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="technical">Technical</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neon-cyan">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary (optional, auto-generated if empty)"
                  rows={3}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                />
              </div>
            </>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neon-cyan">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your experience/article here..."
              rows={15}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neon-cyan">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-neon-cyan text-primary-foreground rounded-lg font-bold hover:bg-neon-cyan/80"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tips (Experience only) */}
          {postType === 'experience' && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-neon-cyan">Tips</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tipInput}
                  onChange={(e) => setTipInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
                  placeholder="Add a tip and press Enter"
                  className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                />
                <button
                  onClick={addTip}
                  className="px-4 py-2 bg-neon-cyan text-primary-foreground rounded-lg font-bold hover:bg-neon-cyan/80"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {tips.map((tip, idx) => (
                  <div key={idx} className="px-3 py-2 bg-card rounded-lg flex items-center justify-between">
                    <span className="text-sm">{tip}</span>
                    <button onClick={() => removeTip(tip)} className="text-red-400 hover:text-red-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-card text-muted-foreground rounded-lg font-bold hover:bg-card/80 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title || !content}
              className="flex-1 px-6 py-3 bg-neon-cyan text-primary-foreground rounded-lg font-bold hover:bg-neon-cyan/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Post {postType === 'experience' ? 'Experience' : 'Article'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



