'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  PRICING_PLANS,
  DOMAIN_PRICING,
  calculateCustomPlanPrice,
  type PlanType,
} from '@/lib/pricing'
import { DOMAINS, type Domain } from '@/lib/subjects'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DomainIcon } from '@/components/competition/CompetitionUI'
import { ArrowRight, Check, Crown, Layers3, ShieldCheck, Sparkles, Star, X, Zap } from 'lucide-react'

const paidPlanIds = ['platinum', 'gold', 'silver'] as const

const planVisuals = {
  platinum: {
    icon: Crown,
    label: 'Best for full preparation',
    accent: 'border-primary/35 bg-primary/10 text-primary',
    bar: 'bg-primary',
  },
  gold: {
    icon: Star,
    label: 'Balanced coverage',
    accent: 'border-warning/35 bg-warning/10 text-warning',
    bar: 'bg-warning',
  },
  silver: {
    icon: Zap,
    label: 'Focused starter',
    accent: 'border-info/35 bg-info/10 text-info',
    bar: 'bg-info',
  },
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [customDomains, setCustomDomains] = useState<Domain[]>([])
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)

  const handlePlanSelect = (planId: PlanType) => {
    if (planId === 'custom') {
      setShowCustomBuilder(true)
      setSelectedPlan('custom')
    } else {
      setSelectedPlan(planId)
      void handlePurchase(planId)
    }
  }

  const handlePurchase = async (planId: PlanType) => {
    try {
      // TODO: Replace with real user data from auth/profile
      const name = 'Test User'
      const email = 'test@example.com'
      const phone = '9999999999'

      const res = await axios.post('/api/payments/payu/checkout', {
        planId,
        name,
        email,
        phone,
      })

      const { actionUrl, params } = res.data as {
        actionUrl: string
        params: Record<string, string>
      }

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = actionUrl

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (error: any) {
      console.error('Error starting payment:', error)
      alert(error?.response?.data?.error || 'Failed to start payment')
    }
  }

  const toggleDomain = (domain: Domain) => {
    setCustomDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    )
  }

  const customPrice = calculateCustomPlanPrice(customDomains)

  const handleCustomPurchase = async () => {
    if (customDomains.length === 0) {
      alert('Please select at least one domain')
      return
    }

    try {
      const name = 'Test User'
      const email = 'test@example.com'
      const phone = '9999999999'

      const res = await axios.post('/api/payments/payu/checkout', {
        planId: 'custom',
        customDomains,
        name,
        email,
        phone,
      })

      const { actionUrl, params } = res.data as {
        actionUrl: string
        params: Record<string, string>
      }

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = actionUrl

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (error: any) {
      console.error('Error starting custom payment:', error)
      alert(error?.response?.data?.error || 'Failed to start payment')
    }
  }

  return (
    <main className="page-shell pt-20">
      <div className="page-container space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_360px] lg:items-end"
        >
          <div>
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h1 className="max-w-3xl text-h1 text-foreground">
              Pick the prep coverage you need.
            </h1>
            <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
              Upgrade from focused domain practice to complete interview preparation without changing your learning flow.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-success/25 bg-success/10 text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Included in every plan</p>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  Progress tracking, AI practice, saved attempts, and dashboard history.
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paidPlanIds.map((planId, index) => {
            const plan = PRICING_PLANS[planId]
            const visual = planVisuals[planId]
            const Icon = visual.icon

            return (
              <motion.article
                key={planId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`group relative grid min-h-[392px] grid-rows-[auto_auto_auto_1fr_auto] overflow-hidden rounded-2xl border bg-card/90 p-5 shadow-card backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:shadow-elevated ${
                  plan.popular ? 'border-primary/55' : 'border-border hover:border-border-strong'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${visual.bar}`} />
                <div className="flex min-h-11 items-start justify-between gap-3 pt-1">
                  <div className="min-w-0">
                    <p className="text-caption uppercase text-muted-foreground">{visual.label}</p>
                    <div className="mt-2 h-6">
                      {plan.popular && (
                        <Badge variant="solid">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${visual.accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="text-h4 text-foreground">{plan.name}</h2>
                  <p className="mt-2 min-h-[44px] text-body-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-5 min-h-[98px] rounded-2xl border border-border bg-surface-1/70 p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                    <span className="text-body-sm text-muted-foreground">/{plan.duration}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="mt-1 text-caption text-muted-foreground">
                      Usually <span className="line-through">₹{plan.originalPrice}</span>
                    </p>
                  )}
                </div>

                <div className="mt-5 space-y-3 pb-5">
                  <p className="text-sm font-semibold text-foreground">
                    {plan.domains.length} domain{plan.domains.length > 1 ? 's' : ''} included
                  </p>
                  <div className="space-y-2">
                    {plan.domains.map(domainId => (
                      <div key={domainId} className="flex items-center gap-2 text-body-sm text-muted-foreground">
                        <DomainIcon domain={domainId} className="h-4 w-4 text-primary" />
                        <span>{DOMAINS[domainId].name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handlePlanSelect(planId)}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  Continue with {plan.name.replace(' Plan', '')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.article>
            )
          })}

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative grid min-h-[392px] grid-rows-[auto_auto_auto_1fr_auto] overflow-hidden rounded-2xl border border-dashed border-border bg-card/70 p-5 shadow-soft backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:bg-card/90"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <div className="flex min-h-11 items-start justify-between gap-3 pt-1">
              <div className="min-w-0">
                <p className="text-caption uppercase text-muted-foreground">Build your own</p>
                <div className="mt-2 h-6" />
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5">
              <h2 className="text-h4 text-foreground">{PRICING_PLANS.custom.name}</h2>
              <p className="mt-2 min-h-[44px] text-body-sm leading-6 text-muted-foreground">
                Choose only the domains that match your current interview target.
              </p>
            </div>
            <div className="mt-5 min-h-[98px] rounded-2xl border border-border bg-surface-1/70 p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">₹{customPrice || 0}</span>
                <span className="text-body-sm text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-caption text-muted-foreground">
                {customDomains.length || 'No'} domain{customDomains.length === 1 ? '' : 's'} selected
              </p>
            </div>
            <div className="mt-5 space-y-2 pb-5 text-body-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-accent" />
                Modular domain access
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Same dashboard and progress system
              </div>
            </div>
            <Button
              onClick={() => handlePlanSelect('custom')}
              variant="secondary"
              className="w-full"
            >
              Build custom bundle
            </Button>
          </motion.article>
        </section>

        {showCustomBuilder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card/90 p-5 shadow-card backdrop-blur-xl sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-caption uppercase text-accent">Custom builder</p>
                <h2 className="mt-1 text-h3">Choose domains</h2>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  Select only the learning areas you want unlocked this month.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1/80 px-4 py-3">
                <p className="text-caption uppercase text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">₹{customPrice}</p>
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(DOMAINS) as Domain[]).map(domainId => {
                const domain = DOMAINS[domainId]
                const isSelected = customDomains.includes(domainId)
                const price = DOMAIN_PRICING[domainId]
                
                return (
                  <motion.div
                    key={domainId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleDomain(domainId)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-soft'
                        : 'border-border bg-card/70 hover:border-primary/60 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="icon-tile h-10 w-10">
                          <DomainIcon domain={domainId} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold">{domain.name}</h3>
                          <p className="text-sm text-muted-foreground">{domain.subjects.length} subjects</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₹{price}</div>
                        {isSelected && (
                          <Check className="mt-1 h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="border-t border-border pt-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-body-sm text-muted-foreground">
                    {customDomains.length} domain{customDomains.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => {
                      setShowCustomBuilder(false)
                      setCustomDomains([])
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCustomPurchase}
                    disabled={customDomains.length === 0}
                  >
                    Purchase Custom Plan
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card>
            <CardHeader className="text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-success" />
              <CardTitle>Feature comparison</CardTitle>
              <CardDescription>Compare plan coverage before checkout.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-center">Silver</TableHead>
                  <TableHead className="text-center">Gold</TableHead>
                  <TableHead className="text-center">Platinum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRICING_PLANS.platinum.features.map((feature, idx) => (
                  <TableRow key={feature.id}>
                    <TableCell>{feature.name}</TableCell>
                    <TableCell className="text-center">
                      {PRICING_PLANS.silver.features[idx]?.included ? (
                        <Check className="mx-auto h-5 w-5 text-success" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {PRICING_PLANS.gold.features[idx]?.included ? (
                        <Check className="mx-auto h-5 w-5 text-success" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="mx-auto h-5 w-5 text-success" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
