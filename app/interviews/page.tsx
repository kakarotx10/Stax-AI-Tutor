'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { InterviewExperience, InterviewArticle } from '@/lib/types/interviews'
import { Domain } from '@/lib/subjects'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  CompetitionHeader,
  DomainBadge,
  DomainFilterBar,
  ModeTabs,
} from '@/components/competition/CompetitionUI'

const interviewTabs = [
  { value: 'experiences' as const, label: 'Experiences', icon: Users },
  { value: 'articles' as const, label: 'Articles', icon: BookOpen },
]

const verdictStyles: Record<InterviewExperience['verdict'], string> = {
  selected: 'border-success/30 bg-success/10 text-success',
  rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
  pending: 'border-border bg-muted text-muted-foreground',
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function VerdictBadge({ verdict }: { verdict: InterviewExperience['verdict'] }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${verdictStyles[verdict]}`}
    >
      {verdict}
    </span>
  )
}

function TagList({ tags, limit }: { tags: string[]; limit: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, limit).map((tag) => (
        <span
          key={tag}
          className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function ResourceStats({
  views,
  likes,
  comments,
}: {
  views: number
  likes: number
  comments?: number
}) {
  return (
    <div className="flex items-center gap-4 text-body-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Eye className="h-4 w-4" />
        {views}
      </span>
      <span className="flex items-center gap-1.5">
        <Heart className="h-4 w-4" />
        {likes}
      </span>
      {typeof comments === 'number' && (
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          {comments}
        </span>
      )}
    </div>
  )
}

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<'experiences' | 'articles'>('experiences')
  const [experiences, setExperiences] = useState<InterviewExperience[]>([])
  const [articles, setArticles] = useState<InterviewArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab, domainFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('type', activeTab)
      if (domainFilter !== 'all') {
        params.append('domain', domainFilter)
      }

      const response = await axios.get(`/api/interviews?${params.toString()}`)

      if (activeTab === 'experiences') {
        setExperiences(response.data.experiences || [])
      } else {
        setArticles(response.data.articles || [])
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Failed to load interview resources')
    } finally {
      setLoading(false)
    }
  }

  const filteredExperiences = experiences.filter((exp) =>
    searchQuery === '' ||
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredArticles = articles.filter((art) =>
    searchQuery === '' ||
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <main className="page-shell pt-24">
      <div className="page-container space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CompetitionHeader
            icon={Briefcase}
            title="Interview Resources"
            description="Browse real interview experiences, preparation notes, and practical hiring-process writeups."
          />
        </motion.div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ModeTabs tabs={interviewTabs} value={activeTab} onChange={setActiveTab} />
          <Button asChild className="h-10 self-start lg:self-auto">
            <Link href="/interviews/post">
              <Plus className="h-4 w-4" />
              Post {activeTab === 'experiences' ? 'Experience' : 'Article'}
            </Link>
          </Button>
        </div>

        <section className="space-y-5 rounded-[10px] border border-border bg-surface-1 p-4 shadow-soft">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search ${activeTab === 'experiences' ? 'companies, roles, or tags' : 'articles, categories, or tags'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10"
            />
          </div>

          <DomainFilterBar selectedDomain={domainFilter} onSelect={setDomainFilter} />
        </section>

        {loading ? (
          <div className="rounded-[10px] border border-border bg-card p-12 text-center shadow-card">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading interview resources...</p>
          </div>
        ) : activeTab === 'experiences' ? (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredExperiences.length === 0 ? (
              <div className="rounded-[10px] border border-border bg-card p-12 text-center shadow-card lg:col-span-2">
                <Briefcase className="mx-auto mb-4 h-14 w-14 text-muted-foreground/70" />
                <p className="mb-4 text-muted-foreground">No interview experiences found</p>
                <Button asChild>
                  <Link href="/interviews/post">Share Your Experience</Link>
                </Button>
              </div>
            ) : (
              filteredExperiences.map((exp, idx) => (
                <motion.article
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="group rounded-[10px] border border-border bg-card shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/30"
                >
                  <Link href={`/interviews/experiences/${exp.id}`} className="block h-full p-5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-h4 text-foreground transition-colors group-hover:text-primary">
                          {exp.title}
                        </h2>
                        <p className="mt-2 text-body-sm text-muted-foreground">
                          {exp.company} / {exp.position}
                        </p>
                      </div>
                      <VerdictBadge verdict={exp.verdict} />
                    </div>

                    <div className="mb-5 flex flex-wrap items-center gap-3 text-body-sm text-muted-foreground">
                      <DomainBadge domain={exp.domain} />
                      <span>{exp.rounds.length} rounds</span>
                      <span className="capitalize">{exp.experienceLevel.replace(/-/g, ' ')}</span>
                    </div>

                    <TagList tags={exp.tags} limit={3} />

                    <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 text-body-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                      <ResourceStats views={exp.views} likes={exp.likes} comments={exp.comments} />
                      <span>{formatDate(exp.createdAt)}</span>
                    </div>
                  </Link>
                </motion.article>
              ))
            )}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.length === 0 ? (
              <div className="rounded-[10px] border border-border bg-card p-12 text-center shadow-card md:col-span-2 xl:col-span-3">
                <BookOpen className="mx-auto mb-4 h-14 w-14 text-muted-foreground/70" />
                <p className="mb-4 text-muted-foreground">No articles found</p>
                <Button asChild>
                  <Link href="/interviews/post">Write an Article</Link>
                </Button>
              </div>
            ) : (
              filteredArticles.map((art, idx) => (
                <motion.article
                  key={art.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="group rounded-[10px] border border-border bg-card shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/30"
                >
                  <Link href={`/interviews/articles/${art.id}`} className="flex h-full flex-col p-5">
                    {art.featuredImage && (
                      <div
                        className="mb-5 h-40 rounded-[8px] border border-border bg-muted bg-cover bg-center"
                        style={{ backgroundImage: `url(${art.featuredImage})` }}
                      />
                    )}

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <DomainBadge domain={art.domain} />
                      <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                        {art.category}
                      </span>
                    </div>

                    <h2 className="text-h4 text-foreground transition-colors group-hover:text-primary">
                      {art.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-body-sm text-muted-foreground">
                      {art.excerpt}
                    </p>

                    <div className="mt-5">
                      <TagList tags={art.tags} limit={2} />
                    </div>

                    <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 text-body-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                      <ResourceStats views={art.views} likes={art.likes} />
                      <span>{formatDate(art.createdAt)}</span>
                    </div>
                  </Link>
                </motion.article>
              ))
            )}
          </section>
        )}
      </div>
    </main>
  )
}
