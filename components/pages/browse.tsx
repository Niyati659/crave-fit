"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodCard } from "@/components/food-card";
import { FoodDetailModal } from "@/components/food-detail-modal";
import { Search } from "lucide-react";
import type { Food } from "@/lib/typefood";
import { UtensilLoader } from "@/components/ui/utensil-loader";
import { getDishImage } from "@/lib/dish-image-service";

function EmptyState() {
  return (
    <div className="text-center py-24 space-y-4">
      <div className="text-5xl">🍽️</div>
      <h3 className="text-xl font-semibold">Search for something delicious</h3>
      <p className="text-muted-foreground">
        Use the search bar above to explore healthier food options.
      </p>
    </div>
  );
}

function NoResults() {
  return (
    <div className="text-center py-24 space-y-4">
      <div className="text-4xl">🤔</div>
      <h3 className="text-lg font-semibold">No results found</h3>
      <p className="text-muted-foreground">
        Try adjusting your filters or searching for something else.
      </p>
    </div>
  );
}

interface BrowseScreenProps {
  onBack: () => void;
}

export function BrowseScreen({ onBack }: BrowseScreenProps) {
  const [cuisine, setCuisine] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [activeDiet, setActiveDiet] = useState<string | null>(null);

  const cuisineOptions = [
    { label: "All", value: "all" },
    { label: "Indian", value: "Indian Subcontinent" },
    { label: "Japanese", value: "Japanese" },
    { label: "Chinese & Mongolian", value: "Chinese and Mongolian" },
    { label: "Mexican", value: "Mexican" },
    { label: "Italian", value: "Italian" },
  ];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const handleSearch = async () => {
    setHasSearched(true);
    setIsLoading(true);
    setActiveDiet(null); // reset filters on new search

    try {
      const params = new URLSearchParams({
        query,
        cuisine,
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      const foods: Food[] = data.success ? data.data : [];
      setResults(foods);

      // 🖼 Resolve images in parallel after results render
      if (foods.length > 0) {
        Promise.allSettled(
          foods.map(async (food) => {
            try {
              const img = await getDishImage(food.name);
              if (img) {
                setResults((prev) =>
                  prev.map((f) =>
                    f.recipe_id === food.recipe_id
                      ? { ...f, image: img.url }
                      : f
                  )
                );
              }
            } catch { /* skip */ }
          })
        );
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Client-side diet filtering
  const filteredResults = activeDiet
    ? results.filter((food) => food.dietType === activeDiet)
    : results;

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
Browse Foods</h1>
          <p className="text-muted-foreground">
            Search for healthy cravings or explore quick options.
          </p>
        </div>

        {/* Cuisine Filter */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Cuisine</label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-background text-foreground px-3 text-sm"

          >
            {cuisineOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for healthy pizza, high protein dinner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <Button onClick={handleSearch} size="lg">
            Search
          </Button>
        </div>

        {/* Results */}
        {!hasSearched ? (
          <EmptyState />
        ) : isLoading ? (
          <div className="py-24 flex justify-center">
            <UtensilLoader
              message="Cooking up something tasty..."
              subMessage="Fetching your recipes"
            />
          </div>
        ) : results.length === 0 ? (
          <NoResults />
        ) : (
          <>
            {/* Diet Toggle Filters */}
            <div className="flex flex-wrap gap-3 pb-4">
              {[
                "All",
                "Vegan",
                "Vegetarian",
                "Pescetarian",
                "Non-Vegetarian",
              ].map((type) => {
                const isActive =
                  (type === "All" && activeDiet === null) ||
                  activeDiet === type;

                return (
                  <button
                    key={type}
                    onClick={() => setActiveDiet(type === "All" ? null : type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Filtered Results Grid */}
            {filteredResults.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No recipes match this diet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((food) => (
                  <FoodCard
                    key={food.recipe_id}
                    food={food}
                    onClick={() => setSelectedFood(food)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <FoodDetailModal
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
}
