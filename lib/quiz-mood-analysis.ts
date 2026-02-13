import { supabase } from './supabase'

export interface MoodAnalysis {
  mood: 'tired' | 'stressed' | 'energetic' | 'bored' | null
  calorieRange: { min: number; max: number }
  message: string
  emoji: string
}

/**
 * Fetch the latest quiz response for current user
 */
export async function getLatestQuizResponse() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data, error } = await supabase
      .from('quiz_responses')
      .select('mood, texture, taste, hunger, diet, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data
  } catch (err) {
    console.error('Error fetching latest quiz response:', err)
    return null
  }
}

/**
 * Analyze mood and determine food recommendations
 */
export function analyzeMoodForRecommendations(
  mood: string | null | undefined
): MoodAnalysis {
  if (!mood) {
    return {
      mood: null,
      calorieRange: { min: 300, max: 600 },
      message: 'READY TO DISCOVER YOUR NEXT FAVORITE MEAL?',
      emoji: '🍽️'
    }
  }

  const moodLower = mood.toLowerCase().trim()

  switch (moodLower) {
    case 'tired':
      return {
        mood: 'tired',
        calorieRange: { min: 600, max: 1200 },
        message: "YOU SEEM TIRED! LET'S BOOST YOUR ENERGY WITH SOME POWER FOODS.",
        emoji: '⚡'
      }

    case 'stressed':
      return {
        mood: 'stressed',
        calorieRange: { min: 50, max: 300 },
        message: "SEEMS LIKE YOU ARE STRESSED AND NOT BEING ABLE TO KEEP. LET'S SUGGEST YOU LIGHT FOOD.",
        emoji: '🧘'
      }

    case 'energetic':
      return {
        mood: 'energetic',
        calorieRange: { min: 400, max: 800 },
        message: "YOU'RE FULL OF ENERGY! HOW ABOUT A BALANCED HIGH-PROTEIN MEAL?",
        emoji: '💪'
      }

    case 'bored':
      return {
        mood: 'bored',
        calorieRange: { min: 350, max: 700 },
        message: "FEELING BORED? LET'S EXPLORE SOME INTERESTING AND UNIQUE CUISINES!",
        emoji: '🌍'
      }

    default:
      return {
        mood: null,
        calorieRange: { min: 300, max: 600 },
        message: 'READY TO DISCOVER YOUR NEXT FAVORITE MEAL?',
        emoji: '🍽️'
      }
  }
}

/**
 * Get mood-based behavioral status with quiz analysis
 */
export async function getMoodBasedBehaviorStatus() {
  try {
    const quizResponse = await getLatestQuizResponse()

    if (quizResponse && quizResponse.mood) {
      const analysis = analyzeMoodForRecommendations(quizResponse.mood)
      return {
        type: analysis.mood || 'normal',
        message: analysis.message,
        calorieRange: analysis.calorieRange,
        emoji: analysis.emoji,
        source: 'quiz' // Indicates this came from quiz, not calorie analysis
      }
    }

    return null
  } catch (err) {
    console.error('Error analyzing mood-based behavior:', err)
    return null
  }
}
