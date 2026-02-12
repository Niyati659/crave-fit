'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { LandingPage } from '@/components/pages/landing'
import { QuizFlow } from '@/components/pages/quiz-flow'
import { RecommendationsScreen } from '@/components/pages/recommendations'
import { MealTracker } from '@/components/pages/meal-tracker'
import { Dashboard } from '@/components/pages/dashboard'
import { Header } from '@/components/header'

import { authStorage } from '@/lib/auth'

// ⭐ NEW QUIZ ENGINE
import { generateCravingProfile } from '@/lib/quiz-engine'

type PageView =
  | 'dashboard'
  | 'landing'
  | 'quiz'
  | 'recommendations'
  | 'meal-tracker'

export default function Page() {
  const router = useRouter()

  const [currentView, setCurrentView] =
    useState<PageView>('landing')

  const [quizAnswers, setQuizAnswers] =
    useState<Record<string, string>>({})

  const [quizMeta, setQuizMeta] = useState<any>(null)

  const [healthPreference, setHealthPreference] =
    useState(50)

  const [isLoggedIn, setIsLoggedIn] =
    useState(false)

  useEffect(() => {
    const user = authStorage.getUser()
    if (user) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleNavigate = (view: PageView) => {
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
      />

      {currentView === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} />
      )}

      {currentView === 'landing' && (
        <LandingPage
          onStartQuiz={() => handleNavigate('quiz')}
          onNavigate={handleNavigate}
          onMealTrackerClick={() =>
            handleNavigate('meal-tracker')
          }
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
          quizMeta={quizMeta}
          healthPreference={healthPreference}
          onHealthPreferenceChange={setHealthPreference}
          onBack={handleBackToLanding}
          onMealTrackerClick={() =>
            handleNavigate('meal-tracker')
          }
        />
      )}

      {currentView === 'meal-tracker' && (
        <MealTracker onBack={handleBackToLanding} />
      )}
    </main>
  )
}


