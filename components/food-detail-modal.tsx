'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Food } from '@/lib/mock-foods'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { SwapCard } from './swapcard'
import Image from 'next/image'


interface FoodDetailModalProps {
  food: Food | null
  onClose: () => void
  matchScore?: number
  whyMatched?: string
}

function getHealthLabel(score: number) {
  if (score >= 75) return 'Very Healthy'
  if (score >= 50) return 'Balanced'
  return 'Indulgent'
}

export function FoodDetailModal({
  food,
  onClose,
  matchScore,
  whyMatched,
}: FoodDetailModalProps) {
  if (!food) return null

  const zomatoSearchUrl = `https://www.zomato.com/search?q=${encodeURIComponent(food.name)}`

  return (
    <Dialog open={!!food} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">

        {/* Header */}
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            {food.name}
            {matchScore !== undefined && (
              <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {Math.round(matchScore)}% Match
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Food Image (Optional) */}
{food.image && (
  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border/40">
    <Image
      src={food.image}
      alt={food.name}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 800px"
    />
  </div>
)}


        {/* Cuisine / Diet Tags */}
        <div className="flex flex-wrap gap-2">
          {food.category && (
            <span className="px-3 py-1 text-xs font-medium bg-muted rounded-full">
              {food.category}
            </span>
          )}
          {food.dietType && (
            <span className="px-3 py-1 text-xs font-medium bg-muted rounded-full">
              {food.dietType}
            </span>
          )}
          <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {getHealthLabel(food.healthScore)}
          </span>
        </div>

        {/* Nutrition Grid */}
        <div className="grid grid-cols-4 gap-4 text-center border-y border-border/30 py-5">
          <Stat label="Calories" value={food.calories} />
          <Stat label="Protein" value={`${food.protein}g`} />
          <Stat label="Carbs" value={`${food.carbs ?? '-'}g`} />
          <Stat label="Fat" value={`${food.fat ?? '-'}g`} />
        </div>

        {/* Primary CTA */}
        <Button
          asChild
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
        >
          <a href={zomatoSearchUrl} target="_blank" rel="noopener noreferrer">
            Order on Zomato
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        {/* Why Matched (Optional) */}
        {whyMatched && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-foreground">{whyMatched}</p>
          </div>
        )}

        {/* Description */}
        {food.description && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <p className="text-sm text-foreground leading-relaxed">
              {food.description}
            </p>
          </div>
        )}

        {/* Swap Section */}
        {food.healthierRecipe && (
          <SwapCard originalFood={food} />
        )}

        {/* Close Button */}
        <Button variant="outline" onClick={onClose} size="lg" className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  )
}
