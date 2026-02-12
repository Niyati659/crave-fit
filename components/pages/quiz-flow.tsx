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
      { text: 'Tired', emoji: '😴', color: 'bg-amber-100' },
      { text: 'Stressed', emoji: '😰', color: 'bg-blue-100' },
      { text: 'Energetic', emoji: '⚡', color: 'bg-yellow-100' },
      { text: 'Bored', emoji: '😐', color: 'bg-slate-100' },
    ],
  },
  {
    id: 'texture',
    question: 'What texture sounds best?',
    subtitle: 'Think about the mouthfeel you are looking for.',
    answers: [
      { text: 'Crispy', emoji: '✨', color: 'bg-orange-100' },
      { text: 'Soft', emoji: '☁️', color: 'bg-sky-100' },
      { text: 'Chewy', emoji: '🤜', color: 'bg-rose-100' },
      { text: 'Light', emoji: '🪶', color: 'bg-emerald-100' },
    ],
  },
  {
    id: 'taste',
    question: 'Sweet or Savory?',
    subtitle: 'The ultimate flavor crossroad.',
    answers: [
      { text: 'Sweet', emoji: '🍬', color: 'bg-pink-100' },
      { text: 'Savory', emoji: '🧂', color: 'bg-indigo-100' },
    ],
  },
  {
    id: 'hunger',
    question: 'How hungry are you?',
    subtitle: 'We will match the portion sizes accordingly.',
    answers: [
      { text: 'Light Snack', emoji: '🥜', color: 'bg-lime-100' },
      { text: 'Small Meal', emoji: '🍽️', color: 'bg-teal-100' },
      { text: 'Full Meal', emoji: '🍱', color: 'bg-violet-100' },
    ],
  },
  {
    id: 'diet',
    question: 'Any dietary preferences?',
    subtitle: 'Targeting specific nutritional needs.',
    answers: [
      { text: 'Vegetarian', emoji: '🥦', color: 'bg-green-100' },
      { text: 'Vegan', emoji: '🌱', color: 'bg-emerald-100' },
      { text: 'High Protein', emoji: '💪', color: 'bg-blue-100' },
      { text: 'Dairy-Free', emoji: '🥛', color: 'bg-sky-100' },
      { text: 'Gluten-Free', emoji: '🌾', color: 'bg-orange-100' },
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
    if (selectedAnswer) {
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
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Dynamic Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-1000 ${currentStep === 0 ? 'bg-amber-200' :
          currentStep === 1 ? 'bg-sky-200' :
            currentStep === 2 ? 'bg-pink-200' :
              'bg-emerald-200'
          }`} />
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-1000 ${currentStep === 0 ? 'bg-blue-200' :
          currentStep === 1 ? 'bg-indigo-300' :
            currentStep === 2 ? 'bg-violet-200' :
              'bg-teal-200'
          }`} />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              />
            </div>
          </div>

          <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-10"
            >
              {/* Question Header */}
              <div className="space-y-4 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Crave Engine</span>
                </motion.div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight text-balance">
                  {currentQuestion.question}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Choice Grid */}
              <div className="grid gap-3 sm:gap-4">
                {currentQuestion.answers.map((answer, index) => (
                  <motion.button
                    key={answer.text}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectAnswer(answer.text)}
                    className={`group relative p-5 rounded-3xl border transition-all duration-300 text-left flex items-center justify-between overflow-hidden ${selectedAnswer === answer.text
                      ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5 ring-1 ring-primary'
                      : 'border-slate-200 bg-white/60 backdrop-blur-sm hover:border-slate-300 hover:bg-white hover:shadow-lg'
                      }`}
                  >
                    {/* Hover Decoration */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${answer.color}`} />

                    <div className="relative flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${selectedAnswer === answer.text ? 'bg-white scale-110 rotate-6 shadow-md' : 'bg-slate-50'
                        }`}>
                        {answer.emoji}
                      </div>
                      <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${selectedAnswer === answer.text ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                        {answer.text}
                      </span>
                    </div>

                    <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedAnswer === answer.text
                      ? 'border-primary bg-primary text-white scale-110'
                      : 'border-slate-200 group-hover:border-primary/50'
                      }`}>
                      {selectedAnswer === answer.text && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={onSkip}
              size="lg"
              className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl"
            >
              Skip Engine
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              size="lg"
              className="relative flex-1 bg-slate-900 hover:bg-black text-white px-8 h-14 rounded-2xl shadow-xl shadow-slate-900/20 group font-bold disabled:opacity-30 disabled:grayscale transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
