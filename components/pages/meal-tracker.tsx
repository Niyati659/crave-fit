'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, TrendingUp, Flame, Zap } from 'lucide-react'
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
}

export function MealTracker({ onBack }: MealTrackerProps) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [waterMl, setWaterMl] = useState(0)


  const addWater = async (ml: number) => {
  if (!user) return

  await updateWaterLogs(user.id, selectedDate, ml)

  setWaterMl((prev) => prev + ml)
}
useEffect(() => {
  if (!user) return

  const fetchWater = async () => {
    const { data } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", selectedDate)
      .single()

    if (data) {
      setWaterMl(data.ml)
    } else {
      setWaterMl(0)
    }
  }

  fetchWater()
}, [user, selectedDate])

  useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  getUser()
}, [])
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
  if (!user) return

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", selectedDate)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch error:", error)
      return
    }

    // 🔥 MAP DB → MealEntry shape
    const mappedMeals: MealEntry[] =
      data?.map((m) => ({
        id: m.id,
        name: m.name,
        calories: m.calories || 0,
        protein: m.protein || 0,
        carbs: m.carbs || 0,
        fat: m.fat || 0,
        fiber: m.fiber || 0,
        detectedFood: m.detected_food || undefined,
        imageUrl: m.image_url || undefined,
        time: m.time,
      })) || []

    setMeals(mappedMeals)
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

  const calorieGoal = profile
  ? calcCalories(profile)
  : DEFAULT_DAILY_GOALS.calories


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

  
  const dynamicGoals:DailyProgress["goals"] = {
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
  const handleAddMeal = async (meal: MealEntry) => {
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
  if (user){
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
          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-xl p-5 border border-border/30 shadow-sm">
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

          {/* Calorie Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl p-8 border border-primary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Main Calorie Counter */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeDasharray={`${(dailyProgress.totalCalories / dailyProgress.goals.calories) * 376.99} 376.99`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-foreground">
                      {Math.round(dailyProgress.totalCalories)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {dailyProgress.goals.calories}
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm font-semibold text-foreground">
                  {dailyProgress.goals.calories - dailyProgress.totalCalories > 0
                    ? `${Math.round(dailyProgress.goals.calories - dailyProgress.totalCalories)} left`
                    : 'Goal reached!'}
                </p>
              </div>
              

              {/* Macros Summary */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Protein
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(dailyProgress.totalProtein)}/{Math.round(dailyProgress.goals.protein)}g
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, getProgressPercentage(dailyProgress.totalProtein, dailyProgress.goals.protein))}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      Carbs
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(dailyProgress.totalCarbs)}/{Math.round(dailyProgress.goals.carbs)}g
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, getProgressPercentage(dailyProgress.totalCarbs, dailyProgress.goals.carbs))}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                      Fats
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(dailyProgress.totalFat)}/{Math.round(dailyProgress.goals.fat)}g
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, getProgressPercentage(dailyProgress.totalFat, dailyProgress.goals.fat))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 💧 Water Intake */}
          <Card className="p-6 border border-border/30">
            <h2 className="text-xl font-bold mb-4">Water Intake</h2>

            <div className="flex gap-3 mb-4">
              <Button onClick={() => addWater(250)}>+1 Glass</Button>
              <Button onClick={() => addWater(500)}>+500 ml</Button>
              <Button onClick={() => addWater(1000)}>+1L</Button>
            </div>

            {/* Progress */}
            <div>
              <p className="text-sm font-semibold mb-2">
                {waterMl} / {waterGoal} ml
              </p>

              <div className="w-full bg-muted h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (waterMl / waterGoal) * 100)}%`,
                  }}
                />
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

