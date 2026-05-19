'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  CreditCard,
  Flame,
  Home,
  Sword,
  Trophy,
  User,
  Users,
} from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
    { href: '/interviews', label: 'Interviews', icon: Briefcase },
    { href: '/contests', label: 'Contests', icon: Trophy },
    { href: '/duels', label: 'Duels', icon: Sword },
    { href: '/standoffs', label: 'Standoffs', icon: Users },
    { href: '/marathons', label: 'Marathons', icon: Flame },
  ]

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-stone-100/10 bg-[#0b0a08]/85 shadow-[0_12px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b48a]"
            aria-label="Stax AI Tutor home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9b48a]/30 bg-[#c9b48a]/10 text-[#c9b48a] transition group-hover:border-[#c9b48a]/60">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-serif text-base tracking-tight text-stone-50">
                Stax
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-stone-400">
                AI Tutor
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 justify-end">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-stone-100/10 bg-stone-100/[0.035] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className={`relative shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b48a] ${
                      isActive
                        ? 'text-stone-50'
                        : 'text-stone-400 hover:bg-stone-100/[0.06] hover:text-stone-100'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-full bg-[#c9b48a]/15 shadow-[0_8px_24px_rgba(0,0,0,0.24)]"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
