'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Briefcase, BookOpen, Plus, X, Save } from 'lucide-react'
import { Domain, DOMAINS } from '@/lib/subjects'
import { InterviewType, ExperienceLevel, CompanyType } from '@/lib/types/interviews'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { ModeTabs } from '@/components/competition/CompetitionUI'

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

  const postTabs = [
    { value: 'experience' as const, label: 'Experience', icon: Briefcase },
    { value: 'article' as const, label: 'Article', icon: BookOpen },
  ]

  return (
    <main className="page-shell pt-24">
      <div className="page-container max-w-5xl space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border pb-7"
        >
          <p className="text-eyebrow uppercase text-primary">Community resource</p>
          <h1 className="mt-2 text-h1 text-foreground">Share an interview resource</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
            Publish a structured experience or article that helps learners prepare with real context.
          </p>
        </motion.header>

        <div className="flex justify-start">
          <ModeTabs tabs={postTabs} value={postType} onChange={setPostType} />
        </div>

        <section className="surface-card p-5 sm:p-6">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="text-foreground">Domain *</Label>
                <NativeSelect
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                >
                  {(Object.keys(DOMAINS) as Domain[]).map(domainId => (
                    <option key={domainId} value={domainId}>
                      {DOMAINS[domainId].name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            {postType === 'experience' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">Company</Label>
                  <Input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-foreground">Position</Label>
                  <Input
                    id="position"
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Job position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyType" className="text-foreground">Company type</Label>
                  <NativeSelect
                    id="companyType"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                  >
                    <option value="product-based">Product-based</option>
                    <option value="service-based">Service-based</option>
                    <option value="startup">Startup</option>
                    <option value="faang">FAANG</option>
                    <option value="other">Other</option>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="text-foreground">Experience level</Label>
                  <NativeSelect
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  >
                    <option value="intern">Intern</option>
                    <option value="new-grad">New Grad</option>
                    <option value="mid-level">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="staff">Staff</option>
                  </NativeSelect>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="verdict" className="text-foreground">Verdict</Label>
                  <NativeSelect
                    id="verdict"
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value as any)}
                  >
                    <option value="pending">Pending</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </NativeSelect>
                </div>
              </div>
            )}

            {postType === 'article' && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">Category</Label>
                  <NativeSelect
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="preparation">Preparation</option>
                    <option value="resume">Resume</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="technical">Technical</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="general">General</option>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-foreground">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary (optional, auto-generated if empty)"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your experience or article here..."
                rows={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagInput" className="text-foreground">Tags</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="tagInput"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="rounded-full hover:text-destructive" aria-label={`Remove ${tag}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {postType === 'experience' && (
              <div className="space-y-2">
                <Label htmlFor="tipInput" className="text-foreground">Tips</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="tipInput"
                    type="text"
                    value={tipInput}
                    onChange={(e) => setTipInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
                    placeholder="Add a tip and press Enter"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTip} variant="secondary">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {tips.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {tips.map((tip, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-1/80 px-3 py-2">
                        <span className="text-sm text-foreground">{tip}</span>
                        <button type="button" onClick={() => removeTip(tip)} className="rounded-full text-muted-foreground hover:text-destructive" aria-label="Remove tip">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row">
              <Button type="button" onClick={() => router.back()} variant="secondary" className="sm:w-40">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                loading={loading}
                disabled={!title || !content}
                className="flex-1"
              >
                <Save className="h-4 w-4" />
                Post {postType === 'experience' ? 'Experience' : 'Article'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}



