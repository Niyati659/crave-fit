"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Food } from "@/lib/typefood";
import { ExternalLink, Plus } from "lucide-react";
import { SwapCard } from "./swapcard";
import Image from "next/image";
import { supabase } from "@/lib/supabase"
import { useState } from "react"


interface FoodDetailModalProps {
  food: Food | null;
  onClose: () => void;
  matchScore?: number;
  whyMatched?: string;
}

function getHealthLabel(score: number) {
  if (score >= 75) return "Very Healthy";
  if (score >= 50) return "Balanced";
  return "Indulgent";
}

export function FoodDetailModal({
  food,
  onClose,
  matchScore,
  whyMatched,
}: FoodDetailModalProps) {
  const [adding, setAdding] = useState(false)

  if (!food) return null

  const zomatoSearchUrl = `https://www.zomato.com/search?q=${encodeURIComponent(
    food.recipe_name
  )}`

  const handleAddToTracker = async () => {
    try {
      setAdding(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please login to add meals.")
        return
      }

      const selectedDate = new Date().toISOString().split("T")[0]
      const time = new Date().toTimeString().slice(0, 5)

      const { error } = await supabase.from("meals").insert([
        {
          user_id: user.id,
          name: food.recipe_name,
          detected_food: food.recipe_name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs ?? 0,
          fat: food.fat ?? 0,
          fiber: 0,
          image_url: food.image || null,
          time,
          date: selectedDate,
        },
      ])

      if (error) {
        console.error("Insert error:", error)
        alert("Failed to add meal.")
        return
      }

      alert("Meal added successfully!")
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }


  return (
    <Dialog open={!!food} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">


        {/* IMAGE + OVERLAY */}
        {food.image && (
  <div className="relative w-full h-64 rounded-2xl overflow-hidden">
    <Image
      src={food.image}
      alt={food.recipe_name}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 800px"
    />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/40" />
<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />


            {/* Floating Tags */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {food.region && (
                <span className="px-3 py-1 text-xs font-medium bg-white/20 text-white backdrop-blur-md rounded-full">
                  {food.region}
                </span>
              )}
              {food.dietType && (
                <span className="px-3 py-1 text-xs font-medium bg-white/20 text-white backdrop-blur-md rounded-full">
                  {food.dietType}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-medium bg-emerald-500/80 text-white rounded-full">
                {getHealthLabel(food.healthScore)}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">

          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              {food.recipe_name}
              {matchScore !== undefined && (
                <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {Math.round(matchScore)}% Match
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Nutrition Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <MacroCard
              label="Calories"
              value={food.calories}
              unit=""
              bg="bg-amber-50"
              text="text-amber-600"
            />
            <MacroCard
              label="Protein"
              value={food.protein}
              unit="g"
              bg="bg-blue-50"
              text="text-blue-600"
            />
            <MacroCard
              label="Carbs"
              value={food.carbs ?? "-"}
              unit="g"
              bg="bg-purple-50"
              text="text-purple-600"
            />
            <MacroCard
              label="Fat"
              value={food.fat ?? "-"}
              unit="g"
              bg="bg-rose-50"
              text="text-rose-600"
            />
          </div>

          {/* ACTION ROW */}
<div className="flex flex-col sm:flex-row gap-3">

  {/* Add to Meal Tracker */}
  <Button
    onClick={handleAddToTracker}
    disabled={adding}
    className="flex-1 flex items-center justify-center gap-2"
  >
    <Plus className="w-4 h-4" />
    {adding ? "Adding..." : "Add to Meal Tracker"}
  </Button>

  {/* Zomato */}
  <Button
    asChild
    variant="outline"
    className="flex-1 flex items-center justify-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
  >
    <a
      href={zomatoSearchUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Order on Zomato
      <ExternalLink className="w-4 h-4" />
    </a>
  </Button>
</div>


          {/* Why Matched */}
          {whyMatched && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-foreground">
                {whyMatched}
              </p>
            </div>
          )}

          {/* Swap Section */}
          {food.healthierRecipe && (
            <SwapCard originalFood={food} />
          )}

          {/* Close */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MacroCard({
  label,
  value,
  unit,
  bg,
  text,
}: {
  label: string;
  value: string | number;
  unit: string;
  bg: string;
  text: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 text-center shadow-sm`}>
   
      
      <p className={`text-3xl font-bold ${text}`}>
  {value}{unit}
</p>
<p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
  {label}
</p>

    </div>
  );
}


