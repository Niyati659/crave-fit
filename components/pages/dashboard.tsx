'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Flame, LogOut, UserCircle2, ChevronRight, Utensils, Lightbulb, Droplet, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UtensilLoader } from '@/components/ui/utensil-loader'
import { generateInsights, Insight } from '@/lib/insights'
import { RotateCw } from 'lucide-react'

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
    target_weight?: number
  }
}

export function Dashboard({ onNavigate, userData }: DashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([])
  const [waterData, setWaterData] = useState<{ day: string; ml: number }[]>([])
  const [allMeals, setAllMeals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [personalTip, setPersonalTip] = useState<Insight | null>(null)
  const [generalTip, setGeneralTip] = useState<Insight | null>(null)

  useEffect(() => {
    const { personal, general } = generateInsights(userData, weeklyData, waterData, allMeals)
    setPersonalTip(personal[Math.floor(Math.random() * personal.length)] || null)
    setGeneralTip(general[Math.floor(Math.random() * general.length)])
  }, [userData, weeklyData, waterData, allMeals])

  const refreshPersonal = () => {
    const { personal } = generateInsights(userData, weeklyData, waterData, allMeals)
    if (personal.length <= 1) return
    const currentText = personalTip?.text
    const others = personal.filter(i => i.text !== currentText)
    setPersonalTip(others[Math.floor(Math.random() * others.length)] || personal[0])
  }

  const refreshGeneral = () => {
    const { general } = generateInsights(userData, weeklyData, waterData, allMeals)
    if (general.length <= 1) return
    const currentText = generalTip?.text
    const others = general.filter(i => i.text !== currentText)
    setGeneralTip(others[Math.floor(Math.random() * others.length)] || general[0])
  }

  useEffect(() => {
    const checkUserAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/')
          return
        }

        setUser(session.user)

        // Fetch weekly progress data from daily_logs
        const { data: logs, error: logsError } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: true })

        if (logsError) throw logsError

        if (logs) {
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

          // Map logs to their weekdays
          const logsByDay = logs.reduce((acc: any, log: any) => {
            const date = new Date(log.date)
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dayName = dayNames[date.getUTCDay()]
            acc[dayName] = {
              calories: log.calories_consumed || 0,
              protein: log.protein || 0,
              carbs: log.carbs || 0,
              fat: log.fat || 0,
              goal: log.calories_goal || 2000
            }
            return acc
          }, {})

          const formattedData = weekDays.map(day => ({
            day,
            calories: logsByDay[day]?.calories || 0,
            protein: logsByDay[day]?.protein || 0,
            carbs: logsByDay[day]?.carbs || 0,
            fat: logsByDay[day]?.fat || 0,
            goal: logsByDay[day]?.goal || 2000
          }))

          setWeeklyData(formattedData)
        }

        // Fetch weekly water data
        const { data: waterLogs, error: waterError } = await supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: true })

        if (waterError) throw waterError

        if (waterLogs) {
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          const waterByDay = waterLogs.reduce((acc: any, log: any) => {
            const date = new Date(log.date)
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dayName = dayNames[date.getUTCDay()]
            acc[dayName] = (acc[dayName] || 0) + (log.ml || 0)
            return acc
          }, {})

          const formattedWater = weekDays.map(day => ({
            day,
            ml: waterByDay[day] || 0
          }))
          setWaterData(formattedWater)
        }

        // Fetch all raw meals for behavioral analysis (Last 7 days)
        const { data: rawMeals, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

        if (mealsError) throw mealsError
        setAllMeals(rawMeals || [])
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

  const loggedDaysCount = weeklyData.filter(d => d.calories > 0).length || 1
  const avgCalories = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / loggedDaysCount)
    : 0

  const loggedProteinDaysCount = weeklyData.filter(d => d.protein > 0).length || 1
  const totalProtein = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.protein, 0) / loggedProteinDaysCount)
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
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Daily Insights Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Insight */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-left-4 duration-1000">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <UserCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-0.5">Your Progress</p>
                      <p className="text-sm font-medium text-slate-700">
                        {personalTip?.text || "Keep tracking to unlock personalized insights!"}
                      </p>
                    </div>
                  </div>
                  {personalTip && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refreshPersonal}
                      className="text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100/50 h-8 w-8 shrink-0"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* General Pro Tip */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-right-4 duration-1000">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-0.5">Pro Tip</p>
                      <p className="text-sm font-medium text-slate-700">
                        {generalTip?.text || "Consistency is the secret to a healthy lifestyle!"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshGeneral}
                    className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 h-8 w-8 shrink-0"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Weight */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Current Weight</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-emerald-600">
                          {userData?.weight ? `${userData.weight}` : '—'}
                        </p>
                        <span className="text-sm text-muted-foreground">kg</span>
                      </div>
                      {userData?.target_weight && (
                        <p className="text-xs text-muted-foreground mt-2">Goal: {userData.target_weight} kg</p>
                      )}
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <TrendingDown className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </Card>

                {/* Current Streak */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Current Streak</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-blue-600">{weeklyData.filter(d => d && d.calories > 0).length}</p>
                        <span className="text-sm text-muted-foreground">days tracked</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Flame className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                {/* Avg Daily Water */}
                <Card className="p-6 bg-white border-border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Avg Hydration</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-sky-500">
                          {waterData.length > 0
                            ? Math.round(waterData.reduce((sum, d) => sum + d.ml, 0) / (waterData.filter(d => d.ml > 0).length || 1))
                            : 0}
                        </p>
                        <span className="text-sm text-muted-foreground">ml/day</span>
                      </div>
                    </div>
                    <div className="p-3 bg-sky-100 rounded-full">
                      <Droplet className="w-6 h-6 text-sky-500" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Water Intake Chart */}
                <Card className="p-6 bg-white border-border shadow-sm rounded-xl overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-l font-black text-slate-700 uppercase tracking-tight">Water Intake</h3>
                      <p className="text-xs text-muted-foreground font-bold">Past 7 Days</p>
                    </div>
                    <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 text-sky-600 transition-colors">
                      <Droplet className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waterData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ fill: '#f8fafc', radius: 12 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-white/10 animate-in zoom-in-95">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">{payload[0].payload.day}</p>
                                  <p className="text-lg font-bold">{payload[0].value}<span className="text-xs ml-1 opacity-60">ml</span></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="ml"
                          radius={[12, 12, 12, 12]}
                          onClick={(data) => {
                            // Find the date for this day if possible, or just go to tracker
                            onNavigate('meal-tracker');
                          }}
                          className="cursor-pointer"
                        >
                          {waterData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.ml >= 2000 ? '#0ea5e9' : '#bae6fd'}
                              fillOpacity={0.8}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Calories Weekly Chart */}
                <Card className="p-6 bg-white border-border shadow-sm rounded-xl overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-l font-black text-slate-700 uppercase tracking-tight">Calories Weekly</h3>
                      <p className="text-xs text-muted-foreground font-bold">Goal vs Actual</p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 transition-colors">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ fill: '#f8fafc', radius: 12 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-xl border border-white/10 animate-in zoom-in-95">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">{data.day}</p>
                                  <div className="space-y-1">
                                    <p className="text-lg font-bold leading-none">{Math.round(data.calories)}<span className="text-[10px] ml-1 opacity-60 uppercase">Consumed</span></p>
                                    <p className="text-xs font-bold text-emerald-400">Goal: {data.goal} kcal</p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="calories"
                          radius={[12, 12, 12, 12]}
                          onClick={() => onNavigate('meal-tracker')}
                          className="cursor-pointer"
                        >
                          {weeklyData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.calories > entry.goal ? '#ef4444' : '#10b981'}
                              fillOpacity={0.8}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
