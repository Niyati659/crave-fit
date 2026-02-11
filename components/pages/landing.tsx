'use client';

import { Button } from '@/components/ui/button'
import { Utensils, Sparkles, Leaf, TrendingUp, Heart, LayoutDashboard, Search, UtensilsCrossed, Zap } from 'lucide-react'

interface LandingPageProps {
  onStartQuiz: () => void
  onNavigate: (view: any) => void
  onMealTrackerClick?: () => void
}

export function LandingPage({ onStartQuiz, onNavigate, onMealTrackerClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col pt-10">
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

          {/* Navigation hint */}
          <div className="pt-4 pb-8 scale-95 opacity-50">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic animate-pulse">
              Use the header above to explore the features
            </p>
          </div>

          {/* Detailed Feature Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left py-12">
            {/* Dashboard Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-200 flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">📊 Dashboard</h3>
                  <p className="text-xs font-bold text-orange-600/70 uppercase tracking-wider">Command Center</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Your personalized command center for health progress.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                  <span><strong>Weekly Overview:</strong> Tracks average calorie intake, protein, and macro balance.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                  <span><strong>Goal Tracking:</strong> Visual bar chart comparisons to your 2,000-calorie daily target.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                  <span><strong>Success Metrics:</strong> Calculate "Goal Attainment" percentage for total consistency.</span>
                </li>
              </ul>
            </div>

            {/* Quiz Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">🎢 Quiz</h3>
                  <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider">Smart Discovery</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                A quick, interactive way to find exactly what you're craving.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span><strong>Context-Aware:</strong> We factor in your current mood, texture preference, and hunger.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span><strong>Personalized Logic:</strong> Smart filtering to find the perfect match for your state.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span><strong>Skip Option:</strong> Directly browse the database if you already have a plan.</span>
                </li>
              </ul>
            </div>

            {/* Foods Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">🥗 Foods</h3>
                  <p className="text-xs font-bold text-green-600/70 uppercase tracking-wider">Recommendations</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The results engine of CraveFit, where discovery happens.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                  <span><strong>Health Slider:</strong> Toggle between Indulgent and Healthy versions of cravings.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                  <span><strong>Nutritional Deep-Dive:</strong> Detailed breakdown of every calorie and macro.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                  <span><strong>Smart Swaps:</strong> Healthier recipe alternatives so you can eat without the guilt.</span>
                </li>
              </ul>
            </div>

            {/* Tracker Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">📝 Meal Tracker</h3>
                  <p className="text-xs font-bold text-secondary-foreground/70 uppercase tracking-wider">Nutrition Log</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                A daily log to keep your nutrition on track automatically.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                  <span><strong>Calorie Counter:</strong> Real-time display showing calories remaining for the day.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                  <span><strong>Smart Suggestions:</strong> Meal recommendations based on your current macro gap.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                  <span><strong>Macro Balance:</strong> Visual progress bars for Protein, Carbs, and Fats.</span>
                </li>
              </ul>
            </div>
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
