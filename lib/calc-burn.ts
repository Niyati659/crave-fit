/**
 * Calculates the time in minutes needed to burn a specific amount of calories
 * based on the MET (Metabolic Equivalent of Task) and body weight.
 * 
 * Formula: Calories = Time (min) * MET * Weight (kg) / 200
 * Therefore: Time (min) = (Calories * 200) / (MET * Weight)
 * 
 * @param caloriesToBurn - The amount of calories to burn
 * @param weightKg - The user's weight in kilograms
 * @param met - The MET value for the activity (default 3.5 for brisk walking)
 * @returns The time in minutes
 */
export function calculateExerciseTime(caloriesToBurn: number, weightKg: number, met: number = 3.5): number {
    if (weightKg <= 0 || caloriesToBurn <= 0) return 0;

    const timeMinutes = (caloriesToBurn * 200) / (met * weightKg);
    return Math.ceil(timeMinutes);
}
