'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight } from 'lucide-react'

interface QuizFlowProps {
  onComplete: (answers: Record<string, string>) => void
  onSkip: () => void
  onBack: () => void
}

const quizQuestions = [
  {
    id: 'mood',
    question: 'How are you feeling right now?',
    answers: [
      { text: 'Tired', emoji: '😴' },
      { text: 'Stressed', emoji: '😰' },
      { text: 'Energetic', emoji: '⚡' },
      { text: 'Bored', emoji: '😐' },
    ],
  },
  {
    id: 'texture',
    question: 'What texture sounds best?',
    answers: [
      { text: 'Crispy', emoji: '✨' },
      { text: 'Soft', emoji: '☁️' },
      { text: 'Chewy', emoji: '🤜' },
      { text: 'Light', emoji: '🪶' },
    ],
  },
  {
    id: 'taste',
    question: 'Sweet or Savory?',
    answers: [
      { text: 'Sweet', emoji: '🍬' },
      { text: 'Savory', emoji: '🧂' },
    ],
  },
  {
    id: 'hunger',
    question: 'How hungry are you?',
    answers: [
      { text: 'Light Snack', emoji: '🥜' },
      { text: 'Small Meal', emoji: '🍽️' },
      { text: 'Full Meal', emoji: '🍱' },
    ],
  },
]

export function QuizFlow({ onComplete, onSkip, onBack }: QuizFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const currentQuestion = quizQuestions[currentStep]
  const progress = ((currentStep + 1) / quizQuestions.length) * 100

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNext = () => {
    if (selectedAnswer) {
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: selectedAnswer,
      }
      setAnswers(newAnswers)
      setSelectedAnswer(null)

      if (currentStep < quizQuestions.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        onComplete(newAnswers)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 mx-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {currentStep + 1}/{quizQuestions.length}
          </span>
        </div>
      </header>

      {/* Quiz Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-xl space-y-8">
          {/* Question */}
          <div className="space-y-2 text-center animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid gap-4 animate-slide-up">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={answer.text}
                onClick={() => handleSelectAnswer(answer.text)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between group cursor-pointer ${
                  selectedAnswer === answer.text
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl sm:text-3xl">{answer.emoji}</span>
                  <span className="text-lg sm:text-xl font-semibold text-foreground">
                    {answer.text}
                  </span>
                </div>
                {selectedAnswer === answer.text && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              variant="outline"
              onClick={onSkip}
              size="lg"
              className="border-border text-muted-foreground hover:text-foreground bg-transparent"
            >
              Skip Quiz
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
