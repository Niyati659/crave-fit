'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, TrendingUp, Flame, Zap, Activity, AlertCircle, Footprints, Lightbulb } from 'lucide-react'
import {
  DailyProgress,
  MealEntry,
  DEFAULT_DAILY_GOALS,
  calculateProgress,
  getProgressPercentage,
  getSuggestedMeals,
} from '@/lib/meal-tracking'
import { MealEntryForm } from '@/components/meal-entry-form'
import { NutritionProgressBar } from '@/components/nutrition-progress-bar'
import { MealSuggestions } from '@/components/meal-suggestions'
import { calcCalories } from '@/lib/calc-calories'
import { supabase } from "@/lib/supabase"
import { updateDailyLogs } from "@/lib/update-daily-logs"
import { calcMacrosFromWeight } from "@/lib/calc-macros-weight"
import { updateWaterLogs } from "@/lib/update-water-logs"
import { calcWaterGoal } from "@/lib/calc-water-goal"
import { calculateExerciseTime } from "@/lib/calc-burn"


type MealRow = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  detected_food?: string
  image_url?: string
  time: string
  date: string
}

interface MealTrackerProps {
  onBack: () => void
  onNavigate?: (view: 'landing' | 'meal-tracker' | 'quiz' | 'recommendations' | 'dashboard' | 'profile' | 'browse' | 'chef') => void
}

export function MealTracker({ onBack, onNavigate }: MealTrackerProps) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [waterMl, setWaterMl] = useState(0)


  const addWater = async (ml: number) => {
    if (!user) {
      console.error("No user found")
      return
    }

    const { error } = await supabase
      .from("water_logs")
      .insert({
        user_id: user.id,
        date: selectedDate,
        ml,
      })

    if (error) {
      console.error("Water insert error:", error)
      return
    }

    // Update UI instantly
    setWaterMl((prev) => prev + ml)
  }

  useEffect(() => {
    if (!user) return

    const fetchWater = async () => {
      const { data, error } = await supabase
        .from("water_logs")
        .select("ml")
        .eq("user_id", user.id)
        .eq("date", selectedDate)

      if (error) return

      const total = data.reduce(
        (sum, row) => sum + row.ml,
        0
      )

      setWaterMl(total)
    }

    fetchWater()
  }, [user, selectedDate])

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Profile fetch error:", error)
        return
      }

      setProfile(data)
    }

    fetchProfile()
  }, [user])

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.error("No session found")
        return
      }

      setUser(session.user)
    }

    loadUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchMeals = async () => {
      console.log("Fetching meals for:", user.id, selectedDate)

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", selectedDate)

      if (error) {
        console.error("Fetch error:", error)
        return
      }

      console.log("Meals fetched:", data)

      setMeals(data || [])
    }

    fetchMeals()
  }, [selectedDate, user])

  // Save meals to localStorage
  useEffect(() => {
    if (meals.length > 0) {
      localStorage.setItem(`meals_${selectedDate}`, JSON.stringify(meals))
    }
  }, [meals, selectedDate])

  const progress = calculateProgress(meals)

  const { goal: calorieGoal, exerciseGap } = profile
    ? calcCalories(profile)
    : { goal: DEFAULT_DAILY_GOALS.calories, exerciseGap: 0 }


  const waterGoal = profile
    ? calcWaterGoal(profile.weight)
    : 2000



  const macroGoals = profile
    ? calcMacrosFromWeight({
      calories: calorieGoal,
      weight: profile.weight,
      goal: profile.goal,
    })
    : DEFAULT_DAILY_GOALS


  const dynamicGoals: DailyProgress["goals"] = {
    calories: calorieGoal,
    protein: macroGoals.protein,
    carbs: macroGoals.carbs,
    fat: macroGoals.fat,
    fiber: 25,
  }

  const dailyProgress: DailyProgress = {
    date: selectedDate,
    meals,
    goals: dynamicGoals,
    ...progress,
  }



  const suggestedMeals = getSuggestedMeals(dailyProgress)
  const handleAddMeal = async (meal: Partial<MealEntry>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("meals")
      .insert([
        {
          user_id: user?.id,
          name: meal.name,
          detected_food: meal.detectedFood || null,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber,
          image_url: meal.imageUrl || null,
          time: meal.time,
          date: selectedDate,
        },
      ])
      .select()

    if (error) {
      console.error("Insert error:", error)
      return
    }

    const insertedMeals = data as MealRow[] | null

    if (insertedMeals && insertedMeals.length > 0) {
      setMeals([...meals, insertedMeals[0]])
    }

    setShowAddMeal(false)
    if (user) {
      await updateDailyLogs(user.id, selectedDate)
    }

  }


  const handleDeleteMeal = async (id: string) => {
    const { error } = await supabase
      .from("meals")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Delete error:", error)
      return
    }

    setMeals(meals.filter((m) => m.id !== id))

    await updateDailyLogs(user.id, selectedDate)

  }

  const handlePreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleTodayButton = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
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
            Meal Tracker
          </h1>

        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Profile Prompt Banner */}
          {profile && (!profile.weight || !profile.height) && (
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set your weight and height to get personalized calorie, macro, and water goals tailored to you.</p>
                  {onNavigate && (
                    <Button
                      onClick={() => onNavigate('profile')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 h-10 rounded-xl shadow"
                    >
                      Update Profile →
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-xl p-4 border border-border/30 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              className="rounded-lg bg-transparent"
            >
              ← Previous
            </Button>
            <div className="text-center flex-1">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Date
              </p>
              <p className="text-lg font-bold text-foreground">{formatDate(selectedDate)}</p>
              {selectedDate !== new Date().toISOString().split('T')[0] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTodayButton}
                  className="text-xs text-primary hover:text-primary mt-2"
                >
                  Go to today
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              className="rounded-lg bg-transparent"
            >
              Next →
            </Button>
          </div>

          {/* 🥗 Simplified Nutrition Summary */}
          <Card className="p-6 bg-emerald-50/40 border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">

              {/* Calories Gauge */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36">
                  <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 192 192">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-emerald-100/50"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={`${Math.min(100, (dailyProgress.totalCalories / dailyProgress.goals.calories) * 100) * 5.53} 553`}
                      strokeLinecap="round"
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-semibold text-slate-800 tracking-tighter tabular-nums">
                      {Math.round(dailyProgress.totalCalories)}
                    </p>
                    <div className="h-[1px] w-8 bg-emerald-200 my-1" />
                    <p className="text-sm font-medium text-slate-400">
                      Goal {dailyProgress.goals.calories}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  {dailyProgress.goals.calories - dailyProgress.totalCalories > 0 ? (
                    <div className="px-4 py-1 bg-emerald-100/50 rounded-full border border-emerald-200/50">
                      <p className="text-sm font-semibold text-emerald-700">
                        {Math.round(dailyProgress.goals.calories - dailyProgress.totalCalories)} kcal left
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 py-1 bg-amber-50 rounded-full border border-amber-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <p className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Goal Reached!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Macros Detailed Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Macro Breakdown</h3>
                  <Lightbulb className="w-4 h-4 text-emerald-400 opacity-40" />
                </div>

                <div className="space-y-4">
                  {/* Protein */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-600">Protein</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700 tabular-nums">
                        {Math.round(dailyProgress.totalProtein)}<span className="text-xs text-slate-400 font-medium ml-0.5">/{Math.round(dailyProgress.goals.protein)}g</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, getProgressPercentage(dailyProgress.totalProtein, dailyProgress.goals.protein))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-600">Carbs</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700 tabular-nums">
                        {Math.round(dailyProgress.totalCarbs)}<span className="text-xs text-slate-400 font-medium ml-0.5">/{Math.round(dailyProgress.goals.carbs)}g</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-orange-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, getProgressPercentage(dailyProgress.totalCarbs, dailyProgress.goals.carbs))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Fats */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-600">Fats</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700 tabular-nums">
                        {Math.round(dailyProgress.totalFat)}<span className="text-xs text-slate-400 font-medium ml-0.5">/{Math.round(dailyProgress.goals.fat)}g</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-amber-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, getProgressPercentage(dailyProgress.totalFat, dailyProgress.goals.fat))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Calorie Safety Floor Warning */}
          {
            exerciseGap > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 shadow-sm border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-indigo-100 shadow-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-indigo-950">Safe Calorie Bridge</h3>
                    <p className="text-sm text-indigo-900/60 font-medium leading-relaxed mt-1">
                      Your scientific goal is lower than 1200 kcal. To stay healthy, we've set your limit to 1200 kcal.
                      Try walking for <span className="font-black text-indigo-600">{calculateExerciseTime(exerciseGap, profile?.weight ? parseFloat(profile.weight) : 70)} mins</span> to safely reach your weight target!
                    </p>
                  </div>
                </div>
              </div>
            )
          }


          {/* 🚨 Premium Calorie Goal Exceeded UI */}
          {
            dailyProgress.totalCalories > dailyProgress.goals.calories && (
              <Card className="p-0 overflow-hidden border-none shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 p-[2px]">
                  <div className="bg-white/95 backdrop-blur-xl p-6 relative overflow-hidden">
                    {/* Background Decorative Patterns */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                      {/* Pulsing Warning Icon Container */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/10 rounded-2xl animate-pulse" />
                        <div className="relative p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg border border-red-400/50">
                          <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-red-950 mb-1 flex items-center justify-center md:justify-start gap-2">
                          Calorie Goal Exceeded
                        </h3>
                        <p className="text-red-900/60 font-medium">
                          You've gone past your daily limit by <span className="text-red-600 font-bold">{Math.round(dailyProgress.totalCalories - dailyProgress.goals.calories)} kcal</span>.
                        </p>
                      </div>

                      {/* Glassmorphic Suggestion Box */}
                      <div className="w-full md:w-auto min-w-[300px] bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-[2rem] p-5 flex items-center gap-4 transition-all hover:bg-red-50 hover:scale-[1.02] cursor-default">
                        <div className="p-3 bg-white rounded-full shadow-sm text-red-600">
                          <Footprints className="w-6 h-6 animate-bounce" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-widest font-black text-red-400 mb-1">Quick Fix Suggestion</p>
                          <p className="text-sm font-bold text-red-950 leading-snug">
                            Try walking for <span className="text-2xl font-black text-red-600 tabular-nums">
                              {calculateExerciseTime(
                                dailyProgress.totalCalories - dailyProgress.goals.calories,
                                profile?.weight ? parseFloat(profile.weight) : 70
                              )}
                            </span> <span className="text-xs">mins</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          }

          {/* 💧 Water Intake Tracker - Bottle View */}
          <Card className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Bottle Container */}
              <div className="relative group">
                <div className="flex flex-col items-center">
                  {/* Bottle Cap */}
                  <div className="w-10 h-3 bg-cyan-700 rounded-t-md z-10 shadow-sm" />
                  {/* Bottle Neck */}
                  <div className="w-8 h-8 bg-white/80 border-x-4 border-cyan-200/50 z-0 relative">
                    <div
                      className="absolute bottom-0 left-0 w-full bg-cyan-400/30 transition-all duration-700"
                      style={{ height: `${Math.min(100, Math.max(0, (waterMl / waterGoal) * 100 - 80) * 5)}%` }}
                    />
                  </div>
                  {/* Bottle Body */}
                  <div className="relative w-28 h-64 border-4 border-cyan-200/50 rounded-[2rem] overflow-hidden bg-white/40 backdrop-blur-sm shadow-inner overflow-hidden">
                    {/* Measurement Marks */}
                    <div className="absolute inset-0 flex flex-col justify-between py-8 px-2 pointer-events-none opacity-20">
                      {[75, 50, 25].map(mark => (
                        <div key={mark} className="flex items-center gap-2">
                          <div className="h-[1px] w-4 bg-cyan-900" />
                          <span className="text-[10px] font-bold text-cyan-900">{mark}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Water Fill */}
                    <div
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all duration-1000 ease-in-out"
                      style={{
                        height: `${Math.min(100, (waterMl / waterGoal) * 100)}%`,
                      }}
                    >
                      {/* Bubbles animation effect */}
                      <div className="absolute top-0 left-0 w-full h-4 bg-white/20 animate-pulse skew-y-3 transform-gpu" />
                    </div>
                  </div>
                </div>

                {/* Floating Percentage Label */}
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-cyan-100 animate-bounce cursor-default">
                  <p className="text-sm font-black text-cyan-600">
                    {Math.round((waterMl / waterGoal) * 100)}%
                  </p>
                </div>
              </div>

              {/* Info and Actions */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-black text-cyan-900 flex items-center justify-center md:justify-start gap-2 mb-2">
                    Water Tracker
                  </h2>
                  <p className="text-cyan-700/70 font-medium">
                    Keep your body hydrated to maintain optimal energy levels and metabolism.
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-cyan-100/50 flex items-center justify-center md:justify-start gap-6">
                  <div className="text-center md:text-left border-r border-cyan-100 pr-6">
                    <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-1">Drank</p>
                    <p className="text-2xl font-black text-cyan-900">{waterMl}<span className="text-sm font-medium ml-1">ml</span></p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-1">Daily Goal</p>
                    <p className="text-2xl font-black text-cyan-900">{waterGoal}<span className="text-sm font-medium ml-1">ml</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[250, 500, 750].map((ml) => (
                    <Button
                      key={ml}
                      onClick={() => addWater(ml)}
                      className="h-14 bg-white hover:bg-cyan-500 text-cyan-600 hover:text-white border-2 border-cyan-100 hover:border-cyan-500 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                      +{ml}ml
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Meals Logged Today */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-foreground">Meals Logged</h2>
              <Button
                onClick={() => setShowAddMeal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Meal
              </Button>
            </div>

            {showAddMeal && (
              <Card className="mb-6 p-6 border-2 border-primary/20">
                <MealEntryForm
                  onSave={handleAddMeal}
                  onCancel={() => setShowAddMeal(false)}
                />
              </Card>
            )}

            {meals.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground mb-4">No meals logged yet</p>
                <Button
                  onClick={() => setShowAddMeal(true)}
                  variant="outline"
                  className="rounded-lg"
                >
                  Add your first meal
                </Button>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2">
                {meals.map((meal) => (
                  <Card key={meal.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <p className="font-bold text-lg text-foreground">
                            {meal.detectedFood
                              ? `${meal.detectedFood} (${meal.name})`
                              : meal.name}
                          </p>
                          <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {meal.time}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Calories</p>
                            <p className="font-bold text-foreground">{meal.calories}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Protein</p>
                            <p className="font-bold text-foreground">{meal.protein}g</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Carbs</p>
                            <p className="font-bold text-foreground">{meal.carbs}g</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Fat</p>
                            <p className="font-bold text-foreground">{meal.fat}g</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          <MealSuggestions suggestions={suggestedMeals} onSelectMeal={handleAddMeal} />
        </div>
      </div>
    </div>
  )
}

