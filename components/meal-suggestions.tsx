'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Zap, Flame } from 'lucide-react'
import type { MealEntry } from '@/lib/meal-tracking'

interface MealSuggestionsProps {
  suggestions: Record<string, MealEntry[]>
  onSelectMeal: (meal: MealEntry) => void
}

const categoryLabels: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  protein: {
    icon: <Zap className="w-5 h-5" />,
    label: 'High Protein Options',
    color: 'from-blue-50 to-blue-5 border-blue-200',
  },
  carbs: {
    icon: <Flame className="w-5 h-5" />,
    label: 'Carb Sources',
    color: 'from-orange-50 to-orange-5 border-orange-200',
  },
  fats: {
    icon: <Flame className="w-5 h-5" />,
    label: 'Healthy Fats',
    color: 'from-yellow-50 to-yellow-5 border-yellow-200',
  },
  fiber: {
    icon: <Zap className="w-5 h-5" />,
    label: 'Fiber-Rich Foods',
    color: 'from-green-50 to-green-5 border-green-200',
  },
  quick: {
    icon: <Flame className="w-5 h-5" />,
    label: 'Quick Options',
    color: 'from-purple-50 to-purple-5 border-purple-200',
  },
}

export function MealSuggestions({ suggestions, onSelectMeal }: MealSuggestionsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('protein')

  if (Object.keys(suggestions).length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <h2 className="text-2xl font-bold text-foreground">Smart Suggestions</h2>
      </div>

      {Object.entries(suggestions).map(([category, meals]) => {
        const categoryInfo = categoryLabels[category]
        const isExpanded = expandedCategory === category

        return (
          <div key={category}>
            <button
              onClick={() =>
                setExpandedCategory(isExpanded ? null : category)
              }
              className={`w-full bg-gradient-to-r ${categoryInfo.color} rounded-xl p-5 border border-current flex items-center justify-between hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className="text-current">{categoryInfo.icon}</div>
                <h3 className="font-bold text-foreground text-lg">
                  {categoryInfo.label}
                </h3>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-current" />
              ) : (
                <ChevronDown className="w-5 h-5 text-current" />
              )}
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {meals.map((meal) => (
                  <Card
                    key={meal.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50"
                    onClick={() => onSelectMeal(meal)}
                  >
                    <div className="mb-3">
                      <p className="font-bold text-foreground mb-1">{meal.name}</p>
                      <p className="text-xs text-muted-foreground">{meal.time}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-muted-foreground">Calories</p>
                        <p className="font-bold text-foreground">{meal.calories}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-muted-foreground">Protein</p>
                        <p className="font-bold text-foreground">{meal.protein}g</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-muted-foreground">Carbs</p>
                        <p className="font-bold text-foreground">{meal.carbs}g</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-muted-foreground">Fat</p>
                        <p className="font-bold text-foreground">{meal.fat}g</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectMeal(meal)
                      }}
                    >
                      Add to Today
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
