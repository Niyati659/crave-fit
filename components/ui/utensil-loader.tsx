'use client'

import React from 'react'
import { Utensils, UtensilsCrossed } from 'lucide-react'

interface UtensilLoaderProps {
    message?: string
    subMessage?: string
    className?: string
}

export function UtensilLoader({
    message = "Setting the table...",
    subMessage = "Prepping your fresh insights",
    className = ""
}: UtensilLoaderProps) {
    return (
        <div className={`flex flex-col items-center gap-6 ${className}`}>
            <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse-soft" />
                <div className="relative flex gap-4">
                    <div className="animate-clink-fork">
                        <Utensils className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" strokeWidth={1} />
                    </div>
                    <div className="animate-clink-spoon">
                        <UtensilsCrossed className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] scale-x-[-1]" strokeWidth={1} />
                    </div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-xl font-bold text-primary animate-pulse tracking-[0.2em] uppercase">{message}</p>
                {subMessage && (
                    <p className="text-xs text-primary/40 font-medium uppercase tracking-[0.1em]">{subMessage}</p>
                )}
            </div>
        </div>
    )
}
