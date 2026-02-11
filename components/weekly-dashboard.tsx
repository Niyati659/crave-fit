'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card } from '@/components/ui/card'
import { Flame, TrendingUp, Target, Zap } from 'lucide-react'

interface WeeklyData {
  day: string
  calories: number
  protein: number
  target: number
}

interface DashboardProps {
  weeklyData?: WeeklyData[]
}

export function WeeklyDashboard({ weeklyData }: DashboardProps) {
  // Default weekly data if not provided
  const defaultData: WeeklyData[] = [
    { day: 'Mon', calories: 1850, protein: 120, target: 2000 },
    { day: 'Tue', calories: 2050, protein: 135, target: 2000 },
    { day: 'Wed', calories: 1950, protein: 128, target: 2000 },
    { day: 'Thu', calories: 2100, protein: 145, target: 2000 },
    { day: 'Fri', calories: 1750, protein: 110, target: 2000 },
    { day: 'Sat', calories: 2200, protein: 150, target: 2000 },
    { day: 'Sun', calories: 1900, protein: 125, target: 2000 },
  ]

  const data = weeklyData || defaultData

  // Calculate stats
  const avgCalories = Math.round(data.reduce((sum, d) => sum + d.calories, 0) / data.length)
  const avgProtein = Math.round(data.reduce((sum, d) => sum + d.protein, 0) / data.length)
  const totalCalories = data.reduce((sum, d) => sum + d.calories, 0)
  const mealsLogged = data.length

  const stats = [
    { icon: Flame, label: 'Avg Calories', value: avgCalories, unit: 'kcal', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { icon: Zap, label: 'Avg Protein', value: avgProtein, unit: 'g', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: Target, label: 'Total Days', value: mealsLogged, unit: 'tracked', color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: TrendingUp, label: 'Weekly Total', value: totalCalories, unit: 'kcal', color: 'text-primary', bgColor: 'bg-primary/10' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`${stat.bgColor} p-6 space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.unit}</p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Daily Calorie Intake</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                cursor={{ fill: '#f0f0f0' }}
              />
              <Legend />
              <Bar dataKey="calories" fill="#f97316" name="Calories" radius={[8, 8, 0, 0]} />
              <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Protein Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Daily Protein Intake</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                cursor={{ fill: '#f0f0f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} name="Protein" dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">On Track Days</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-primary">{Math.round((data.filter(d => d.calories <= d.target).length / data.length) * 100)}</p>
              <p className="text-muted-foreground">%</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Daily Deficit/Surplus</p>
            <div className="flex items-baseline gap-1">
              <p className={`text-3xl font-bold ${avgCalories > 2000 ? 'text-orange-600' : 'text-green-600'}`}>
                {avgCalories > 2000 ? '+' : ''}{avgCalories - 2000}
              </p>
              <p className="text-muted-foreground">kcal</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Consistency Score</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-primary">{Math.round(data.length * 14.3)}</p>
              <p className="text-muted-foreground">/100</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
