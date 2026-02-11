'use client'

import type { ReactNode } from 'react'

interface NutritionProgressBarProps {
  current: number
  goal: number
  label: string
  icon: ReactNode
  color: string
}

export function NutritionProgressBar({
  current,
  goal,
  label,
  icon,
  color,
}: NutritionProgressBarProps) {
  const percentage = Math.min(100, (current / goal) * 100)
  const remaining = Math.max(0, goal - current)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={color}>{icon}</div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-foreground">
          {Math.round(current)}/{Math.round(goal)}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {Math.round(remaining)} remaining
        </p>
      )}
    </div>
  )
}
