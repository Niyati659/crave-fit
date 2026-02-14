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
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

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
}: FoodDetailModalProps) {
  const [adding, setAdding] = useState(false);

  if (!food) return null;

  const zomatoSearchUrl = `https://www.zomato.com/search?q=${encodeURIComponent(
    food.name
  )}`;

  const handleAddToTracker = async () => {
    try {
      setAdding(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login to add meals.");
        return;
      }

      const selectedDate = new Date().toISOString().split("T")[0];
      const time = new Date().toTimeString().slice(0, 5);

      const { error } = await supabase.from("meals").insert([
        {
          user_id: user.id,
          name: food.name,
          detected_food: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs ?? 0,
          fat: food.fat ?? 0,
          fiber: 0,
          image_url: food.image || null,
          time,
          date: selectedDate,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Failed to add meal.");
        return;
      }

      alert("Meal added successfully!");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={!!food} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-card text-card-foreground border border-border shadow-xl">

        {/* IMAGE SECTION */}
        {food.image && (
          <div className="relative w-full h-64 overflow-hidden">
            <Image
              src={food.image}
              alt={food.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

            {/* Floating Tags */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {food.region && (
                <span className="px-3 py-1 text-xs font-medium bg-background/70 text-foreground border border-border rounded-full backdrop-blur-sm">
                  {food.region}
                </span>
              )}
              {food.dietType && (
                <span className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                  {food.dietType}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {getHealthLabel(food.healthScore)}
              </span>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              {food.name}
              {matchScore !== undefined && (
                <span className="text-sm font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full">
                  {Math.round(matchScore)}% Match
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Macros */}
         <div className="grid grid-cols-2 gap-4">
  <MacroCard label="Calories" value={food.calories} unit="" accent="amber" />
  <MacroCard label="Protein" value={food.protein} unit="g" accent="blue" />
  <MacroCard label="Carbs" value={food.carbs ?? "-"} unit="g" accent="purple" />
  <MacroCard label="Fat" value={food.fat ?? "-"} unit="g" accent="rose" />
</div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3">

            <Button
              onClick={handleAddToTracker}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {adding ? "Adding..." : "Add to Meal Tracker"}
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
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
  accent,
}: {
  label: string;
  value: string | number;
  unit: string;
  accent: "amber" | "blue" | "purple" | "rose";
}) {
  const accentStyles = {
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <div
      className={`
        rounded-xl 
        p-5 
        text-center 
        border 
        shadow-sm
        transition-all
        duration-300
        ${accentStyles[accent]}
      `}
    >
      <p className="text-3xl font-bold">
        {value}{unit}
      </p>

      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
        {label}
      </p>
    </div>
  );
}
