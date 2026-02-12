'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

import {
  ArrowRight,
  Flame,
  BarChart3,
  Clock,
  AlertTriangle,
} from 'lucide-react'

import Image from 'next/image'

interface FoodDetailModalProps {
  recipe: any | null
  onClose: () => void
}

function getHealthScore(score: number) {
  if (score >= 75) return 'Very Healthy'
  if (score >= 50) return 'Balanced'
  return 'Indulgent'
}

export function FoodDetailModal({ recipe, onClose }: FoodDetailModalProps) {
  if (!recipe) return null

  const healthScore = recipe.healthScore || 65 // ⭐ fallback

  return (
    <Dialog open={!!recipe} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {recipe.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* Image */}
          <div className="h-56 w-full relative rounded-xl overflow-hidden border border-border/30">
            <Image
              src={recipe.image || '/placeholder.svg'}
              alt={recipe.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Nutrition */}
          <div className="grid grid-cols-4 gap-3">

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <BarChart3 className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">
                Health Score
              </p>
              <p className="text-2xl font-bold">{healthScore}</p>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 border">
              <Flame className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-muted-foreground">
                Calories
              </p>
              <p className="text-2xl font-bold">
                {recipe.calories}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border">
              <p className="text-xs text-muted-foreground">
                Protein
              </p>
              <p className="text-2xl font-bold">
                {recipe.protein}g
              </p>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border">
              <Clock className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-muted-foreground">
                Prep Time
              </p>
              <p className="text-2xl font-bold">
                {recipe.prepTime} mins
              </p>
            </div>
          </div>

          {/* Allergen Warning */}
          {recipe.allergens?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4" />
              Contains: {recipe.allergens.join(', ')}
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="font-bold">Ingredients</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              {recipe.ingredients?.map((ingredient: string) => (
                <li key={ingredient}>• {ingredient}</li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-bold">Instructions</h3>
            <ol className="text-sm text-muted-foreground mt-2 space-y-2">
              {recipe.instructions?.map(
                (step: string, idx: number) => (
                  <li key={idx}>
                    <strong>Step {idx + 1}:</strong> {step}
                  </li>
                )
              )}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">

            <Button size="lg" className="w-full">
              Log This Meal
            </Button>

            <Button variant="outline" size="lg" className="w-full">
              Order on Swiggy
            </Button>

            <Button variant="outline" size="lg" className="w-full">
              Order on Zomato
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              size="lg"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
