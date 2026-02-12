'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { LandingPage } from '@/components/pages/landing'
import { QuizFlow } from '@/components/pages/quiz-flow'
import { RecommendationsScreen } from '@/components/pages/recommendations'
import { MealTracker } from '@/components/pages/meal-tracker'
import { Dashboard } from '@/components/pages/dashboard'
import { Profile } from '@/components/pages/profile'
import { Header } from '@/components/header'

// import { authStorage } from '@/lib/auth'

// ⭐ NEW QUIZ ENGINE
import { generateCravingProfile } from '@/lib/quiz-engine'

import { ChefFriend } from '@/components/chef-friend'
import { supabase } from '@/lib/supabase'
import { BrowseScreen } from '@/components/pages/browse'

type PageView =
  | 'dashboard'
  | 'landing'
  | 'quiz'
  | 'recommendations'
  | 'meal-tracker'
  | 'browse'
  | 'meal-tracker'
  | 'profile'
  | 'chef'

export default function Page() {
  const router = useRouter()


  const [quizMeta, setQuizMeta] = useState<any>(null)

  const [currentView, setCurrentView] = useState<PageView>('landing')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [healthPreference, setHealthPreference] = useState(50)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [activeRecipe, setActiveRecipe] = useState<{ name: string, instructions: string[] } | undefined>(undefined)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, age, weight, height, goal, allergies, target_weight, goal_timeline')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Supabase fetchProfile Error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return
    }

    if (data) {
      setUserData({ ...data, id: userId })
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsLoggedIn(true)
        fetchProfile(session.user.id)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsLoggedIn(true)
        if (session) fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setUserData(null)
        setCurrentView('landing')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 🔥 Controlled Navigation
  const handleNavigate = (view: PageView) => {
    // ❌ Block manual access to recommendations
    if (view === 'recommendations') return

    // 🔐 Protect non-landing routes
    if (view !== 'landing' && !isLoggedIn) {
      router.push('/auth/login')
      return
    }

    setCurrentView(view)
  }

  const handleQuizComplete = (
    answers: Record<string, string>
  ) => {
    setQuizAnswers(answers)

    const cravingData =
      generateCravingProfile(answers)

    const meta = {
      answers,
      ...cravingData,
      timestamp: new Date().toISOString(),
    }

    setQuizMeta(meta)

    saveQuizHistory(meta)

    setCurrentView('recommendations')
  }

  useEffect(() => {
  if (!quizAnswers || Object.keys(quizAnswers).length === 0) return

  const updatedMeta = generateCravingProfile(
    quizAnswers,
    healthPreference // ⭐ THIS IS MAGIC
  )

  setQuizMeta((prev:any) => ({
    ...prev,
    ...updatedMeta,
  }))
  }, [healthPreference])


  const handleSkipQuiz = () => {
    setCurrentView('recommendations')
    setQuizAnswers({})
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  const saveQuizHistory = (entry: any) => {
    const history =
      JSON.parse(localStorage.getItem('quizHistory') || '[]')

    history.push(entry)

    localStorage.setItem(
      'quizHistory',
      JSON.stringify(history)
    )
  }

  return (
    <main className="min-h-screen bg-background">

      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userData={userData}
      />

      {currentView === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} userData={userData} />
      )}

      {currentView === 'landing' && (
        <LandingPage
          onStartQuiz={() => setCurrentView('quiz')}
          onNavigate={handleNavigate}
          onMealTrackerClick={() =>
            handleNavigate('meal-tracker')
          }
        />
      )}

      {currentView === 'quiz' && (
        <QuizFlow
          onComplete={handleQuizComplete}
          onSkip={() => setCurrentView('recommendations')}
          onBack={handleBackToLanding}
        />
      )}

      {currentView === 'recommendations' && (
        <RecommendationsScreen
          quizMeta={quizMeta}
          healthPreference={healthPreference}
          onHealthPreferenceChange={setHealthPreference}
          onBack={handleBackToLanding}
          onMealTrackerClick={() => handleNavigate('meal-tracker')}
          onCookWithChef={(recipe: { name: string, instructions: string[] }) => {
            setActiveRecipe(recipe)
            setCurrentView('chef')
          }}
        />
      )}

      {currentView === 'browse' && (
        <BrowseScreen onBack={handleBackToLanding} />
      )}

      {currentView === 'meal-tracker' && (
        <MealTracker onBack={handleBackToLanding} onNavigate={handleNavigate} />
      )}

      {currentView === 'profile' && (
        <Profile
          onBack={() => setCurrentView('dashboard')}
          onUpdate={(userId?: string) => fetchProfile(userId || userData?.id || '')}
        />
      )}
      {currentView === 'chef' && (
        <ChefFriend
          recipe={activeRecipe}
          onClose={() => {
            setCurrentView('recommendations')
            setActiveRecipe(undefined)
          }}
        />
      )}
    </main>
  )
}


