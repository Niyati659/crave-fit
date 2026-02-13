import { supabase } from './supabase'

/* -------------------------------------------------- */
/* 🧠 CRAVING PATTERN ANALYSIS                        */
/* -------------------------------------------------- */

export interface NutrientDeficiency {
    nutrient: string
    emoji: string
    description: string
    foods: string[]
}

export interface CravingInsight {
    pattern: 'sweet' | 'savory' | 'balanced'
    count: number
    total: number
    percentage: number
    deficiencies: NutrientDeficiency[]
    message: string
}

/* ⭐ Nutritional science mapping */
const SWEET_DEFICIENCIES: NutrientDeficiency[] = [
    {
        nutrient: 'Magnesium',
        emoji: '🥬',
        description: 'Sweet cravings are often linked to low magnesium levels.',
        foods: ['Dark chocolate', 'Spinach', 'Almonds', 'Avocado', 'Bananas'],
    },
    {
        nutrient: 'Chromium',
        emoji: '🥦',
        description: 'Chromium helps regulate blood sugar — low levels trigger sugar cravings.',
        foods: ['Broccoli', 'Grapes', 'Whole grains', 'Mushrooms', 'Eggs'],
    },
    {
        nutrient: 'Zinc',
        emoji: '🫘',
        description: 'Zinc deficiency can reduce taste sensitivity, making you crave sweeter foods.',
        foods: ['Pumpkin seeds', 'Chickpeas', 'Lentils', 'Cashews', 'Yogurt'],
    },
]

const SAVORY_DEFICIENCIES: NutrientDeficiency[] = [
    {
        nutrient: 'Sodium',
        emoji: '🧂',
        description: 'Persistent savory/salty cravings may indicate sodium imbalance.',
        foods: ['Olives', 'Celery', 'Beetroot', 'Coconut water', 'Sea salt'],
    },
    {
        nutrient: 'Iron',
        emoji: '🥩',
        description: 'Low iron can cause cravings for rich, savory foods.',
        foods: ['Spinach', 'Lentils', 'Red meat', 'Tofu', 'Quinoa'],
    },
    {
        nutrient: 'B Vitamins',
        emoji: '🥚',
        description: 'B-vitamin deficiency can trigger cravings for salty, umami-rich foods.',
        foods: ['Eggs', 'Sunflower seeds', 'Nutritional yeast', 'Salmon', 'Sweet potatoes'],
    },
]

/* -------------------------------------------------- */
/* ⭐ FETCH AND ANALYZE                               */
/* -------------------------------------------------- */

export async function analyzeCravingPatterns(): Promise<CravingInsight | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return null

        /* Fetch last 10 quiz responses */
        const { data: responses, error } = await supabase
            .from('quiz_responses')
            .select('taste')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error || !responses || responses.length < 2) {
            return null
        }

        const total = responses.length
        const sweetCount = responses.filter(r => r.taste?.toLowerCase() === 'sweet').length
        const savoryCount = responses.filter(r => r.taste?.toLowerCase() === 'savory').length

        const sweetPct = (sweetCount / total) * 100
        const savoryPct = (savoryCount / total) * 100

        /* ⭐ Threshold: 60%+ = dominant pattern */
        const THRESHOLD = 60

        if (sweetPct >= THRESHOLD) {
            return {
                pattern: 'sweet',
                count: sweetCount,
                total,
                percentage: Math.round(sweetPct),
                deficiencies: SWEET_DEFICIENCIES,
                message: `You've chosen Sweet in ${sweetCount} of your last ${total} quizzes (${Math.round(sweetPct)}%). This could indicate nutrient gaps.`,
            }
        }

        if (savoryPct >= THRESHOLD) {
            return {
                pattern: 'savory',
                count: savoryCount,
                total,
                percentage: Math.round(savoryPct),
                deficiencies: SAVORY_DEFICIENCIES,
                message: `You've chosen Savory in ${savoryCount} of your last ${total} quizzes (${Math.round(savoryPct)}%). This could indicate nutrient gaps.`,
            }
        }

        return {
            pattern: 'balanced',
            count: 0,
            total,
            percentage: 0,
            deficiencies: [],
            message: 'Your taste preferences are well balanced!',
        }
    } catch (err) {
        console.error('Craving analysis error:', err)
        return null
    }
}
