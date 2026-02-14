'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Flame, LogOut, UserCircle2, ChevronRight, Utensils, Lightbulb, Droplet, ArrowRight, AlertTriangle, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UtensilLoader } from '@/components/ui/utensil-loader'
import { generateInsights, Insight } from '@/lib/insights'
import { RotateCw, ShoppingCart, Sparkles, Loader2 } from 'lucide-react'
import { getRecipesByEnergy, getRecipesByCarbs, Recipe } from '@/lib/recipes'
import { analyzeCravingPatterns, CravingInsight } from '@/lib/craving-insights'
import { ChefFriend } from '@/components/chef-friend'

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
  const [selectedRecipeName, setSelectedRecipeName] = useState<string | null>(null)
  const [showChefFriend, setShowChefFriend] = useState(false)

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

  // Show ChefFriend page if recipe is selected
  if (showChefFriend && selectedRecipeName) {
    return (
      <div className="relative">
        <ChefFriend
          recipe={{ name: selectedRecipeName }}
          onClose={() => {
            setShowChefFriend(false)
            setSelectedRecipeName(null)
          }}
        />
      </div>
    )
  }

  const hasData = weeklyData.some(d => d.calories > 0)

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-6 px-4 sm:px-6 lg:px-8">

        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border-2 border-border shadow-sm">
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
             
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {!hasData ? (
            /* Empty State with Health Fact */
            <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-blue-100/60 to-blue-200/40 dark:from-blue-900/40 dark:to-blue-800/30 border-border shadow-sm">
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

                            {/* 🧠 DAILY + CRAVING INTELLIGENCE WRAPPER */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT — DAILY INTELLIGENCE */}
                <div className="space-y-6">

                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Daily Intelligence
                  </h2>

                  <div className="grid grid-cols-1 gap-6">

                    {/* Personal Insight */}
                    <div className="bg-emerald-100/60 dark:bg-emerald-900/30
 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40
 rounded-lg">
                          <UserCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-0.5">
                            Your Progress
                          </p>
                          <p className="text-sm font-medium text-foreground">
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

                    {/* Pro Tip */}
                    <div className="bg-blue-100/60 dark:bg-blue-900/30 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-0.5">
                            Pro Tip
                          </p>
                          <p className="text-sm font-medium text-foreground">
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
                </div>

                {/* RIGHT — CRAVING INTELLIGENCE */}
                <div className="space-y-6">

                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Craving Intelligence
                  </h2>

                  {cravingInsight && cravingInsight.pattern !== 'balanced' && cravingInsight.deficiencies.length > 0 && (
                    <Card className={`p-0 overflow-hidden border-border shadow-sm ${
                      cravingInsight.pattern === 'sweet'
                        ? 'bg-gradient-to-br from-pink-100/60 via-rose-100/40 to-orange-100/40 dark:from-pink-900/40 dark:via-rose-900/30 dark:to-orange-900/30'
                        : 'bg-gradient-to-br from-indigo-100/60 via-purple-100/40 to-blue-100/40 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-blue-900/30'
                    }`}>

                      {/* Header */}
                      <div className="px-6 py-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-pink-600" />
                        <p className="text-sm font-medium text-foreground">
                          {cravingInsight.message}
                        </p>
                        <div className="ml-auto text-2xl font-black text-pink-600">
                          {cravingInsight.percentage}%
                        </div>
                      </div>

                      {/* Nutrient tags preview */}
              <div className="p-6 space-y-4">

                <div className="flex flex-wrap gap-2">
                  {cravingInsight.deficiencies.map((d, i) => (
                    <span
                      key={i}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-card border-border"
                    >
                      {d.nutrient}
                    </span>
                  ))}
                </div>

                {/* CTA Button — UI only */}
                <button
                  className="
                      w-full h-10 rounded-xl font-bold text-xs
                      bg-card text-pink-600
                      border border-border
                      hover:bg-pink-100 dark:hover:bg-pink-900/40

                      shadow-sm
                      transition-all
                      "

                >
                  ✨ Find Foods to Replenish These Nutrients
                </button>

              </div>
                    </Card>
                  )}

                </div>

              </div>
              
                  {/* Analytics Section — Behavioral + Charts */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">

  {/* LEFT — Behavioral Report */}
  <div className="flex flex-col">

   

    {/* Behavioral Card */}
    <Card
  className={`
    p-8 border-border shadow-sm h-full
    flex flex-col gap-8
    bg-gradient-to-br
    ${
      behavioralStatus.type === 'lethargic'
        ? 'from-amber-100/60 to-amber-200/40 dark:from-amber-900/40 dark:to-amber-800/30 border-border'
        : behavioralStatus.type === 'stressed'
        ? 'from-sky-100/60 to-sky-200/40 dark:from-sky-900/40 dark:to-sky-800/30 border-border'
        : behavioralStatus.type === 'consistent'
        ?  'from-purple-100/60 to-purple-200/40 dark:from-purple-900/40 dark:to-purple-800/30 border-border'
        : 'from-emerald-100/60 to-emerald-200/40 dark:from-emerald-900/40 dark:to-emerald-800/30 border-border'
    }
  `}
>

      {/* Title INSIDE card */}
<div className="flex items-center gap-3 mb-6">

  <div className={`
    p-2 rounded-lg
    ${
      behavioralStatus.type === 'lethargic'
        ? 'bg-amber-200'
        : behavioralStatus.type === 'stressed'
        ? 'bg-sky-200'
        : behavioralStatus.type === 'consistent'
        ? 'bg-purple-200'
        : 'bg-emerald-200'
    }
  `}>
    <Utensils className="w-4 h-4 text-foreground" />
  </div>

  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
    Behavioral AI Report
  </h2>

</div>


      {/* TOP — STATUS */}
      <div className="space-y-4">

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Current Analysis
        </p>

        <h3
          className={`text-xl font-bold leading-snug ${
            behavioralStatus.type === 'lethargic'
              ? 'text-amber-700'
              : behavioralStatus.type === 'stressed'
              ? 'text-sky-700'
              : behavioralStatus.type === 'consistent'
              ? 'text-purple-700'
              : 'text-emerald-700'
          }`}
        >
          {behavioralStatus.message || 'Analyzing your patterns...'}
        </h3>

        <p className="text-xs text-muted-foreground">
          Based on your recent calorie intake, goals & mood insights
        </p>

      </div>

      {/* BOTTOM — RECIPES */}
{/* BOTTOM — RECIPES */}
<div className="mt-6">

  {isRefreshingRecs ? (

    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="h-20 rounded-xl bg-card/50 animate-pulse border-border"
        />
      ))}
    </div>

  ) : recommendations.length > 0 ? (

    <div className="flex flex-col gap-4">

      {recommendations.map((rec, i) => (

        <div
          key={i}
          onClick={() => {
            setSelectedRecipeName(rec.name)
            setShowChefFriend(true)
          }}
          className="
            w-full bg-card/80 backdrop-blur-sm
            p-5 rounded-xl border border-border/60
            hover:bg-card hover:shadow-md
            cursor-pointer transition-all
            flex items-center justify-between
          "
        >

          {/* LEFT — Text */}
          <div>
            <h4 className="font-bold text-foreground text-sm leading-snug">
              {rec.name}
            </h4>

            <p className="text-xs font-semibold text-muted-foreground mt-1">
              {rec.calories} kcal
            </p>
          </div>

          {/* RIGHT — Arrow */}
          <div className="
            w-8 h-8 rounded-full
            bg-card border border-border
            flex items-center justify-center
            group-hover:bg-primary group-hover:text-primary-foreground

            transition-all
          ">
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </div>

        </div>

      ))}

    </div>

  ) : (

    <div className="py-6 flex items-center justify-center border-2 border-dashed rounded-xl">
      <p className="text-xs text-muted-foreground italic">
        Gathering more intelligence…
      </p>
    </div>

  )}

</div>


    </Card>

  </div>


  {/* RIGHT — CHARTS STACK */}
  <div className="flex flex-col gap-6 h-full">

    {/* Water Chart */}
    <Card className="flex-1 p-6 bg-card border-border shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase text-foreground">
          Water Intake
        </h3>
        <Droplet className="w-5 h-5 text-sky-500" />
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterData}>
            <CartesianGrid
  stroke="hsl(var(--border))"
  strokeDasharray="3 3"
  vertical={false}
/>

            <XAxis dataKey="day" />
            <YAxis hide />
           <Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.75rem'
  }}
/>

            <Bar dataKey="ml" radius={[8, 8, 0, 0]}>
              {waterData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
  entry.ml >= 2000
    ? 'hsl(var(--primary))'
    : 'hsl(var(--muted))'
}

                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>

    {/* Calories Chart */}
    <Card className="flex-1 p-6 bg-card border-border shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase text-foreground">
          Calories Weekly
        </h3>
        <Flame className="w-5 h-5 text-emerald-500" />
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid
  stroke="hsl(var(--border))"
  strokeDasharray="3 3"
  vertical={false}
/>

            <XAxis dataKey="day" />
            <YAxis hide />
            <Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.75rem'
  }}
/>

            <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
              {weeklyData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
  entry.calories > entry.goal
  ? 'hsl(var(--destructive))'
  : 'hsl(var(--primary))'

}

                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>

  </div>

</div>


              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Weight */}
                <Card className="p-6 bg-card border-border shadow-sm">
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
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40
 rounded-full">
                      <TrendingDown className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </Card>

                {/* Current Streak */}
                <Card className="p-6 bg-card border-border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Current Streak</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-medium text-blue-600">{weeklyData.filter(d => d && d.calories > 0).length}</p>
                        <span className="text-sm text-muted-foreground">days tracked</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                      <Flame className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                {/* Avg Daily Water */}
                <Card className="p-6 bg-card border-border shadow-sm">
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
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/40 rounded-full">
                      <Droplet className="w-6 h-6 text-sky-500" />
                    </div>
                  </div>
                </Card>
              </div>


            </div>
          )}

        </div>
      </div>
    </div>
  )
}
