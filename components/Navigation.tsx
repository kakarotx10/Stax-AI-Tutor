'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  CreditCard,
  Flame,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  Sword,
  Trophy,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export default function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const publicItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
  ]

  const privateItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
    { href: '/interviews', label: 'Interviews', icon: Briefcase },
    { href: '/contests', label: 'Contests', icon: Trophy },
    { href: '/duels', label: 'Duels', icon: Sword },
    { href: '/standoffs', label: 'Standoffs', icon: Users },
    { href: '/marathons', label: 'Marathons', icon: Flame },
  ]

  const navItems = isAuthenticated ? privateItems : publicItems

  const userInitial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/85 shadow-soft backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Stax AI Tutor home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary/60">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-base font-semibold text-foreground">
                Stax
              </span>
              <span className="block text-caption uppercase text-muted-foreground">
                AI Tutor
              </span>
            </span>
          </Link>

          {/* Center nav */}
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className={`relative shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-full bg-primary/15 shadow-soft"
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

          {/* Right — Auth area */}
          <div className="flex shrink-0 items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated && user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {userInitial}
                  </span>
                  <span className="hidden text-sm font-medium text-foreground sm:inline">
                    {user.name ?? user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-card"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.name ?? 'User'}
                      </p>
                      <p className="truncate text-caption text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Profile
                      </Link>
                      <Link
                        href="/pricing"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Subscription
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          signOut()
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="mr-1.5 h-4 w-4" />
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button size="sm">
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
