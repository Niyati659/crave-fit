'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Flame, LogOut, UserCircle2, ChevronRight, Utensils, Lightbulb, Droplet, ArrowRight, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UtensilLoader } from '@/components/ui/utensil-loader'
import { generateInsights, Insight } from '@/lib/insights'
import { RotateCw, ShoppingCart, Sparkles, Loader2 } from 'lucide-react'
import { getRecipesByEnergy, getRecipesByCarbs, Recipe } from '@/lib/recipes'
import { analyzeCravingPatterns, CravingInsight } from '@/lib/craving-insights'

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
  const [behavioralStatus, setBehavioralStatus] = useState<{
    type: 'lethargic' | 'stressed' | 'consistent' | 'normal',
    message: string
  }>({ type: 'normal', message: '' })
  const [recommendations, setRecommendations] = useState<Recipe[]>([])
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false)
  const [cravingInsight, setCravingInsight] = useState<CravingInsight | null>(null)
  const [showDeficiencyDetails, setShowDeficiencyDetails] = useState(false)

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

  /* ⭐ Fetch craving pattern insights */
  useEffect(() => {
    const fetchCravingInsights = async () => {
      const insight = await analyzeCravingPatterns()
      setCravingInsight(insight)
    }
    fetchCravingInsights()
  }, [])

  useEffect(() => {
    if (isLoading || weeklyData.length === 0) return

    const determineStatus = async () => {
      console.log('--- Determining Dashboard Status ---')
      const loggedDays = weeklyData.filter(d => d.calories > 0)
      console.log('Logged Days:', loggedDays.length)

      let type: 'lethargic' | 'stressed' | 'consistent' | 'normal' = 'normal'
      let message = ''
      let minE = 200, maxE = 500

      if (loggedDays.length === 0) {
        console.log('No logged data found. Showing placeholder state.')
        type = 'consistent'
        message = "READY TO START YOUR JOURNEY? TRACK A MEAL TO GET BRAIN INSIGHTS!"
        minE = 300; maxE = 600
      } else {
        const avgCal = loggedDays.reduce((sum, d) => sum + d.calories, 0) / loggedDays.length
        const avgGoal = loggedDays.reduce((sum, d) => sum + d.goal, 0) / loggedDays.length
        console.log('Avg Calories:', avgCal, 'Avg Goal:', avgGoal)

        if (avgCal < avgGoal * 0.8) {
          type = 'lethargic'
          message = "I SEE YOU HAVE BEEN FEELING LETHARGIC. YOU NEED SOME ENERGY!"
          minE = 600; maxE = 1200
        } else if (avgCal > avgGoal * 1.2) {
          type = 'stressed'
          message = "SEEMS LIKE YOU ARE STRESSED AND NOT BEING ABLE TO KEEP. LET'S SUGGEST YOU LIGHT FOOD."
          minE = 50; maxE = 300
        } else if (loggedDays.length >= 4) {
          type = 'consistent'
          message = "HAVE BEEN VERY CONSISTENT THEN SUGGEST DISH WITH HIGH CARBS FOR CHEAT MEAL!"
          minE = 500; maxE = 900
        } else {
          type = 'consistent'
          message = "YOU'RE DOING GREAT! HOW ABOUT A HIGH-CARB REWARD TODAY?"
          minE = 400; maxE = 800
        }
      }

      console.log('Final Calculated Status Type:', type)
      setBehavioralStatus({ type, message })

      setIsRefreshingRecs(true)
      try {
        let reps: Recipe[] = []
        if (type === 'consistent') {
          // High carb for cheat meal
          reps = await getRecipesByCarbs(80, 150, 3)
        } else {
          // Energy based for lethargic/stressed
          reps = await getRecipesByEnergy(minE, maxE, 3)
        }
        console.log('Fetched Recommendations Count:', reps.length)
        setRecommendations(reps)
      } catch (err) {
        console.error('Failed to fetch energy/carb recommendations:', err)
      } finally {
        setIsRefreshingRecs(false)
      }
    }
    determineStatus()
  }, [isLoading, weeklyData])

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

              {/* 🧠 Craving Pattern / Nutrient Deficiency Alert */}
              {cravingInsight && cravingInsight.pattern !== 'balanced' && cravingInsight.deficiencies.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Card className={`p-0 overflow-hidden border shadow-sm ${cravingInsight.pattern === 'sweet'
                      ? 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-pink-200'
                      : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-indigo-200'
                    }`}>
                    {/* Alert Header */}
                    <div className={`px-6 py-4 flex items-center gap-3 ${cravingInsight.pattern === 'sweet' ? 'bg-pink-100/60' : 'bg-indigo-100/60'
                      }`}>
                      <div className={`p-2 rounded-full ${cravingInsight.pattern === 'sweet' ? 'bg-pink-200' : 'bg-indigo-200'
                        }`}>
                        <AlertTriangle className={`w-5 h-5 ${cravingInsight.pattern === 'sweet' ? 'text-pink-700' : 'text-indigo-700'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-black uppercase tracking-widest ${cravingInsight.pattern === 'sweet' ? 'text-pink-600' : 'text-indigo-600'
                          }`}>Craving Pattern Detected</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">
                          {cravingInsight.message}
                        </p>
                      </div>
                      <div className={`text-3xl font-black ${cravingInsight.pattern === 'sweet' ? 'text-pink-600' : 'text-indigo-600'
                        }`}>
                        {cravingInsight.percentage}%
                      </div>
                    </div>

                    {/* Deficiency Cards */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Possible Nutrient Gaps & Foods to Replenish
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cravingInsight.deficiencies.map((def, i) => (
                          <div
                            key={i}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-default"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{def.emoji}</span>
                              <h4 className={`text-sm font-bold ${cravingInsight.pattern === 'sweet' ? 'text-pink-700' : 'text-indigo-700'
                                }`}>{def.nutrient}</h4>
                            </div>
                            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                              {def.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {def.foods.map((food, j) => (
                                <span
                                  key={j}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cravingInsight.pattern === 'sweet'
                                      ? 'bg-pink-100 text-pink-700'
                                      : 'bg-indigo-100 text-indigo-700'
                                    }`}
                                >
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button
                        onClick={() => onNavigate('quiz')}
                        className={`w-full h-12 rounded-xl font-bold text-sm shadow-lg transition-all ${cravingInsight.pattern === 'sweet'
                            ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                          }`}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Find Foods to Replenish These Nutrients
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

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
                        <p className="text-4xl font-medium text-blue-600">{weeklyData.filter(d => d && d.calories > 0).length}</p>
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
                        <p className="text-4xl font-medium text-sky-500">
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
                      <h3 className="text-l font-semibold text-slate-700 uppercase tracking-tight">Water Intake</h3>
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
                      <h3 className="text-l font-semibold text-slate-700 uppercase tracking-tight">Calories Weekly</h3>
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

              {/* Behavior Analysis Report - UNIFIED WITH MACRO CARD STYLE */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Utensils className="w-4 h-4 text-slate-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Behavioral Analysis Report</h2>
                </div>

                <Card className={`p-8 border shadow-sm bg-gradient-to-br ${behavioralStatus.type === 'lethargic' ? 'from-amber-50 to-amber-100 border-amber-200' :
                  behavioralStatus.type === 'stressed' ? 'from-sky-50 to-sky-100 border-sky-200' :
                    'from-emerald-50 to-emerald-100 border-emerald-200'
                  }`}>
                  <div className="space-y-8">
                    {/* Status Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Analysis</p>
                        <h3 className={`text-2xl md:text-3xl font-black leading-[1.1] uppercase tracking-tight ${behavioralStatus.type === 'lethargic' ? 'text-amber-700' :
                          behavioralStatus.type === 'stressed' ? 'text-sky-700' :
                            'text-emerald-700'
                          }`}>
                          {behavioralStatus.message || "Analyzing your patterns..."}
                        </h3>
                        <p className="text-xs text-muted-foreground">Based on your recent calorie intake and goals</p>
                      </div>
                      {isRefreshingRecs && <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />}
                    </div>

                    {/* Recommendations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {isRefreshingRecs ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="h-32 rounded-xl bg-white/50 animate-pulse border border-white/20" />
                        ))
                      ) : recommendations.length > 0 ? (
                        recommendations.map((rec, i) => (
                          <div
                            key={i}
                            onClick={() => onNavigate('quiz')}
                            className="group bg-white/60 p-6 rounded-xl border border-white/40 shadow-sm transition-all hover:bg-white/90 cursor-pointer flex flex-col justify-between min-h-[140px]"
                          >
                            <h4 className="font-bold text-slate-900 uppercase text-sm leading-snug line-clamp-2">
                              {rec.name}
                            </h4>

                            <div className="flex items-center justify-between mt-4">
                              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                                {rec.calories} kcal
                              </span>
                              <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/40 rounded-xl">
                          <p className="text-muted-foreground font-semibold uppercase italic tracking-widest text-[10px]">Gathering more intelligence...</p>
                        </div>
                      )}
                    </div>
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
