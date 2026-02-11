'use client';

import { Button } from '@/components/ui/button'
import { Utensils, Sparkles, Leaf, TrendingUp, Heart } from 'lucide-react'

interface LandingPageProps {
  onStartQuiz: () => void
  onNavigate: (view: 'recommendations') => void
  onMealTrackerClick?: () => void
}

export function LandingPage({ onStartQuiz, onNavigate, onMealTrackerClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border/30 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Utensils className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">CraveFit</h1>
              <p className="text-xs text-primary font-semibold">Smart Eating Habits</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="w-full max-w-3xl space-y-10 text-center">
          {/* Tagline */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full">
                ✨ Craving-Based Nutrition
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground text-balance leading-tight">
              Eat what you crave.<br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                Know what you eat.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Discover delicious foods that match your cravings, explore their nutrition, and find healthier alternatives—all personalized just for you.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-10 animate-slide-up">
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-5 border border-blue-200/50 hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-200/30">
              <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-bold text-sm text-foreground">Smart Discovery</p>
              <p className="text-xs text-muted-foreground mt-2">AI-matched foods based on your cravings</p>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-5 border border-green-200/50 hover:border-green-300 transition-all hover:shadow-xl hover:shadow-green-200/30">
              <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-bold text-sm text-foreground">Health Focused</p>
              <p className="text-xs text-muted-foreground mt-2">Detailed nutrition & health scores</p>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-5 border border-orange-200/50 hover:border-orange-300 transition-all hover:shadow-xl hover:shadow-orange-200/30">
              <div className="w-12 h-12 rounded-xl bg-orange-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Leaf className="w-6 h-6 text-orange-600" />
              </div>
              <p className="font-bold text-sm text-foreground">Healthier Recipes</p>
              <p className="text-xs text-muted-foreground mt-2">Find smarter swaps with recipes</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              onClick={onStartQuiz}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-10 py-7 rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
            >
              Start the Quiz
            </Button>
            <Button
              onClick={() => onNavigate('recommendations')}
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary/10 text-base sm:text-lg px-10 py-7 rounded-xl font-bold transition-all hover:shadow-lg"
            >
              Browse Foods
            </Button>
            {onMealTrackerClick && (
              <Button
                onClick={onMealTrackerClick}
                variant="outline"
                size="lg"
                className="border-2 border-secondary text-secondary-foreground hover:bg-secondary/10 text-base sm:text-lg px-10 py-7 rounded-xl font-bold transition-all hover:shadow-lg bg-transparent"
              >
                Track Meals
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-border/30 mt-10">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Trusted by health-conscious foodies</p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>100+ Foods</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>AI Matching</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" />
                <span>Healthier Recipes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
