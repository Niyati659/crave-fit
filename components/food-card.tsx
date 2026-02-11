'use client'

import type { Food } from '@/lib/mock-foods'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface FoodCardProps {
  food: Food
  matchScore?: number
  onClick?: () => void
}

function getHealthScoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

export function FoodCard({ food, matchScore, onClick }: FoodCardProps) {
  const healthColor = getHealthScoreColor(food.healthScore)

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50 hover:border-primary/30 relative"
    >
      {/* Image */}
      <div className="h-56 w-full relative overflow-hidden bg-muted">
        <Image
          src={food.image || "/placeholder.svg"}
          alt={food.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 bg-white">

        {/* Name and Health Score */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg text-foreground flex-1 line-clamp-2">
            {food.name}
          </h3>
          <div
            className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-base shadow-md"
            style={{
              backgroundColor: `${healthColor}15`,
              color: healthColor,
              border: `2px solid ${healthColor}`
            }}
          >
            {food.healthScore}
          </div>
        </div>

        {/* Nutrition Info Grid */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-border/30">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Calories
            </p>
            <p className="text-lg font-bold text-foreground mt-1">
              {food.calories}
            </p>
          </div>

          <div className="text-center border-x border-border/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Protein
            </p>
            <p className="text-lg font-bold text-foreground mt-1">
              {food.protein}g
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sugar
            </p>
            <p className="text-lg font-bold text-foreground mt-1">
              {food.sugar ?? '-'}g
            </p>
          </div>
        </div>

        {/* Category + Diet + Optional Match */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {food.category && (
              <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {food.category}
              </span>
            )}

            {food.dietType && (
              <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                {food.dietType}
              </span>
            )}
          </div>

          {/* {matchScore !== undefined && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full">
              {Math.round(matchScore)}%
            </span> */}
          {/* )} */}
        </div>
      </div>
    </Card>
  )
}
