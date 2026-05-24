'use client'

import { motion } from 'framer-motion'
import { Youtube, ExternalLink } from 'lucide-react'

interface YouTubeVideosProps {
  videoIds: string[]
  title?: string
}

export default function YouTubeVideos({ videoIds, title = 'Video Lectures' }: YouTubeVideosProps) {
  if (!videoIds || videoIds.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Youtube className="w-6 h-6 text-red-500" />
        <h3 className="text-xl font-bold text-neon-cyan">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videoIds.map((videoId, idx) => (
          <motion.div
            key={videoId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="relative group"
          >
            <div className="relative aspect-video bg-background rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`YouTube video ${idx + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 px-3 py-1 bg-red-500/80 hover:bg-red-500 text-foreground rounded-lg text-sm font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              Watch on YouTube
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}



