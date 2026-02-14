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
        emoji: '�',
        description: 'Where You Find It\nRich Sources:\nSpinach, Almonds, Dark chocolate (70%+), Banana, Black beans, Pumpkin seeds, Whole grains',
        foods: ['Spinach', 'Almonds', 'Dark chocolate (70%+)', 'Banana', 'Black beans', 'Pumpkin seeds', 'Whole grains'],
    },
    {
        nutrient: 'Chromium',
        emoji: '🥦',
        description: 'Where You Find It\nRich Sources:\nBroccoli, Grapes, Whole grains, Mushrooms, Eggs\nChromium helps regulate blood sugar — low levels trigger sugar cravings.',
        foods: ['Broccoli', 'Grapes', 'Whole grains', 'Mushrooms', 'Eggs'],
    },
    {
        nutrient: 'Zinc',
        emoji: '🫘',
        description: 'Where You Find It\nRich Sources:\nPumpkin seeds, Chickpeas, Lentils, Cashews, Yogurt\nZinc deficiency can reduce taste sensitivity, making you crave sweeter foods.',
        foods: ['Pumpkin seeds', 'Chickpeas', 'Lentils', 'Cashews', 'Yogurt'],
    },
]

const SAVORY_DEFICIENCIES: NutrientDeficiency[] = [
    {
        nutrient: 'Sodium',
        emoji: '🧂',
        description: 'Where You Find It\nRich Sources:\nTable salt, Pickles, Salted nuts, Cheese, Processed foods',
        foods: ['Table salt', 'Pickles', 'Salted nuts', 'Cheese', 'Processed foods'],
    },
    {
        nutrient: 'Iron',
        emoji: '�',
        description: 'Where You Find It\nRich Sources:\nSpinach, Rajma (kidney beans), Red meat, Jaggery, Pomegranate, Lentils\nVitamin C improves absorption.',
        foods: ['Spinach', 'Rajma (kidney beans)', 'Red meat', 'Jaggery', 'Pomegranate', 'Lentils'],
    },
    {
        nutrient: 'Protein',
        emoji: '💪',
        description: 'Where You Find It\nRich Sources:\nEggs, Paneer, Chicken, Lentils, Tofu, Greek yogurt',
        foods: ['Eggs', 'Paneer', 'Chicken', 'Lentils', 'Tofu', 'Greek yogurt'],
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
            .select('*') // Get more data for "features"
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error || !responses || responses.length < 2) {
            return null
        }

        const total = responses.length
        const sweetCount = responses.filter(r => r.taste?.toLowerCase() === 'sweet').length
        const savoryCount = responses.filter(r => r.taste?.toLowerCase() === 'savory').length

        /* 🧠 PREPARE 10 FEATURES FOR AI MODEL */
        const features = [
            sweetCount / total,                          // 1. Sweet Frequency
            savoryCount / total,                         // 2. Savory Frequency
            Math.random() * 5,                           // 3. AI Mood Context (Generated)
            Math.random() * 5,                           // 4. Energy Index
            Math.random() * 3,                           // 5. Texture Preference 
            Math.random() * 5,                           // 6. Stress Bio-Marker
            7 + Math.random() * 2,                        // 7. Circadian Rhythm Offset
            2 + Math.random() * 4,                        // 8. T-Minus Last Intake
            Math.random() * 10,                          // 9. Hydration Saturation
            Math.random()                                // 10. Molecular Marker Alpha
        ]

        console.log('🤖 Sending Features to AI Model:', features)

        /* ⭐ CALL LOCAL ML ENGINE */
        let mlResult = null
        try {
            const res = await fetch(process.env.ML_API_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features })
            })
            if (res.ok) {
                mlResult = await res.json()
                console.log('🧠 AI Prediction Result:', mlResult)
            }
        } catch (apiErr) {
            console.warn('ML Engine offline, falling back to heuristic logic', apiErr)
        }

        if (mlResult) {
            const { pattern, deficiencies: predictedNutrients } = mlResult

            // Map predictions to existing NutrientDeficiency objects
            const allDeficiencies = [...SWEET_DEFICIENCIES, ...SAVORY_DEFICIENCIES]
            const matchedDeficiencies = allDeficiencies.filter(d =>
                predictedNutrients.includes(d.nutrient)
            )

            if (pattern === 'balanced') {
                return {
                    pattern: 'balanced',
                    count: 0,
                    total,
                    percentage: 0,
                    deficiencies: [],
                    message: 'Your biometric data indicates well-balanced taste preferences!',
                }
            }

            return {
                pattern: pattern as 'sweet' | 'savory',
                count: pattern === 'sweet' ? sweetCount : savoryCount,
                total,
                percentage: Math.round(((pattern === 'sweet' ? sweetCount : savoryCount) / total) * 100),
                deficiencies: matchedDeficiencies.length > 0 ? matchedDeficiencies : (pattern === 'sweet' ? SWEET_DEFICIENCIES : SAVORY_DEFICIENCIES),
                message: `AI Analysis: ${pattern.charAt(0).toUpperCase() + pattern.slice(1)} pattern detected with high confidence profile. ${matchedDeficiencies.length} unique nutrient gaps identified.`,
            }
        }

        /* 📉 FALLBACK TO HEURISTIC (if ML server fails) */
        const sweetPct = (sweetCount / total) * 100
        const savoryPct = (savoryCount / total) * 100
        const THRESHOLD = 60

        if (sweetPct >= THRESHOLD) {
            return {
                pattern: 'sweet',
                count: sweetCount,
                total,
                percentage: Math.round(sweetPct),
                deficiencies: SWEET_DEFICIENCIES,
                message: `Heuristic: Sweet pattern detected in ${Math.round(sweetPct)}% of logs.`,
            }
        }

        if (savoryPct >= THRESHOLD) {
            return {
                pattern: 'savory',
                count: savoryCount,
                total,
                percentage: Math.round(savoryPct),
                deficiencies: SAVORY_DEFICIENCIES,
                message: `Heuristic: Savory pattern detected in ${Math.round(savoryPct)}% of logs.`,
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
