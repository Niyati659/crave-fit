'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { MealEntry } from '@/lib/meal-tracking'

interface MealEntryFormProps {
  onSave: (meal: Omit<MealEntry, 'id'>) => void
  onCancel: () => void
}

export function MealEntryForm({ onSave, onCancel }: MealEntryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Meal Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Grilled Chicken with Rice"
            className="w-full px-4 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
            Calories
          </label>
          <input
            type="number"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
            Protein (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.protein}
            onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
            Carbs (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.carbs}
            onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
            Fat (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.fat}
            onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">
            Fiber (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.fiber}
            onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

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
