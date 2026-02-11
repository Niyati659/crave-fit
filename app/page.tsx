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
import { ChefFriend } from '@/components/chef-friend'
import { supabase } from '@/lib/supabase'

type PageView = 'dashboard' | 'landing' | 'quiz' | 'recommendations' | 'meal-tracker' | 'profile' | 'chef'

export default function Page() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<PageView>('landing')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [healthPreference, setHealthPreference] = useState(50)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [activeRecipe, setActiveRecipe] = useState<{ name: string, instructions: string[] } | undefined>(undefined)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, age, weight, height, goal, allergies')
      .eq('id', userId)
      .single()

    if (data) {
      setUserData({ ...data, id: userId })
    }
  }

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true)
        fetchProfile(session.user.id)

        // Check for view redirect
        const urlParams = new URLSearchParams(window.location.search)
        const view = urlParams.get('view') as PageView
        if (view === 'dashboard') {
          setCurrentView('dashboard')
          window.history.replaceState({}, '', '/')
        }
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const handleNavigate = (view: PageView) => {
    if (view !== 'landing' && !isLoggedIn) {
      router.push('/auth/login')
      return
    }
    setCurrentView(view)
  }

  const handleStartQuiz = () => {
    setCurrentView('quiz')
    setQuizAnswers({})
  }

  const handleQuizComplete = (answers: Record<string, string>) => {
    setQuizAnswers(answers)
    setCurrentView('recommendations')
  }

  const handleSkipQuiz = () => {
    setCurrentView('recommendations')
    setQuizAnswers({})
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  // No early return for !isLoggedIn to allow Landing Page visibility

  return (
    <main className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userData={userData}
      />
      {currentView === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          userData={userData}
        />
      )}
      {currentView === 'landing' && (
        <LandingPage
          onStartQuiz={() => handleNavigate('quiz')}
          onNavigate={handleNavigate}
          onMealTrackerClick={() => handleNavigate('meal-tracker')}
        />
      )}
      {currentView === 'quiz' && (
        <QuizFlow
          onComplete={handleQuizComplete}
          onSkip={handleSkipQuiz}
          onBack={handleBackToLanding}
        />
      )}
      {currentView === 'recommendations' && (
        <RecommendationsScreen
          quizAnswers={quizAnswers}
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
      {currentView === 'meal-tracker' && (
        <MealTracker onBack={handleBackToLanding} />
      )}
      {currentView === 'profile' && (
        <Profile
          onBack={() => setCurrentView('dashboard')}
          onUpdate={() => fetchProfile(userData?.id || '')}
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
