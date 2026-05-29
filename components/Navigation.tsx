'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Briefcase,
  CreditCard,
  Flame,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  Sword,
  Trophy,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'

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

function NavPill({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-navigation-pill"
          className="absolute inset-0 rounded-full bg-primary/10 shadow-soft"
          initial={false}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="hidden lg:inline">{label}</span>
      </span>
    </Link>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const navItems = isLoading ? [] : isAuthenticated ? privateItems : publicItems
  const userInitial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/80 bg-background/80 shadow-soft backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex shrink-0 items-center rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Stax AI Tutor home"
          >
            <BrandLogo
              wordmarkClassName="h-8 w-32 transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border/80 bg-card/80 p-1 shadow-soft backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {isLoading ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <span className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                  <span className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                </div>
              ) : navItems.map((item) => (
                <NavPill
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation menu" className="rounded-full">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ThemeToggle />

            {isLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-border bg-card/90 py-1.5 pl-1.5 pr-3 shadow-soft transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Open user menu"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {userInitial}
                    </span>
                    <span className="hidden max-w-36 truncate text-sm font-semibold text-foreground sm:inline">
                      {user.name ?? user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="normal-case">
                    <span className="block truncate text-sm text-foreground">{user.name ?? 'User'}</span>
                    <span className="mt-1 block truncate text-caption text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <Settings className="h-4 w-4" />
                      Subscription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      signOut()
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/signup">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
