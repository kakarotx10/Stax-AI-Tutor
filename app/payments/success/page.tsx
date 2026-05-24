'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const txnid = searchParams?.get('txnid')
  const status = searchParams?.get('status')

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-lg text-center"
      >
        <CheckCircle2 className="w-16 h-16 text-neon-green mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-4">Thank you for purchasing a plan.</p>
        {txnid && (
          <p className="text-sm text-muted-foreground/80 mb-4">Transaction ID: {txnid}</p>
        )}
        <p className="text-sm text-muted-foreground/80 mb-6">Status: {status || 'success'}</p>
        <button
          onClick={() => router.push('/pricing')}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </button>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8 text-muted-foreground">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
