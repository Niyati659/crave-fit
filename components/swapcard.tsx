import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Food } from "@/lib/typefood";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

export function SwapCard({ originalFood }: { originalFood: Food }) {
  const [expanded, setExpanded] = useState(false);
  const swap = originalFood.healthierRecipe;
  if (!swap) return null;

  const caloriesSaved = originalFood.calories - swap.calories;

  return (
    <div className="border-t border-border pt-6 space-y-4">
      <h3 className="text-lg font-bold">
        How about replacing it with something healthier?
      </h3>

      <div
        className="bg-green-50 border border-green-200 rounded-xl p-5 cursor-pointer transition hover:shadow-md"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-green-900">{swap.name}</h4>
            <p className="text-sm text-green-700">Save {caloriesSaved} kcal</p>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-green-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-green-700" />
          )}
        </div>

        {/* Collapsed Preview Nutrition */}
        <div className="grid grid-cols-4 gap-4 text-center mt-4">
          <Stat label="Calories" value={swap.calories} />
          <Stat label="Protein" value={`${swap.protein}g`} />
          <Stat label="Carbs" value={`${swap.carbs ?? "-"}g`} />
          <Stat label="Fat" value={`${swap.fat ?? "-"}g`} />
        </div>

        {/* Expanded Section */}
        {expanded && (
          <div className="mt-6 space-y-5 border-t border-green-200 pt-5">
            {/* Ingredients */}
            {swap.ingredients && (
              <div className="space-y-2">
                <h5 className="font-semibold text-green-900">Ingredients</h5>
                <ul className="space-y-1 text-sm text-green-800">
                  {swap.ingredients.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {swap.instructions && (
              <div className="space-y-2">
                <h5 className="font-semibold text-green-900">How to Make</h5>
                <ol className="space-y-2 text-sm text-green-800 list-decimal list-inside">
                  {swap.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Optional CTA */}
            <div className="pt-3">
              <button className="text-sm font-semibold text-green-900 underline">
                I’ll choose this instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
