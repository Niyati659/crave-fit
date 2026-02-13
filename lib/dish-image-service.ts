/**
 * dish-image-service.ts
 * ─────────────────────
 * Resolves a food query to an image URL.
 *
 * Strategy:
 *   1. Normalise the query  (e.g. "CHAIIIIIII" → "chai")
 *   2. Search Supabase Storage (bucket: dish-images) for a matching
 *      folder or file (exact → fuzzy word match)
 *   3. If nothing is found, fall back to the Pexels API
 *      and auto-upload the result for future look-ups.
 *
 * Usage:
 *   import { getDishImage } from '@/lib/dish-image-service'
 *   const result = await getDishImage('Biryani')
 *   // → { url: 'https://…', fileName: 'biryani-12345.jpg', source: 'supabase' | 'pexels' }
 */

import { supabase } from './supabase'

// ── Config ─────────────────────────────────────────────────────────────

const BUCKET_NAME = 'dish-images'
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY ?? ''

// Session-level in-memory cache to avoid redundant lookups
const imageCache = new Map<string, DishImageResult>()

// ── Types ──────────────────────────────────────────────────────────────

export interface DishImageResult {
    url: string
    fileName: string
    source: 'supabase' | 'pexels'
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Normalise a raw user query into a canonical key.
 *   • lowercase
 *   • trimmed
 *   • repeated chars collapsed  ("chaiiiiiii" → "chai")
 *   • spaces → underscores
 */
export function normalizeQuery(query: string): string {
    return query
        .toLowerCase()
        .trim()
        .replace(/(.)\1{2,}/g, '$1') // collapse 3+ repeated chars
        .replace(/\s+/g, '_')
}

// ── Supabase look-up ──────────────────────────────────────────────────

async function searchSupabase(rawQuery: string): Promise<{ url: string; fileName: string } | null> {
    const query = normalizeQuery(rawQuery)

    const { data: rootItems, error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1000 })

    if (storageError) {
        console.error('Supabase storage list error:', storageError)
        return null
    }

    if (!rootItems || rootItems.length === 0) return null

    // Inner matcher — checks folders then root-level files
    const findImage = async (
        items: typeof rootItems,
        term: string
    ): Promise<string | null> => {
        const cleanTerm = term.replace(/_/g, '').toLowerCase()

        // 1️⃣  Folder match
        const folderMatch = items.find(
            (item) =>
                !item.id &&
                (item.name.toLowerCase() === term ||
                    item.name.toLowerCase().replace(/_/g, '') === cleanTerm ||
                    item.name.toLowerCase().includes(cleanTerm))
        )

        if (folderMatch) {
            const { data: subFiles } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folderMatch.name, { limit: 10 })

            const img = subFiles?.find((f) =>
                f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)
            )
            if (img) return `${folderMatch.name}/${img.name}`
        }

        // 2️⃣  Root-file match
        const fileMatch = items.find(
            (item) =>
                item.id &&
                (item.name.toLowerCase().includes(term) ||
                    item.name.toLowerCase().includes(cleanTerm))
        )
        if (fileMatch) return fileMatch.name

        return null
    }

    // Priority 1 — full normalised term
    let fileName = await findImage(rootItems, query)

    // Priority 2 — fuzzy word-level fallback
    if (!fileName && query.includes('_')) {
        const words = query.split('_').filter((w) => w.length > 2)
        for (const word of words) {
            fileName = await findImage(rootItems, word)
            if (fileName) break
        }
    }

    if (!fileName) return null

    const {
        data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

    return { url: publicUrl, fileName }
}

// ── Pexels fallback ───────────────────────────────────────────────────

async function fetchFromPexels(
    rawQuery: string
): Promise<{ url: string; fileName: string }> {
    const pexelsSearchQuery = `food ${rawQuery}`
    const normalizedName = normalizeQuery(rawQuery)

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            pexelsSearchQuery
        )}&per_page=1`,
        { headers: { Authorization: PEXELS_API_KEY } }
    )

    const data = await response.json()

    if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0]
        return {
            url: photo.src.large2x,
            fileName: `${normalizedName}-${photo.id}.jpg`,
        }
    }

    throw new Error('No images found on Pexels.')
}

/**
 * Upload an image blob to Supabase Storage so future queries
 * hit the cache instead of Pexels.
 */
async function uploadToSupabase(
    fileName: string,
    imageUrl: string
): Promise<void> {
    try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
    } catch (err) {
        console.error('Auto-upload to Supabase failed:', err)
    }
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Resolve a food query to an image URL.
 *
 * @param rawQuery – the food search text (e.g. "Biryani")
 * @returns `{ url, fileName, source }` or `null` if nothing found
 */
export async function getDishImage(
    rawQuery: string
): Promise<DishImageResult | null> {
    if (!rawQuery || !rawQuery.trim()) return null

    const cacheKey = normalizeQuery(rawQuery)

    // Check session cache first
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey)!
    }

    try {
        // 1. Try Supabase first
        const supabaseResult = await searchSupabase(rawQuery)
        if (supabaseResult) {
            const result: DishImageResult = { ...supabaseResult, source: 'supabase' }
            imageCache.set(cacheKey, result)
            return result
        }

        // 2. Fall back to Pexels
        if (!PEXELS_API_KEY) {
            console.warn('No Pexels API key configured — skipping fallback')
            return null
        }

        const pexelsResult = await fetchFromPexels(rawQuery.trim())

        // 3. Auto-cache the Pexels image in Supabase for next time (fire-and-forget)
        uploadToSupabase(pexelsResult.fileName, pexelsResult.url)

        const result: DishImageResult = { ...pexelsResult, source: 'pexels' }
        imageCache.set(cacheKey, result)
        return result
    } catch (err) {
        console.error('getDishImage error:', err)
        return null
    }
}

/**
 * Resolve images for an array of recipe titles in parallel.
 * Returns a Map of title → image URL.
 */
export async function resolveRecipeImages(
    titles: string[]
): Promise<Map<string, string>> {
    const results = new Map<string, string>()

    const settled = await Promise.allSettled(
        titles.map(async (title) => {
            const img = await getDishImage(title)
            if (img) results.set(title, img.url)
        })
    )

    return results
}
