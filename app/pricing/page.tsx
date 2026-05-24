'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  PRICING_PLANS,
  DOMAIN_PRICING,
  calculateCustomPlanPrice,
  type PlanType,
} from '@/lib/pricing'
import { DOMAINS, type Domain } from '@/lib/subjects'
import { Button } from '@/components/ui/Button'
import { Check, X, Sparkles, Crown, Star, Zap } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()
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
    <div className="page-shell">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header mb-16 text-center"
        >
          <h1 className="page-title">
            Choose Your Plan
          </h1>
          <p className="page-description mx-auto">
            Select the perfect plan for your learning journey. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(['platinum', 'gold', 'silver'] as PlanType[]).map((planId) => {
            const plan = PRICING_PLANS[planId]
            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: planId === 'platinum' ? 0.1 : planId === 'gold' ? 0.2 : 0.3 }}
                className={`glass-card relative p-6 ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">
                    {planId === 'platinum' && <Crown className="w-12 h-12 text-neon-cyan mx-auto mb-2" />}
                    {planId === 'gold' && <Star className="w-12 h-12 text-yellow-400 mx-auto mb-2" />}
                    {planId === 'silver' && <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-2" />}
                  </div>
                  <h3 className="mb-2 text-h4">{plan.name}</h3>
                  <p className="mb-4 text-body-sm text-muted-foreground">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-h3 text-primary">
                      ₹{plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="ml-2 text-muted-foreground line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                    <div className="mt-1 text-body-sm text-muted-foreground">/{plan.duration}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm font-semibold text-neon-cyan mb-2">
                    Includes {plan.domains.length} domain{plan.domains.length > 1 ? 's' : ''}:
                  </div>
                  {plan.domains.map(domainId => (
                    <div key={domainId} className="text-sm text-muted-foreground">
                      • {DOMAINS[domainId].name}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelect(planId)}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  Choose Plan
                </Button>
              </motion.div>
            )
          })}

          {/* Custom Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card relative border-2 border-dashed border-secondary p-6"
          >
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-neon-purple mx-auto mb-2" />
              <h3 className="mb-2 text-h4">{PRICING_PLANS.custom.name}</h3>
              <p className="mb-4 text-body-sm text-muted-foreground">{PRICING_PLANS.custom.description}</p>
              
              <div className="mb-4">
                <span className="text-h3 text-secondary">
                  ₹{customPrice || 0}
                </span>
                <div className="mt-1 text-body-sm text-muted-foreground">/month</div>
              </div>
            </div>

            <Button
              onClick={() => handlePlanSelect('custom')}
              variant="secondary"
              className="w-full"
            >
              Build Custom Plan
            </Button>
          </motion.div>
        </div>

        {/* Custom Plan Builder */}
        {showCustomBuilder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-4xl mx-auto"
          >
            <h2 className="mb-6 text-center text-h3">Build Your Custom Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{domain.icon}</span>
                        <div>
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

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-h4">
                    Total: ₹{customPrice}
                  </div>
                  <div className="text-body-sm text-muted-foreground">
                    {customDomains.length} domain{customDomains.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
                <div className="flex gap-4">
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

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 mt-12"
        >
          <h2 className="mb-8 text-center text-h3">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Silver</th>
                  <th className="text-center py-4 px-4">Gold</th>
                  <th className="text-center py-4 px-4">Platinum</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_PLANS.platinum.features.map((feature, idx) => (
                  <tr key={feature.id} className="border-b border-border">
                    <td className="py-4 px-4">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {PRICING_PLANS.silver.features[idx]?.included ? (
                        <Check className="w-5 h-5 text-neon-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {PRICING_PLANS.gold.features[idx]?.included ? (
                        <Check className="w-5 h-5 text-neon-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="w-5 h-5 text-neon-green mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
