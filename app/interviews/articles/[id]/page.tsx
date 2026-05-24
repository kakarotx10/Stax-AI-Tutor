'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, MessageCircle, Eye, Calendar, User } from 'lucide-react'
import { InterviewArticle } from '@/lib/types/interviews'
import { DOMAINS } from '@/lib/subjects'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<InterviewArticle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticle()
  }, [params.id])

  const loadArticle = async () => {
    try {
      const response = await axios.get(`/api/interviews/articles?id=${params.id}`)
      setArticle(response.data.article)
    } catch (error: any) {
      console.error('Error loading article:', error)
      toast.error('Failed to load article')
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
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Article not found</p>
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
          <h1 className="text-4xl font-bold neon-text mb-4">{article.title}</h1>
          
          {article.featuredImage && (
            <div className="w-full h-64 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg mb-6" />
          )}

          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <span>{DOMAINS[article.domain]?.icon}</span>
              <span>{DOMAINS[article.domain]?.name}</span>
            </div>
            <span>•</span>
            <span className="capitalize">{article.category}</span>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.views} views</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map(tag => (
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
            <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed text-lg">
              {article.content}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card/80 transition-all"
            >
              <Heart className="w-5 h-5 text-red-400" />
              <span>{article.likes}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card/80 transition-all">
              <MessageCircle className="w-5 h-5 text-neon-cyan" />
              <span>{article.comments}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



