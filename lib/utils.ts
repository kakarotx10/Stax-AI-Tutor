import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateXP(unitXP: number, mcqScore: number, codingProblemsSolved: number): number {
  const mcqBonus = Math.floor(unitXP * 0.3 * (mcqScore / 100))
  const codingBonus = codingProblemsSolved * 50
  return unitXP + mcqBonus + codingBonus
}

export function getDifficultyColor(difficulty: 'Basic' | 'Medium' | 'Advanced'): string {
  switch (difficulty) {
    case 'Basic':
      return 'text-success'
    case 'Medium':
      return 'text-warning'
    case 'Advanced':
      return 'text-destructive'
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}


















