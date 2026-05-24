'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, BookOpen, Users, Search, Plus, Filter, Eye, Heart, MessageCircle } from 'lucide-react'
import { InterviewExperience, InterviewArticle } from '@/lib/types/interviews'
import { Domain, DOMAINS } from '@/lib/subjects'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredExperiences = experiences.filter(exp => 
    searchQuery === '' || 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredArticles = articles.filter(art =>
    searchQuery === '' ||
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="page-shell">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            Interview Resources
          </h1>
          <p className="page-description">
            Learn from real interview experiences and expert articles
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('experiences')}
            variant={activeTab === 'experiences' ? 'primary' : 'outline'}
          >
            <Users className="w-5 h-5" />
            Experiences
          </Button>
          <Button
            onClick={() => setActiveTab('articles')}
            variant={activeTab === 'articles' ? 'primary' : 'outline'}
          >
            <BookOpen className="w-5 h-5" />
            Articles
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/interviews/post">
              <Button>
                <Plus className="w-5 h-5" />
                Post {activeTab === 'experiences' ? 'Experience' : 'Article'}
              </Button>
            </Link>
          </div>

          {/* Domain Filter */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-body-sm font-semibold text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filter by Domain
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setDomainFilter('all')}
                variant={domainFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
              >
                All
              </Button>
              {(Object.keys(DOMAINS) as Domain[]).map(domainId => {
                const domain = DOMAINS[domainId]
                return (
                  <Button
                    key={domainId}
                    onClick={() => setDomainFilter(domainId)}
                    variant={domainFilter === domainId ? 'primary' : 'outline'}
                    size="sm"
                  >
                    <span>{domain.icon}</span>
                    <span>{domain.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : activeTab === 'experiences' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExperiences.length === 0 ? (
              <div className="col-span-2 glass-card p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No interview experiences found</p>
                <Link href="/interviews/post">
                  <Button>Share Your Experience</Button>
                </Link>
              </div>
            ) : (
              filteredExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card cursor-pointer p-6 transition-colors hover:border-primary/60"
                >
                  <Link href={`/interviews/experiences/${exp.id}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="mb-2 text-h4 text-primary">{exp.title}</h3>
                        <div className="mb-2 flex items-center gap-2 text-body-sm text-muted-foreground">
                          <span>{exp.company}</span>
                          <span>-</span>
                          <span>{exp.position}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        exp.verdict === 'selected' ? 'bg-neon-green/20 text-neon-green' :
                        exp.verdict === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {exp.verdict.toUpperCase()}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-4 text-body-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>{DOMAINS[exp.domain]?.icon}</span>
                        <span>{DOMAINS[exp.domain]?.name}</span>
                      </div>
                      <span>-</span>
                      <span>{exp.rounds.length} rounds</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {exp.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {exp.views}</span>
                        <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {exp.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {exp.comments}</span>
                      </div>
                      <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-3 glass-card p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No articles found</p>
                <Link href="/interviews/post">
                  <Button>Write an Article</Button>
                </Link>
              </div>
            ) : (
              filteredArticles.map((art, idx) => (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card cursor-pointer p-6 transition-colors hover:border-primary/60"
                >
                  <Link href={`/interviews/articles/${art.id}`}>
                    {art.featuredImage && (
                      <div className="w-full h-40 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg mb-4" />
                    )}
                    <h3 className="mb-2 text-h4 text-primary">{art.title}</h3>
                    <p className="mb-4 line-clamp-3 text-body-sm text-muted-foreground">{art.excerpt}</p>
                    
                    <div className="mb-4 flex items-center gap-2 text-body-sm text-muted-foreground">
                      <span>{DOMAINS[art.domain]?.icon}</span>
                      <span>{DOMAINS[art.domain]?.name}</span>
                      <span>-</span>
                      <span className="capitalize">{art.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {art.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {art.views}</span>
                        <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {art.likes}</span>
                      </div>
                      <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}



