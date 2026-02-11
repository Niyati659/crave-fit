'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LandingPage } from '@/components/pages/landing'
import { QuizFlow } from '@/components/pages/quiz-flow'
import { RecommendationsScreen } from '@/components/pages/recommendations'
import { MealTracker } from '@/components/pages/meal-tracker'
import { Dashboard } from '@/components/pages/dashboard'
import { authStorage } from '@/lib/auth'

type PageView = 'dashboard' | 'landing' | 'quiz' | 'recommendations' | 'meal-tracker'

export default function Page() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<PageView>('dashboard')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [healthPreference, setHealthPreference] = useState(50)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const user = authStorage.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

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

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-semibold">Loading CraveFit...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {currentView === 'dashboard' && (
        <Dashboard 
          onNavigate={setCurrentView}
        />
      )}
      {currentView === 'landing' && (
        <LandingPage 
          onStartQuiz={handleStartQuiz} 
          onNavigate={setCurrentView}
          onMealTrackerClick={() => setCurrentView('meal-tracker')}
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
          onMealTrackerClick={() => setCurrentView('meal-tracker')}
        />
      )}
      {currentView === 'meal-tracker' && (
        <MealTracker onBack={handleBackToLanding} />
      )}
    </main>
  )
}
