'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Timer, ArrowRight, ArrowLeft, Camera, CheckCircle2, Clock, X, UserCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { getRecipeByTitle, type Recipe } from '@/lib/recipes'

interface ChefFriendProps {
    recipe?: Partial<Recipe>
    onClose: () => void
}

export function ChefFriend({ recipe: initialRecipe, onClose }: ChefFriendProps) {
    const [recipe, setRecipe] = useState<Partial<Recipe> | undefined>(initialRecipe)
    const [currentStep, setCurrentStep] = useState(0)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [servings, setServings] = useState(2)
    const [customPrompt, setCustomPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [initialTime, setInitialTime] = useState<number | null>(null)
    const [isDone, setIsDone] = useState(false)

    // Sync state if initialRecipe changes
    useEffect(() => {
        if (initialRecipe) {
            setRecipe(initialRecipe)
            setCurrentStep(0)
        }
    }, [initialRecipe])

    const steps = recipe?.instructions || [
        "Select a recipe to start cooking with your Chef Friend!",
    ]

    const totalSteps = steps.length
    const progress = ((currentStep + 1) / totalSteps) * 100

    // Magic scaling logic for ingredients
    const renderIngredient = (ing: any) => {
        if (typeof ing === 'string') {
            return ing.replace(/(\d+(?:\/\d+)?(?:\.\d+)?)/g, (match) => {
                const factor = servings

                if (match.includes('/')) {
                    const [num, den] = match.split('/').map(Number)
                    const val = (num / den) * factor
                    return val % 1 === 0 ? val.toString() : val.toFixed(1)
                }

                const val = parseFloat(match) * factor
                return val % 1 === 0 ? val.toString() : val.toFixed(1)
            })
        }

        // Structured Ingredient scaling
        const factor = servings

        // Handle numeric strings or fractions in quantity
        let rawQty = 0
        const qtyStr = String(ing.quantity || '0')
        if (qtyStr.includes('/')) {
            const [num, den] = qtyStr.split('/').map(Number)
            rawQty = num / den
        } else {
            rawQty = parseFloat(qtyStr) || 0
        }

        const scaledQty = rawQty * factor
        const formattedQty = scaledQty === 0 ? '' : (scaledQty % 1 === 0 ? scaledQty.toString() : scaledQty.toFixed(1))

        return `${formattedQty} ${ing.unit} ${ing.name}`.trim()
    }

    const handleGenerateRecipe = async () => {
        if (!customPrompt.trim()) return
        setIsGenerating(true)

        try {
            const fetchedRecipe = await getRecipeByTitle(customPrompt)
            if (fetchedRecipe) {
                setRecipe(fetchedRecipe)
                setCurrentStep(0)
            } else {
                // Fallback to simple custom generation if API fails/no match
                setRecipe({
                    name: `Custom ${customPrompt}`,
                    ingredients: [{ name: 'Selection of fresh ingredients', quantity: '1', unit: 'selection', phrase: 'Selection of fresh ingredients' }],
                    instructions: [
                        `Start by prepping your ingredients for ${customPrompt}.`,
                        'Heat your cooking surface to the desired temperature.',
                        'Combine and cook until gold and delicious!',
                        'Enjoy your custom chef creation!'
                    ]
                })
                setCurrentStep(0)
            }
        } catch (error) {
            console.error('Chef Buddy Generation Error:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    // Regex to detect time in instructions
    useEffect(() => {
        if (!recipe) return
        const instruction = steps[currentStep]
        const timeMatch = instruction.match(/(\d+)\s*(minute|min|sec|second)/i)
        if (timeMatch) {
            const amount = parseInt(timeMatch[1])
            const unit = timeMatch[2].toLowerCase()
            const totalSeconds = unit.includes('min') ? amount * 60 : amount
            setTimeLeft(totalSeconds)
            setInitialTime(totalSeconds)
        } else {
            setTimeLeft(null)
            setInitialTime(null)
        }
        setIsTimerRunning(false)
        setImageError(false) // Reset error when step changes
    }, [currentStep, steps, recipe])

    // Timer logic
    useEffect(() => {
        let interval: any
        if (isTimerRunning && timeLeft && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0))
            }, 1000)
        } else if (timeLeft === 0) {
            setIsTimerRunning(false)
        }
        return () => clearInterval(interval)
    }, [isTimerRunning, timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getChefImage = () => {
        if (!recipe) return '/chef/S1.png'
        if (isDone) return '/chef/S5.png'

        // Cycle through S1, S2, S3, S4 based on the step progression
        const images = ['/chef/S1.png', '/chef/S2.png', '/chef/S3.png', '/chef/S4.png']
        return images[currentStep % images.length]
    }

    const getChefEmoji = () => {
        if (!recipe) return '🤔'
        const instruction = steps[currentStep].toLowerCase()
        if (instruction.includes('mix') || instruction.includes('stir') || instruction.includes('combine') || instruction.includes('whisk')) return '🥣'
        if (instruction.includes('bake') || instruction.includes('oven')) return '🔥'
        if (instruction.includes('cook') || instruction.includes('fry') || instruction.includes('pan')) return '🍳'
        if (instruction.includes('eat') || instruction.includes('serve') || instruction.includes('enjoy')) return '😋'
        return '👻'
    }

    return (
        <div className="relative min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4 pt-10 overflow-x-hidden">
            {/* Vibrant Yellow-Orangish Gingham Background - Fullscreen behind page content */}
            <div className="fixed inset-0 gingham-bg z-[10]" />

            <div className="relative z-[20] w-full max-w-6xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                {/* Hanging Ropes - Simplified for better centering */}
                <div className="absolute -top-8 inset-x-0 flex justify-around px-24">
                    <div className="w-1.5 h-20 bg-black rounded-full" />
                    <div className="w-1.5 h-20 bg-black rounded-full" />
                </div>

                {/* The Stacked Hanging Board Container */}
                <div className="relative w-full">
                    {/* Shadow Layer (The "back" board) - Pure Translucent Glass */}
                    <div className="absolute inset-0 bg-white/10 rounded-[3rem] translate-x-2 translate-y-2 backdrop-blur-md border border-white/20" />

                    {/* Main Board - Pure Translucent Glass */}
                    <Card className="relative border-4 border-white/40 bg-white/10 rounded-[3rem] overflow-hidden shadow-2xl min-h-[380px] flex flex-col transition-all backdrop-blur-3xl">
                        {/* Mounting Holes - Shiny metal/glass look */}
                        <div className="absolute top-8 inset-x-0 flex justify-around px-20 pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-white/50 border-4 border-white/20 shadow-inner backdrop-blur-sm" />
                            <div className="w-8 h-8 rounded-full bg-white/50 border-4 border-white/20 shadow-inner backdrop-blur-sm" />
                        </div>

                        {recipe && (
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10">
                                <div
                                    className="h-full bg-white transition-all duration-500 shadow-[0_0_20px_white]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}

                        <div className="bg-white/10 border-b-4 border-white/10 flex flex-row items-center justify-between p-8 pt-16">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/40 border-2 border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner rotate-1">
                                    <span className="text-2xl" style={{ filter: recipe ? 'drop-shadow(0 0-8px #fb923c) saturate(2)' : 'none' }}>{recipe ? '👻' : '🔍'}</span>
                                </div>
                                <div className="rotate-0">
                                    <h2 className="text-2xl font-black text-black drop-shadow-md leading-none">Chef Buddy</h2>
                                    <p className="text-[20px] font-black text-black/200 uppercase">
                                        {recipe?.name || 'Healthy Magic'}
                                    </p>
                                    {recipe && recipe.calories && (
                                        <div className="flex gap-2 mt-2">
                                            <div className="px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-600 uppercase">
                                                {recipe.calories} kcal
                                            </div>
                                            {recipe.protein && (
                                                <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-600 uppercase">
                                                    P: {recipe.protein}g
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-black hover:bg-white/20 rounded-full h-12 w-12 border border-white/10 backdrop-blur-md"
                            >
                                <X className="w-8 h-8" />
                            </Button>
                        </div>

                        <CardContent className="flex-1 p-6 md:p-10 relative overflow-y-auto bg-white/10 backdrop-blur-sm">
                            {!recipe ? (
                                <div className="flex flex-col items-center gap-6 py-4">
                                    <div className="text-center space-y-2">
                                        <Image src="/chef/S1.png" alt="Chef Buddy" width={160} height={160} className="mx-auto drop-shadow-2xl" />
                                        <h2 className="text-3xl font-black text-black">What are we cooking?</h2>
                                        <p className="text-black/70 font-bold max-w-sm mx-auto text-sm">
                                            I'll help you whip up something magical and healthy!
                                        </p>
                                    </div>

                                    <div className="w-full max-w-md space-y-4 relative z-50">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Try 'Ghost Pizza' or 'Magic Salad'..."
                                                className="w-full h-16 px-8 rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.1)] text-lg font-bold focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none pr-16"
                                                value={customPrompt}
                                                onChange={(e) => setCustomPrompt(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateRecipe()}
                                            />
                                            <button
                                                onClick={handleGenerateRecipe}
                                                disabled={isGenerating}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isGenerating ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <ArrowRight className="w-6 h-6" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : isDone ? (
                                <div className="flex flex-col items-center gap-10 py-6 text-center animate-in zoom-in-95 duration-500">
                                    <div className="relative">
                                        <Image src="/chef/S5.png" alt="Chef Buddy" width={250} height={250} className="drop-shadow-3xl animate-bounce" />
                                    </div>
                                    <div className="space-y-6 px-4">
                                        <h1 className="text-4xl font-black text-black leading-none italic uppercase">Masterpiece!</h1>
                                        <p className="text-lg font-bold text-black/80 uppercase">
                                            Your {recipe?.name} is ready for the gram! 📸
                                        </p>
                                        <div className="bg-black/10 p-8 rounded-[2rem] border-4 border-dashed border-black/20 max-w-sm mx-auto">
                                            <p className="text-lg font-bold text-black leading-relaxed italic">
                                                "Show off your healthy creations! Create a snap and keep the magic going!"
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md px-6">
                                        <Button
                                            className="flex-1 h-20 rounded-3xl bg-black text-white font-black text-2xl gap-4 shadow-[10px_10px_0_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all group"
                                            onClick={() => alert("Photo capture coming soon! 📸")}
                                        >
                                            <Camera className="w-8 h-8 group-hover:scale-125 transition-transform" />
                                            CREATE SNAP
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                    {/* Character Area */}
                                    <div className="relative group flex justify-center">
                                        <div className="relative aspect-square w-full max-w-[280px] bg-white/20 rounded-[2.5rem] border-4 border-black/10 shadow-inner flex items-center justify-center overflow-hidden">
                                            <Image
                                                src={getChefImage()}
                                                alt="Chef Buddy"
                                                width={260}
                                                height={260}
                                                className="object-contain drop-shadow-2xl p-4"
                                                priority
                                            />
                                        </div>

                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black shadow-2xl rounded-2xl p-3 flex items-center gap-4 border-2 border-[#fdba74]">
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 4, 8].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setServings(s)}
                                                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${servings === s ? 'bg-[#fdba74] text-black scale-110 shadow-lg' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-white/60 px-2 uppercase border-l border-white/20">Servings</span>
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex flex-col justify-center space-y-4 bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.05)] min-h-[350px]">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-black text-[#fbbf24] font-black uppercase italic tracking-widest text-xs shadow-md mx-auto md:mx-0">
                                                Step {currentStep + 1}
                                            </div>

                                            <h2 className="text-2xl font-black text-black leading-[1.2] tracking-tight text-center md:text-left uppercase">
                                                {steps[currentStep]}
                                            </h2>

                                            {currentStep === 0 && recipe.ingredients && recipe.ingredients.length > 0 && (
                                                <div className="bg-black/5 p-4 rounded-[1.5rem] border-2 border-black/10 space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 text-center">Ingredients</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                                        {recipe.ingredients.map((ing, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-[13px] font-black text-black group">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                                                <span className="uppercase">{renderIngredient(ing)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timer Control */}
                                        {timeLeft !== null && initialTime !== null && (
                                            <div className="flex flex-col items-center gap-4 bg-orange-500/10 p-6 rounded-[2rem] border-2 border-black/5">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black font-mono text-black">{formatTime(timeLeft)}</span>
                                                    <span className="text-xs font-black uppercase text-black/40">mins</span>
                                                </div>
                                                <Button
                                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                                    className={`h-14 w-full rounded-2xl font-black text-lg transition-all shadow-[6px_6px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${isTimerRunning ? 'bg-orange-600 text-white' : 'bg-black text-[#fdba74]'}`}
                                                >
                                                    {isTimerRunning ? 'PAUSE MAGIC' : 'START TIMER'}
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                                disabled={currentStep === 0}
                                                className="flex-1 rounded-2xl border-4 border-black/80 font-black text-lg h-16 bg-white/40 hover:bg-white/60 transition-all backdrop-blur-md"
                                            >
                                                <ArrowLeft className="w-5 h-5 mr-2" />
                                                PREV
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (currentStep < totalSteps - 1) {
                                                        setCurrentStep(currentStep + 1)
                                                    } else {
                                                        setIsDone(true)
                                                    }
                                                }}
                                                className="flex-[2] rounded-2xl bg-black/90 text-[#fbbf24] hover:text-white font-black text-lg h-16 shadow-[6px_6px_0_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all border-4 border-white/20"
                                            >
                                                {currentStep < totalSteps - 1 ? 'NEXT' : 'DONE!'}
                                                <ArrowRight className="w-6 h-6 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <button
                className="group flex items-center justify-center gap-3 w-full py-4 text-sm font-bold text-muted-foreground hover:text-primary transition-all duration-300"
                onClick={() => alert("Photo API integration coming soon!")}
            >
                <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                    <Camera className="w-5 h-5" />
                </div>
                <span>Show off your progress! Take a snap</span>
            </button>

            <style jsx global>{`
        .gingham-bg {
            background-color: #fef3c7;
            background-image: 
                linear-gradient(90deg, rgba(245, 158, 11, 0.4) 50%, transparent 50%),
                linear-gradient(rgba(245, 158, 11, 0.4) 50%, transparent 50%);
            background-size: 80px 80px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
`}</style>
        </div>
    )
}
