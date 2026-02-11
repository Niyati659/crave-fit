'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Food } from '@/lib/mock-foods'
import { ArrowRight, Flame, BarChart3 } from 'lucide-react'
import Image from 'next/image'

interface FoodDetailModalProps {
  food: Food | null
  onClose: () => void
}

function getHealthScoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

export function FoodDetailModal({ food, onClose }: FoodDetailModalProps) {
  if (!food) return null

  const healthColor = getHealthScoreColor(food.healthScore)

  return (
    <Dialog open={!!food} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{food.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="h-56 w-full relative rounded-xl overflow-hidden border border-border/30">
            <Image
              src={food.image || "/placeholder.svg"}
              alt={food.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Health Score & Nutrition Tabs */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <BarChart3 className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Health Score</p>
              <p className="text-2xl font-bold text-foreground">{food.healthScore}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-5 border border-orange-200">
              <Flame className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Calories</p>
              <p className="text-2xl font-bold text-foreground">{food.calories}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-5 border border-blue-200">
              <p className="text-xs text-muted-foreground font-medium">Protein</p>
              <p className="text-2xl font-bold text-foreground">{food.protein}g</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-5 border border-red-200">
              <p className="text-xs text-muted-foreground font-medium">Sugar</p>
              <p className="text-2xl font-bold text-foreground">{food.sugar}g</p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-secondary/30">
            <span className="text-sm font-semibold text-foreground">{food.category}</span>
            <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {food.healthScore >= 75 ? 'Very Healthy' : food.healthScore >= 50 ? 'Balanced' : 'Indulgent'}
            </span>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground leading-relaxed">{food.description}</p>
          </div>

          {/* Healthier Alternative */}
          {food.healthierAlternative && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">💡 Quick Swap</p>
              <p className="text-sm text-green-800">{food.healthierAlternative}</p>
            </div>
          )}

          {/* Healthier Recipe Section */}
          {food.healthierRecipe && (
            <div className="border-t border-border pt-6 space-y-4">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-primary"></span>
                  Healthier Recipe
                </h3>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <h4 className="font-bold text-lg text-green-900 mb-4">{food.healthierRecipe.name}</h4>

                  {/* Recipe Nutrition */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="text-center">
                      <p className="text-xs text-green-700 font-semibold">Calories</p>
                      <p className="text-xl font-bold text-green-900">{food.healthierRecipe.calories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-green-700 font-semibold">Protein</p>
                      <p className="text-xl font-bold text-green-900">{food.healthierRecipe.protein}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-green-700 font-semibold">Sugar</p>
                      <p className="text-xl font-bold text-green-900">{food.healthierRecipe.sugar}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-green-700 font-semibold">Score</p>
                      <p
                        className="text-xl font-bold"
                        style={{
                          color:
                            food.healthierRecipe.healthScore >= 75
                              ? '#16a34a'
                              : food.healthierRecipe.healthScore >= 50
                                ? '#eab308'
                                : '#ef4444',
                        }}
                      >
                        {food.healthierRecipe.healthScore}
                      </p>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-green-900">Ingredients:</h4>
                    <ul className="space-y-2">
                      {food.healthierRecipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-green-800">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-200 text-green-700 text-xs font-bold flex-shrink-0 mt-0.5">
                            ✓
                          </span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3 border-t border-green-200 pt-4">
                    <h4 className="font-semibold text-green-900">How to Make:</h4>
                    <ol className="space-y-3">
                      {food.healthierRecipe.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-green-800">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Savings Display */}
                  <div className="mt-5 p-3 bg-white/60 rounded-lg border border-green-300 text-center">
                    <p className="text-sm text-green-900 font-semibold">
                      Save{' '}
                      <span className="text-lg text-green-600 font-bold">
                        {food.calories - food.healthierRecipe.calories}
                      </span>
                      {' '}calories vs original
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full flex items-center justify-center gap-2 font-semibold"
            >
              Get This Food
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={onClose} size="lg" className="w-full bg-transparent">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
