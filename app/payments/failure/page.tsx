'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/loading-state'

function PaymentFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const txnid = searchParams?.get('txnid')
  const status = searchParams?.get('status')

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card max-w-lg p-8 text-center"
      >
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <XCircle className="h-8 w-8" />
        </span>
        <h1 className="mb-2 text-h3">Payment failed</h1>
        <p className="text-muted-foreground mb-4">Something went wrong with your payment.</p>
        {txnid && (
          <p className="text-sm text-muted-foreground/80 mb-4">Transaction ID: {txnid}</p>
        )}
        <p className="text-sm text-muted-foreground/80 mb-6">Status: {status || 'failed'}</p>
        <Button
          onClick={() => router.push('/pricing')}
          className="mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Button>
      </motion.div>
    </main>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading payment status..." />}>
      <PaymentFailureContent />
    </Suspense>
  )
}
