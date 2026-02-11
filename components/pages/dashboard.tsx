'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, TrendingUp, Flame, Droplet, LogOut, Calendar, Target } from 'lucide-react'
import { authStorage } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface WeeklyProgress {
  day: string
  calories: number
  protein: number
  carbs: number
  fat: number
  goal: number
}

interface DashboardProps {
  onNavigate: (view: 'landing' | 'meal-tracker' | 'quiz' | 'recommendations' | 'dashboard') => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([])

  useEffect(() => {
    const currentUser = authStorage.getUser()
    setUser(currentUser)

    // Load weekly progress from localStorage
    const stored = localStorage.getItem('craveFit_weeklyProgress')
    if (stored) {
      setWeeklyData(JSON.parse(stored))
    } else {
      // Initialize with demo data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const demoData = days.map((day, index) => ({
        day,
        calories: Math.floor(Math.random() * 500) + 1500,
        protein: Math.floor(Math.random() * 30) + 80,
        carbs: Math.floor(Math.random() * 40) + 150,
        fat: Math.floor(Math.random() * 20) + 60,
        goal: 2000,
      }))
      setWeeklyData(demoData)
      localStorage.setItem('craveFit_weeklyProgress', JSON.stringify(demoData))
    }
  }, [])

  const handleLogout = () => {
    authStorage.logout()
    router.push('/auth/login')
  }

  const avgCalories = weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length) : 0
  const totalProtein = weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, d) => sum + d.protein, 0) / weeklyData.length) : 0
  const weeklyGoalAttainment = weeklyData.length > 0 ? Math.round((weeklyData.filter(d => d.calories <= d.goal).length / weeklyData.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/3">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/50 backdrop-blur-sm border-b border-border/30 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || 'User'}</h1>
            <p className="text-sm text-muted-foreground mt-1">Your weekly progress dashboard</p>
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
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-5 border border-orange-200/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Daily Calories</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{avgCalories}</p>
                  <p className="text-xs text-muted-foreground mt-2">2000 cal goal</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-5 border border-blue-200/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Protein</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{totalProtein}g</p>
                  <p className="text-xs text-muted-foreground mt-2">Daily intake</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Droplet className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-5 border border-green-200/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goal Attainment</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{weeklyGoalAttainment}%</p>
                  <p className="text-xs text-muted-foreground mt-2">This week</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-5 border border-purple-200/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Days</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{weeklyData.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">Tracked this week</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card className="p-8 bg-white border border-border/30 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Weekly Calorie Intake
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Daily progress towards your 2000 calorie goal</p>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {weeklyData.map((day, index) => {
                const percentage = (day.calories / day.goal) * 100
                const isGoalMet = day.calories <= day.goal

                return (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <div className="text-sm font-bold text-foreground">{day.day}</div>
                    <div className="relative w-12 h-32 bg-muted rounded-lg overflow-hidden border border-border/50">
                      <div
                        className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                          isGoalMet ? 'bg-gradient-to-t from-primary to-primary/70' : 'bg-gradient-to-t from-orange-400 to-orange-300'
                        }`}
                        style={{ height: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-foreground">{day.calories}</div>
                    <div className={`text-xs font-semibold ${isGoalMet ? 'text-primary' : 'text-orange-600'}`}>
                      {Math.round(percentage)}%
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Daily Average: {avgCalories} cal</p>
                <p className="text-xs text-muted-foreground">Based on {weeklyData.length} days tracked</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs text-muted-foreground">Goal Met</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <span className="text-xs text-muted-foreground">Over Goal</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Nutrition Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Protein', avg: totalProtein, unit: 'g', color: 'from-blue-50 to-blue-5', icon: 'text-blue-600' },
              { label: 'Carbs', avg: Math.round(weeklyData.reduce((sum, d) => sum + d.carbs, 0) / weeklyData.length), unit: 'g', color: 'from-yellow-50 to-yellow-5', icon: 'text-yellow-600' },
              { label: 'Fat', avg: Math.round(weeklyData.reduce((sum, d) => sum + d.fat, 0) / weeklyData.length), unit: 'g', color: 'from-rose-50 to-rose-5', icon: 'text-rose-600' },
            ].map((macro, idx) => (
              <Card key={idx} className={`p-6 bg-gradient-to-br ${macro.color} border-opacity-50 border`}>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{macro.label}</p>
                <p className="text-4xl font-bold text-foreground mt-4">{macro.avg}{macro.unit}</p>
                <p className="text-xs text-muted-foreground mt-3">Average daily intake</p>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('meal-tracker')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Track Meals</h3>
                  <p className="text-sm text-muted-foreground mt-2">Log today's meals and monitor progress</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('landing')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Browse Foods</h3>
                  <p className="text-sm text-muted-foreground mt-2">Discover and learn about different foods</p>
                </div>
                <ArrowRight className="w-6 h-6 text-secondary-foreground" />
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-5 border-blue-200/50 cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('quiz')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Take Quiz</h3>
                  <p className="text-sm text-muted-foreground mt-2">Get personalized food recommendations</p>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
