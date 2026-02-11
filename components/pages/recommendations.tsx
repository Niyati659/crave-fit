'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Zap, Leaf } from 'lucide-react'
import { getRecommendedFoods, getCravingDescription } from '@/lib/mock-foods'
import type { Food } from '@/lib/mock-foods'
import { FoodCard } from '@/components/food-card'
import { FoodDetailModal } from '@/components/food-detail-modal'

interface RecommendationsScreenProps {
  quizAnswers: Record<string, string>
  healthPreference: number
  onHealthPreferenceChange: (value: number) => void
  onBack: () => void
  onMealTrackerClick?: () => void
}

export function RecommendationsScreen({
  quizAnswers,
  healthPreference,
  onHealthPreferenceChange,
  onBack,
  onMealTrackerClick,
}: RecommendationsScreenProps) {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const recommendedFoods = getRecommendedFoods(quizAnswers, healthPreference)
  const cravingDescription = Object.keys(quizAnswers).length > 0 ? getCravingDescription(quizAnswers) : null

  // Calculate match scores for each food based on preference
  const getFoodMatchScore = (food: Food): number => {
    const pref = healthPreference || 50
    let matchScore = 0

    // Perfect match if food aligns with preference
    if (pref > 60 && food.healthScore >= 70) {
      matchScore = 95 + Math.random() * 5
    } else if (pref < 40 && food.healthScore <= 50) {
      matchScore = 90 + Math.random() * 10
    } else if (Math.abs(pref - 50) < 20 && food.healthScore >= 45 && food.healthScore <= 55) {
      matchScore = 85 + Math.random() * 15
    } else {
      // Partial match
      const healthDiff = Math.abs(food.healthScore - (pref * 1))
      matchScore = Math.max(60, 100 - healthDiff * 0.3)
    }

    return matchScore
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/3 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/50 backdrop-blur-sm border-b border-border/30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-2xl sm:text-3xl font-bold text-foreground">
            Your Perfect Match
          </h1>
          {onMealTrackerClick && (
            <Button
              onClick={onMealTrackerClick}
              size="sm"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold hidden sm:flex"
            >
              Meal Tracker
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Craving Description */}
          {cravingDescription && (
            <div className="bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/5 rounded-2xl p-8 sm:p-10 border border-primary/20 animate-fade-in backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Your Craving</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground text-center">
                {cravingDescription}
              </p>
            </div>
          )}

          {/* Health Preference Slider */}
          <div className="bg-white rounded-2xl p-8 border border-border/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Adjust Your Preference</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Slide to balance between indulgent comfort and nutritious health
            </p>

            <div className="space-y-6 pt-4">
              <Slider
                value={[healthPreference]}
                onValueChange={(val) => onHealthPreferenceChange(val[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />

              {/* Visual Preference Indicator */}
              <div className="flex justify-between gap-3">
                <div className="flex-1 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Indulgent</p>
                  <div className={`h-1 rounded-full transition-all ${healthPreference < 33 ? 'bg-primary' : 'bg-border/30'}`}></div>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Balanced</p>
                  <div className={`h-1 rounded-full transition-all ${healthPreference >= 33 && healthPreference < 67 ? 'bg-primary' : 'bg-border/30'}`}></div>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Healthy</p>
                  <div className={`h-1 rounded-full transition-all ${healthPreference >= 67 ? 'bg-primary' : 'bg-border/30'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recommended Foods</h2>
              <p className="text-sm text-muted-foreground mt-1">Click any food to see healthier recipes</p>
            </div>
            <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full">
              {recommendedFoods.length} Options
            </span>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedFoods.map((food, index) => (
              <div
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="cursor-pointer animate-slide-up hover:scale-105 transition-transform"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <FoodCard
                  food={food}
                  healthPreference={healthPreference}
                  matchScore={getFoodMatchScore(food)}
                />
              </div>
            ))}
          </div>

          {/* Info Footer */}
          <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Click on any food card to explore its nutrition details and discover healthier recipe alternatives!
            </p>
          </div>
        </div>
      </div>

      {/* Food Detail Modal */}
      <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />
    </div>
  )
}
