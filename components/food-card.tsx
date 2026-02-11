'use client'

import React from "react"

import type { Food } from '@/lib/mock-foods'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface FoodCardProps {
  food: Food
  healthPreference?: number
  matchScore?: number
}

function getHealthScoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

function getPreferenceIndicator(foodHealth: number, preference: number): { icon: React.ReactNode; label: string; color: string } {
  const pref = preference || 50
  
  // Check if food aligns with preference
  if (pref > 60 && foodHealth >= 70) {
    return { icon: <TrendingUp className="w-4 h-4" />, label: 'Great match!', color: 'text-green-600' }
  }
  if (pref < 40 && foodHealth <= 50) {
    return { icon: <TrendingDown className="w-4 h-4" />, label: 'Indulgent', color: 'text-orange-600' }
  }
  if (Math.abs(pref - 50) < 20 && foodHealth >= 45 && foodHealth <= 55) {
    return { icon: <TrendingUp className="w-4 h-4" />, label: 'Balanced', color: 'text-blue-600' }
  }
  
  return { icon: null, label: '', color: '' }
}

export function FoodCard({ food, healthPreference = 50, matchScore }: FoodCardProps) {
  const healthColor = getHealthScoreColor(food.healthScore)
  const preference = getPreferenceIndicator(food.healthScore, healthPreference)

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50 hover:border-primary/30 relative">
      {/* Image */}
      <div className="h-56 w-full relative overflow-hidden bg-muted">
        <Image
          src={food.image || "/placeholder.svg"}
          alt={food.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Preference Badge */}
        {preference.icon && (
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm ${preference.color} font-semibold text-xs shadow-lg`}>
            {preference.icon}
            {preference.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 bg-white">
        {/* Name and Health Score */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg text-foreground flex-1 line-clamp-2">{food.name}</h3>
          <div
            className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-base shadow-md"
            style={{ backgroundColor: `${healthColor}15`, color: healthColor, border: `2px solid ${healthColor}` }}
          >
            {food.healthScore}
          </div>
        </div>

        {/* Nutrition Info Grid */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-border/30">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Calories</p>
            <p className="text-lg font-bold text-foreground mt-1">{food.calories}</p>
          </div>
          <div className="text-center border-x border-border/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Protein</p>
            <p className="text-lg font-bold text-foreground mt-1">{food.protein}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sugar</p>
            <p className="text-lg font-bold text-foreground mt-1">{food.sugar}g</p>
          </div>
        </div>

        {/* Category Badge & Match Score */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {food.category}
          </span>
          {matchScore !== undefined && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full">
              {Math.round(matchScore)}%
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
