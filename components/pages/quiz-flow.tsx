'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizFlowProps {
  onComplete: (answers: Record<string, string>) => void
  onSkip: () => void
  onBack: () => void
}

const quizQuestions = [
  {
    id: 'mood',
    question: 'How are you feeling right now?',
    subtitle: 'Your hunger state is often tied to your mood.',
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
    subtitle: 'Think about the mouthfeel you are looking for.',
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
    subtitle: 'The ultimate flavor crossroad.',
    answers: [
      { text: 'Sweet', emoji: '🍬' },
      { text: 'Savory', emoji: '🧂' },
    ],
  },
  {
    id: 'hunger',
    question: 'How hungry are you?',
    subtitle: 'We will match the portion sizes accordingly.',
    answers: [
      { text: 'Light Snack', emoji: '🥜' },
      { text: 'Small Meal', emoji: '🍽️' },
      { text: 'Full Meal', emoji: '🍱' },
    ],
  },
  {
    id: 'diet',
    question: 'Any dietary preferences?',
    subtitle: 'Targeting specific nutritional needs.',
    answers: [
      { text: 'Anything', emoji: '🍽️' },
      { text: 'Vegetarian', emoji: '🥦' },
      { text: 'Vegan', emoji: '🌱' },
      { text: 'High Protein', emoji: '💪' },
      { text: 'Dairy-Free', emoji: '🥛' },
      { text: 'Gluten-Free', emoji: '🌾' },
    ],
  },
]

export function QuizFlow({ onComplete, onSkip, onBack }: QuizFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [direction, setDirection] = useState(0)

  const currentQuestion = quizQuestions[currentStep]
  const progress = ((currentStep + 1) / quizQuestions.length) * 100

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNext = () => {
    if (!selectedAnswer) return

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedAnswer,
    }

    setAnswers(newAnswers)
    setSelectedAnswer(null)
    setDirection(1)

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(newAnswers)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
      setSelectedAnswer(answers[quizQuestions[currentStep - 1].id])
    } else {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-300">

      {/* Background Accent Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full bg-primary/20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] blur-[120px] rounded-full bg-secondary/20" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 border-b border-border bg-background/60 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              />
            </div>
          </div>

          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            {currentStep + 1} / {quizQuestions.length}
          </span>
        </div>
      </header>

      {/* Quiz Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-10"
            >

              {/* Question Header */}
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    Crave Engine
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
                  {currentQuestion.question}
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Answers */}
              <div className="grid gap-4">
                {currentQuestion.answers.map((answer, index) => (
                  <motion.button
                    key={answer.text}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectAnswer(answer.text)}
                    className={`group relative p-5 rounded-3xl border transition-all duration-300 text-left flex items-center justify-between overflow-hidden ${
                      selectedAnswer === answer.text
                        ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/60 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                        selectedAnswer === answer.text
                          ? 'bg-primary/20 scale-110 rotate-6 shadow-md'
                          : 'bg-muted'
                      }`}>
                        {answer.emoji}
                      </div>

                      <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                        selectedAnswer === answer.text
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {answer.text}
                      </span>
                    </div>

                    <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      selectedAnswer === answer.text
                        ? 'border-primary bg-primary text-primary-foreground scale-110'
                        : 'border-border group-hover:border-primary/50'
                    }`}>
                      {selectedAnswer === answer.text && (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <Button
              variant="ghost"
              onClick={onSkip}
              size="lg"
              className="text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs h-14 rounded-2xl"
            >
              Skip Engine
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 rounded-2xl shadow-lg shadow-primary/20 group font-bold disabled:opacity-30 disabled:grayscale transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
