'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SUBJECTS, type Subject } from '@/lib/subjects'
import GamifiedJourney from '@/components/GamifiedJourney'
import { ArrowLeft } from 'lucide-react'

export default function JourneyPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as Subject
  const unitId = params.unitId as string

  const subject = SUBJECTS[subjectId]
  const unit = subject?.units.find(u => u.id === unitId)

  if (!subject || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Unit not found</h1>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push(`/subject/${subjectId}`)}
        className="fixed left-4 top-20 z-50 btn-secondary flex items-center gap-2 sm:left-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </motion.button>

      <GamifiedJourney subjectId={subjectId} unitId={unitId} />
    </div>
  )
}
















