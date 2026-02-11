'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Flame, LogOut, UserCircle2, ChevronRight, Utensils, Lightbulb } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UtensilLoader } from '@/components/ui/utensil-loader'

interface WeeklyProgress {
  day: string
  calories: number
  protein: number
  carbs: number
  fat: number
  goal: number
}

interface DashboardProps {
  onNavigate: (view: 'landing' | 'meal-tracker' | 'quiz' | 'recommendations' | 'dashboard' | 'profile') => void
  userData?: {
    full_name?: string
    avatar_url?: string
    age?: number
    weight?: number
    height?: number
    goal?: string
    allergies?: string
  }
}

const healthFacts = [
  "💧 Drinking water before meals can help reduce calorie intake by up to 13%",
  "🥗 Eating protein at breakfast can reduce cravings by 60% throughout the day",
  "🏃 Just 10 minutes of exercise can boost your metabolism for hours",
  "😴 Getting 7-9 hours of sleep helps regulate hunger hormones",
  "🥜 Nuts are packed with healthy fats that keep you full longer",
  "🍎 Eating fiber-rich foods can help you feel 25% fuller",
  "🧘 Mindful eating can reduce overeating by up to 30%",
  "🥤 Sugary drinks can add 500+ calories to your daily intake without filling you up"
]

export function Dashboard({ onNavigate, userData }: DashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [randomFact, setRandomFact] = useState('')

  useEffect(() => {
    setRandomFact(healthFacts[Math.floor(Math.random() * healthFacts.length)])
  }, [])

  useEffect(() => {
    const checkUserAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/')
          return
        }

        setUser(session.user)

        // Fetch weekly progress data
        const { data: meals } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        if (meals && meals.length > 0) {
          const groupedByDay = meals.reduce((acc: any, meal: any) => {
            const day = new Date(meal.created_at).toLocaleDateString('en-US', { weekday: 'short' })
            if (!acc[day]) {
              acc[day] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
            }
            acc[day].calories += meal.calories || 0
            acc[day].protein += meal.protein || 0
            acc[day].carbs += meal.carbs || 0
            acc[day].fat += meal.fat || 0
            acc[day].count += 1
            return acc
          }, {})

          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          const formattedData = weekDays.map(day => ({
            day,
            calories: groupedByDay[day]?.calories || 0,
            protein: groupedByDay[day]?.protein || 0,
            carbs: groupedByDay[day]?.carbs || 0,
            fat: groupedByDay[day]?.fat || 0,
            goal: 2000
          }))

          setWeeklyData(formattedData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAndProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const avgCalories = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.filter(d => d.calories > 0).length)
    : 0

  const totalProtein = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.protein, 0) / weeklyData.filter(d => d.protein > 0).length)
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <UtensilLoader />
      </div>
    )
  }

  const hasData = weeklyData.some(d => d.calories > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-border/50 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-border shadow-sm">
              {userData?.avatar_url ? (
                <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {userData?.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Your health dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {!hasData ? (
            /* Empty State with Health Fact */
            <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-full">
                    <Utensils className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Start Tracking Your Meals</h3>
                    <p className="text-muted-foreground mb-6">Log your meals to get accurate visualizations, personalized insights, and track your progress towards your health goals.</p>
                    <Button
                      onClick={() => onNavigate('meal-tracker')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-12 rounded-xl shadow-lg"
                    >
                      Track Your First Meal
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Lightbulb className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Did You Know?</h4>
                    <p className="text-lg text-foreground">{randomFact}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* Dashboard with Data */
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Progress */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Total Progress</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-emerald-600">
                          {userData?.weight ? `${(75 - userData.weight).toFixed(1)}` : '0.0'}
                        </p>
                        <span className="text-sm text-muted-foreground">lbs lost</span>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <TrendingDown className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </Card>

                {/* Goal Progress */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Goal Progress</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
                            style={{ width: `${Math.min((avgCalories / 2000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-foreground">
                        <span className="font-bold text-orange-600">{Math.round((avgCalories / 2000) * 100)}%</span> towards daily goal
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Current Streak */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Current Streak</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-blue-600">{weeklyData.filter(d => d.calories > 0).length}</p>
                        <span className="text-sm text-muted-foreground">days tracked</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Flame className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight Trend Chart */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-6">Weight Trend</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {weeklyData.map((day, idx) => {
                      const weight = userData?.weight ? userData.weight + (idx * 0.1) : 70 - (idx * 0.3)
                      const maxWeight = 75
                      const minWeight = 68
                      const heightPercent = ((weight - minWeight) / (maxWeight - minWeight)) * 100

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full h-48">
                            <div
                              className="absolute bottom-0 w-2 bg-slate-300 rounded-full mx-auto left-1/2 -translate-x-1/2"
                              style={{ height: `${Math.max(heightPercent, 10)}%` }}
                            >
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-600 rounded-full" />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{day.day}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Calories Weekly Chart */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-6">Calories Weekly</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {weeklyData.map((day, idx) => {
                      const percentage = day.calories > 0 ? (day.calories / 2400) * 100 : 0

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full h-48">
                            <div
                              className="absolute bottom-0 w-full bg-slate-800 rounded-t-sm transition-all"
                              style={{ height: `${Math.max(Math.min(percentage, 100), 5)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{day.day}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Nutrition Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Protein', avg: totalProtein, unit: 'g', color: 'from-blue-50 to-blue-100', textColor: 'text-blue-600', border: 'border-blue-200' },
                  { label: 'Carbs', avg: Math.round(weeklyData.reduce((sum, d) => sum + d.carbs, 0) / Math.max(weeklyData.filter(d => d.carbs > 0).length, 1)), unit: 'g', color: 'from-yellow-50 to-yellow-100', textColor: 'text-yellow-600', border: 'border-yellow-200' },
                  { label: 'Fat', avg: Math.round(weeklyData.reduce((sum, d) => sum + d.fat, 0) / Math.max(weeklyData.filter(d => d.fat > 0).length, 1)), unit: 'g', color: 'from-rose-50 to-rose-100', textColor: 'text-rose-600', border: 'border-rose-200' },
                ].map((macro, idx) => (
                  <Card key={idx} className={`p-6 bg-gradient-to-br ${macro.color} ${macro.border} shadow-sm`}>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{macro.label}</p>
                    <p className={`text-4xl font-bold ${macro.textColor} mt-4`}>{macro.avg}{macro.unit}</p>
                    <p className="text-xs text-muted-foreground mt-3">Average daily intake</p>
                  </Card>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
