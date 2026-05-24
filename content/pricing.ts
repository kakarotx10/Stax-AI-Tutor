// Pricing Plans Configuration
import { Domain, DOMAINS } from './subjects'

export type PlanType = 'platinum' | 'gold' | 'silver' | 'custom'

export interface PlanFeature {
  id: string
  name: string
  included: boolean
}

export interface PricingPlan {
  id: PlanType
  name: string
  description: string
  price: number
  originalPrice?: number
  currency: string
  duration: 'monthly' | 'yearly' | 'lifetime'
  domains: Domain[]
  features: PlanFeature[]
  popular?: boolean
  badge?: string
}

export interface CustomPlanConfig {
  selectedDomains: Domain[]
  price: number
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  platinum: {
    id: 'platinum',
    name: 'Platinum Plan',
    description: 'Complete access to all 4 domains - Ultimate preparation',
    price: 999,
    originalPrice: 1499,
    currency: 'INR',
    duration: 'monthly',
    domains: ['placement', 'frontend', 'backend', 'aiml'],
    popular: true,
    badge: 'Most Popular',
    features: [
      { id: 'all-domains', name: 'Access to all 4 domains', included: true },
      { id: 'all-subjects', name: 'All subjects in each domain', included: true },
      { id: 'unlimited-practice', name: 'Unlimited practice problems', included: true },
      { id: 'all-battles', name: 'All battle types (Contests, Marathons, Duels, Standoffs)', included: true },
      { id: 'interview-prep', name: 'Interview experiences & hiring processes', included: true },
      { id: 'video-lectures', name: 'YouTube video suggestions for each topic', included: true },
      { id: 'ai-assistance', name: 'AI-powered hints and explanations', included: true },
      { id: 'progress-tracking', name: 'Detailed progress tracking', included: true },
      { id: 'certificates', name: 'Completion certificates', included: true },
      { id: 'priority-support', name: 'Priority support', included: true },
    ],
  },
  gold: {
    id: 'gold',
    name: 'Gold Plan',
    description: 'Access to 3 domains - Comprehensive learning',
    price: 699,
    originalPrice: 999,
    currency: 'INR',
    duration: 'monthly',
    domains: ['placement', 'frontend', 'backend'],
    features: [
      { id: 'three-domains', name: 'Access to 3 domains (Placement, Frontend, Backend)', included: true },
      { id: 'all-subjects', name: 'All subjects in selected domains', included: true },
      { id: 'unlimited-practice', name: 'Unlimited practice problems', included: true },
      { id: 'battles', name: 'All battle types in selected domains', included: true },
      { id: 'interview-prep', name: 'Interview experiences & hiring processes', included: true },
      { id: 'video-lectures', name: 'YouTube video suggestions', included: true },
      { id: 'ai-assistance', name: 'AI-powered hints', included: true },
      { id: 'progress-tracking', name: 'Progress tracking', included: true },
      { id: 'certificates', name: 'Completion certificates', included: false },
      { id: 'priority-support', name: 'Priority support', included: false },
    ],
  },
  silver: {
    id: 'silver',
    name: 'Silver Plan',
    description: 'Access to 2 domains - Focused learning',
    price: 499,
    originalPrice: 699,
    currency: 'INR',
    duration: 'monthly',
    domains: ['placement', 'frontend'],
    features: [
      { id: 'two-domains', name: 'Access to 2 domains (Placement, Frontend)', included: true },
      { id: 'all-subjects', name: 'All subjects in selected domains', included: true },
      { id: 'limited-practice', name: 'Limited practice problems (50/month)', included: true },
      { id: 'battles', name: 'Contests and Marathons only', included: true },
      { id: 'interview-prep', name: 'Basic interview resources', included: true },
      { id: 'video-lectures', name: 'YouTube video suggestions', included: true },
      { id: 'ai-assistance', name: 'Limited AI hints', included: true },
      { id: 'progress-tracking', name: 'Basic progress tracking', included: true },
      { id: 'certificates', name: 'Completion certificates', included: false },
      { id: 'priority-support', name: 'Priority support', included: false },
    ],
  },
  custom: {
    id: 'custom',
    name: 'Custom Plan',
    description: 'Build your own plan - Choose domains that fit your needs',
    price: 0, // Calculated dynamically
    currency: 'INR',
    duration: 'monthly',
    domains: [],
    features: [
      { id: 'custom-domains', name: 'Choose your domains', included: true },
      { id: 'all-subjects', name: 'All subjects in selected domains', included: true },
      { id: 'unlimited-practice', name: 'Unlimited practice problems', included: true },
      { id: 'battles', name: 'All battle types in selected domains', included: true },
      { id: 'interview-prep', name: 'Interview experiences', included: true },
      { id: 'video-lectures', name: 'YouTube video suggestions', included: true },
      { id: 'ai-assistance', name: 'AI-powered hints', included: true },
      { id: 'progress-tracking', name: 'Progress tracking', included: true },
    ],
  },
}

// Domain pricing (for custom plans)
export const DOMAIN_PRICING: Record<Domain, number> = {
  placement: 299,
  frontend: 249,
  backend: 249,
  aiml: 299,
  'stax-interview': 199,
}

// Calculate custom plan price
export function calculateCustomPlanPrice(selectedDomains: Domain[]): number {
  return selectedDomains.reduce((total, domain) => {
    return total + (DOMAIN_PRICING[domain] || 0)
  }, 0)
}

// Get plan by ID
export function getPlan(planId: PlanType): PricingPlan {
  return PRICING_PLANS[planId]
}

// Check if user has access to domain
export function hasDomainAccess(userPlan: PlanType | null, domain: Domain): boolean {
  if (!userPlan) return false
  if (userPlan === 'platinum') return true
  const plan = PRICING_PLANS[userPlan]
  return plan.domains.includes(domain)
}

// Get all available plans
export function getAllPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS)
}



