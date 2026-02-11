'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FoodCard } from '@/components/food-card'
import { FoodDetailModal } from '@/components/food-detail-modal'
import { Search } from 'lucide-react'
import type { Food } from '@/lib/mock-foods'

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-primary text-white'
          : 'bg-muted text-muted-foreground hover:bg-muted/70'
      }`}
    >
      {label}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24 space-y-4">
      <div className="text-5xl">🍽️</div>
      <h3 className="text-xl font-semibold">
        Search for something delicious
      </h3>
      <p className="text-muted-foreground">
        Use the search bar above to explore healthier food options.
      </p>
    </div>
  )
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
  )
}

interface BrowseScreenProps {
  onBack: () => void
}

export function BrowseScreen({ onBack }: BrowseScreenProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)

  const [filters, setFilters] = useState({
    highProtein: false,
    under500: false,
    vegetarian: false,
    lowCarb: false,
  })

  const handleSearch = async () => {
    if (!query.trim()) return

    setHasSearched(true)

    // TODO: Replace with backend call
    console.log('Searching for:', query, filters)

    setResults([]) // temporary
  }

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Browse Foods</h1>
          <p className="text-muted-foreground">
            Search for healthy cravings or explore quick options.
          </p>
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
                if (e.key === 'Enter') handleSearch()
              }}
            />
          </div>
          <Button onClick={handleSearch} size="lg">
            Search
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <FilterChip
            label="High Protein"
            active={filters.highProtein}
            onClick={() => toggleFilter('highProtein')}
          />
          <FilterChip
            label="Under 500 kcal"
            active={filters.under500}
            onClick={() => toggleFilter('under500')}
          />
          <FilterChip
            label="Vegetarian"
            active={filters.vegetarian}
            onClick={() => toggleFilter('vegetarian')}
          />
          <FilterChip
            label="Low Carb"
            active={filters.lowCarb}
            onClick={() => toggleFilter('lowCarb')}
          />
        </div>

        {/* Results */}
        {!hasSearched ? (
          <EmptyState />
        ) : results.length === 0 ? (
          <NoResults />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onClick={() => setSelectedFood(food)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <FoodDetailModal
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  )
}
