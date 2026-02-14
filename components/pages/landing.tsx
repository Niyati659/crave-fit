'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  LayoutDashboard,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react'
import { UtensilLoader } from '@/components/ui/utensil-loader'

interface LandingPageProps {
  onStartQuiz: () => void
  onNavigate: (view: any) => void
  onMealTrackerClick?: () => void
}

export function LandingPage({ onStartQuiz, onNavigate }: LandingPageProps) {
  const [isDealing, setIsDealing] = useState(true)
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    const dealTimer = setTimeout(() => {
      setIsDealing(false)
      setShowCards(true)
    }, 1400)

    return () => clearTimeout(dealTimer)
  }, [])

  /* ✅ PRODUCTION SAFE COLOR SYSTEM */
  const colorStyles = {
    orange: {
      badge: 'bg-gradient-to-br from-orange-600 to-orange-900 shadow-orange-500/30',
      text: 'text-orange-600/70',
    },
    blue: {
      badge: 'bg-gradient-to-br from-blue-600 to-blue-900 shadow-blue-500/30',
      text: 'text-blue-600/70',
    },
    rose: {
      badge: 'bg-gradient-to-br from-rose-600 to-rose-900 shadow-rose-500/30',
      text: 'text-rose-600/70',
    },
    indigo: {
      badge: 'bg-gradient-to-br from-indigo-600 to-indigo-900 shadow-indigo-500/30',
      text: 'text-indigo-600/70',
    },
  }

  const features = [
    {
      title: 'Dashboard',
      subtitle: 'Command Center',
      description:
        'Track your calories, protein, and daily macro progress in one sleek viewport.',
      icon: LayoutDashboard,
      color: 'orange',
      tint: 'bg-orange-50/80',
    },
    {
      title: 'Smart Quiz',
      subtitle: 'Discovery 2.0',
      description:
        'AI-powered quick quiz to pinpoint your hunger state and texture preferences.',
      icon: Sparkles,
      color: 'blue',
      tint: 'bg-blue-50/80',
    },
    {
      title: 'Recommendations',
      subtitle: 'Results Engine',
      description:
        'Get personalized food matches with healthy swaps to satisfy every craving.',
      icon: Utensils,
      color: 'rose',
      tint: 'bg-rose-50/80',
    },
    {
      title: 'Meal Tracker',
      subtitle: 'Log & Analyze',
      description:
        'Easily log meals and monitor your remaining calorie gap in real-time.',
      icon: UtensilsCrossed,
      color: 'indigo',
      tint: 'bg-indigo-50/80',
    },
  ]

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-b from-white via-white to-[#E8F5E9] flex items-center text-foreground">

      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[5%] -left-32 w-[35rem] h-[35rem] bg-emerald-100 rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-[35%] -right-32 w-[40rem] h-[40rem] bg-green-50 rounded-full blur-[160px] opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">

        {/* HERO */}
        <div className="text-center space-y-5">

          {/* <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full">
            ✨ Craving-Based Nutrition
          </span> */}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Eat what you crave.<br />
            <span className="bg-gradient-to-r from-primary via-emerald-600 to-primary bg-clip-text text-transparent italic">
              Know what you eat.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover delicious foods that match your cravings, explore their nutrition,
            and find healthier alternatives—all personalized just for you.
          </p>

          <div className="flex justify-center gap-6 text-sm font-bold text-muted-foreground pt-1">
            <span className="text-primary">Smart Discovery</span>
            <span>•</span>
            <span className="text-emerald-600">Health Focused</span>
            <span>•</span>
            <span className="text-primary">Smart Swaps</span>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="relative mt-10">

          {isDealing && (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <UtensilLoader />
            </div>
          )}

          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${
              showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className={`group relative p-7 rounded-[2.2rem] ${f.tint} backdrop-blur-3xl border border-white/30 shadow-xl hover:scale-[1.02] transition-all duration-500`}
              >
                {/* ✅ SAFE ICON BADGE */}
                <div className={`w-14 h-14 rounded-2xl ${colorStyles[f.color].badge} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500`}>
                  <f.icon className="w-7 h-7 text-white drop-shadow-sm" />
                </div>

                <h3 className="font-black text-base">{f.title}</h3>

                <p className={`text-[10px] font-bold ${colorStyles[f.color].text} uppercase tracking-widest`}>
                  {f.subtitle}
                </p>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}