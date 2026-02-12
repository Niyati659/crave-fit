
export interface Insight {
    text: string;
    type: 'motivational' | 'educational' | 'alert' | 'behavioral';
    category: 'hydration' | 'macros' | 'streak' | 'goals' | 'habits';
}

export interface DualInsights {
    personal: Insight[];
    general: Insight[];
}

export function generateInsights(userData: any, weeklyData: any[], waterData: any[], allMeals: any[] = []): DualInsights {
    const personal: Insight[] = [];

    // --- 1. Streak & Consistency ---
    const trackedDays = weeklyData.filter(d => d.calories > 0).length;
    if (trackedDays >= 5) {
        personal.push({
            text: `🔥 Consistency is King! You've tracked your meals for ${trackedDays} days this week. Keep it up!`,
            type: 'motivational',
            category: 'streak'
        });
    } else if (trackedDays >= 3) {
        personal.push({
            text: `🚀 Great momentum! You're building a healthy habit by tracking ${trackedDays} days this week.`,
            type: 'motivational',
            category: 'streak'
        });
    }

    // --- 2. Behavioral Analysis (Phase 4) ---
    if (allMeals.length > 0) {
        // A. Favorite Dish Detection
        const dishCounts: Record<string, number> = {};
        allMeals.forEach(m => {
            const name = m.name?.toLowerCase().trim() || 'unknown dish';
            dishCounts[name] = (dishCounts[name] || 0) + 1;
        });
        const topDish = Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0];
        if (topDish && topDish[1] >= 2) {
            personal.push({
                text: `🍛 You really love "${topDish[0]}"! It's your most frequent dish this week.`,
                type: 'behavioral',
                category: 'habits'
            });
        }

        // B. Macro Persona
        const totalProtein = allMeals.reduce((s, m) => s + (m.protein || 0), 0);
        const totalCarbs = allMeals.reduce((s, m) => s + (m.carbs || 0), 0);
        const totalFat = allMeals.reduce((s, m) => s + (m.fat || 0), 0);
        const totalMacros = totalProtein + totalCarbs + totalFat;

        if (totalMacros > 0) {
            const carbRatio = totalCarbs / totalMacros;
            const proteinRatio = totalProtein / totalMacros;
            if (carbRatio > 0.5) {
                personal.push({
                    text: "🍞 You're a Carb Connoisseur! Energy levels must be high this week.",
                    type: 'behavioral',
                    category: 'macros'
                });
            } else if (proteinRatio > 0.35) {
                personal.push({
                    text: "🍗 Protein Powerhouse alert! Your muscle recovery is in good hands.",
                    type: 'behavioral',
                    category: 'macros'
                });
            }
        }

        // C. Timing Habits
        const times = allMeals.map(m => parseInt(m.time?.split(':')[0] || '12'));
        const lateNightCount = times.filter(t => t >= 21 || t <= 4).length;
        const earlyBirdCount = times.filter(t => t >= 5 && t <= 9).length;

        if (lateNightCount >= 3) {
            personal.push({
                text: "🌙 Found a Midnight Snacker! Late-night fuel can be tricky for sleep quality.",
                type: 'behavioral',
                category: 'habits'
            });
        } else if (earlyBirdCount >= 4) {
            personal.push({
                text: "☀️ Early Bird detected! Starting your day with consistent fuel is a pro move.",
                type: 'behavioral',
                category: 'habits'
            });
        }
    }

    // --- 3. Weight Goal Progress ---
    if (userData?.weight && userData?.target_weight) {
        const current = parseFloat(userData.weight);
        const target = parseFloat(userData.target_weight);
        const diff = Math.abs(current - target).toFixed(1);

        if (parseFloat(diff) > 0.1) {
            personal.push({
                text: `📉 You're ${diff}kg away from your target. Every healthy meal brings you closer!`,
                type: 'motivational',
                category: 'goals'
            });
        }
    }

    // --- 4. Hydration Analysis ---
    const avgWater = waterData.length > 0
        ? waterData.reduce((sum, d) => sum + d.ml, 0) / (waterData.filter(d => d.ml > 0).length || 1)
        : 0;

    if (avgWater > 0 && avgWater < 2000) {
        personal.push({
            text: "💧 You're averaging slightly less than 2L of water per day. Try adding one more glass today!",
            type: 'educational',
            category: 'hydration'
        });
    } else if (avgWater >= 2000) {
        personal.push({
            text: "✨ Exceptional hydration! Your water intake is perfectly on track for peak performance.",
            type: 'motivational',
            category: 'hydration'
        });
    }

    // --- 5. General Wisdom ---
    const general: Insight[] = [
        { text: "🥗 Pro Tip: Eating protein at breakfast can reduce cravings by 60% throughout the day.", type: 'educational', category: 'macros' },
        { text: "😴 Research shows getting 7-9 hours of sleep helps regulate your hunger hormones.", type: 'educational', category: 'goals' },
        { text: "🏃 A quick 10-minute walk after meals can help balance your blood sugar.", type: 'educational', category: 'goals' },
        { text: "🍎 High-fiber foods like apples and broccoli keep you full longer and support digestion.", type: 'educational', category: 'macros' },
        { text: "🥤 Sugary drinks can add 500+ calories to your daily intake without filling you up.", type: 'educational', category: 'macros' },
        { text: "🧘 Mindful eating can reduce overeating by up to 30%.", type: 'educational', category: 'goals' }
    ];

    return { personal, general };
}
