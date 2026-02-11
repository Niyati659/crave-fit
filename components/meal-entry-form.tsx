'use client'

import React, { useState } from "react"
import { Button } from '@/components/ui/button'
import type { MealEntry } from '@/lib/meal-tracking'
import { MEAL_SUGGESTIONS } from '@/lib/meal-tracking' // 🔥 ADD
import { fetchNutrition } from '@/lib/nutrition-api'
import { detectFoodFromImage } from '@/lib/food-detection'

interface MealEntryFormProps {
  onSave: (meal: Omit<MealEntry, 'id'>) => void
  onCancel: () => void
}

export function MealEntryForm({ onSave, onCancel }: MealEntryFormProps) {

  const [mode, setMode] = useState<
    "manual" | "macro" | "photo" | "quick"
  >("manual")


  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  // 🔹 EXISTING FORM STATE (UNCHANGED)
  const [formData, setFormData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    time: new Date()
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      .slice(0, 5),
  })

  // 🔥 UPDATED SUBMIT HANDLER (EXTENDED — NOT REPLACED)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🥗 Manual Mode
    if (mode === "manual") {
      if (!formData.name.trim()) {
        alert("Enter meal description")
        return
      }

      try {
        const nutrition = await fetchNutrition(formData.name)

        onSave({
          ...formData,
          ...nutrition,
        })
      } catch {
        alert("Nutrition fetch failed")

        onSave({
          ...formData,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        })
      }
    }


    // 🧮 Macro Mode (Your original logic)
    if (mode === "macro") {
      if (!formData.name.trim()) {
        alert('Please enter a meal name')
        return
      }

      onSave({
        name: formData.name,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        fiber: Number(formData.fiber),
        time: formData.time,
      })
    }

    // 📸 Photo Mode

    if (mode === "photo") {
      if (!photoFile) {
        alert("Upload a meal photo")
        return
      }

      try {
        setPhotoLoading(true)

        // 1️⃣ Detect food from image
        const detectedFood = await detectFoodFromImage(photoFile)

        // 2️⃣ Fetch nutrition using detected label
        const nutrition = await fetchNutrition(detectedFood)

        // 3️⃣ Create image preview
        const imageUrl = URL.createObjectURL(photoFile)

        // 4️⃣ Save meal
        onSave({
          name: "Photo Meal",
          detectedFood,
          imageUrl,
          time: formData.time,
          ...nutrition,
        })

      } catch (err) {
        console.error(err)
        alert("Food detection failed")
      } finally {
        setPhotoLoading(false)
      }
    }


    // Reset
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      time: new Date()
        .toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        .slice(0, 5),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 🔥 MODE SWITCHER (NEW) */}
      <div className="grid grid-cols-4 gap-2">
        <Button type="button" variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")}>Manual</Button>
        <Button type="button" variant={mode === "macro" ? "default" : "outline"} onClick={() => setMode("macro")}>Macros</Button>
        <Button type="button" variant={mode === "photo" ? "default" : "outline"} onClick={() => setMode("photo")}>Photo</Button>
        <Button type="button" variant={mode === "quick" ? "default" : "outline"} onClick={() => setMode("quick")}>Quick</Button>
      </div>

      {/* 🥗 MANUAL MODE (NEW) */}
      {mode === "manual" && (
        <div>
          <label className="block text-sm font-semibold mb-2">
            Meal Description
          </label>
          <textarea
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Example: 1 roti + 2 dal + salad"
            className="w-full border p-3 rounded-lg"
          />
        </div>
      )}

      {/* 📸 PHOTO MODE (NEW) */}
      {mode === "photo" && (
        <div className="space-y-4">

          <label className="block text-sm font-semibold">
            Upload Meal Photo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setPhotoFile(e.target.files[0])
              }
            }}
          />

          {/* Image Preview */}
          {photoFile && (
            <img
              src={URL.createObjectURL(photoFile)}
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}

          {/* 🔥 LOADING TEXT — STEP 3 */}
          {photoLoading && (
            <p className="text-sm text-muted-foreground">
              Detecting food & fetching nutrition...
            </p>
          )}

        </div>
      )}


      {/* ⚡ QUICK ADD MODE (NEW) */}
      {mode === "quick" && (
        <div className="grid grid-cols-2 gap-3">
          {MEAL_SUGGESTIONS.quick.map((meal) => (
            <div
              key={meal.id}
              onClick={() => onSave(meal)}
              className="border rounded-lg p-3 cursor-pointer hover:bg-muted"
            >
              {meal.name}
            </div>
          ))}
        </div>
      )}

      {/* 🧮 MACRO MODE (YOUR ORIGINAL FORM — UNTOUCHED) */}
      {mode === "macro" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Meal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Grilled Chicken with Rice"
                className="w-full px-4 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* MACROS GRID — UNCHANGED */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Calories", key: "calories" },
              { label: "Protein (g)", key: "protein" },
              { label: "Carbs (g)", key: "carbs" },
              { label: "Fat (g)", key: "fat" },
              { label: "Fiber (g)", key: "fiber" },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
                  {item.label}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData[item.key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [item.key]: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* SUBMIT BUTTONS — UNCHANGED */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Add Meal
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-transparent"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
