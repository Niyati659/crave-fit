'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Utensils, Heart, Leaf } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        throw new Error('Please enter email and password')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/?view=dashboard')
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/3 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Utensils className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">CraveFit</h1>
              <p className="text-xs text-primary font-semibold">Smart Eating</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Log in to your account and start tracking your meals</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 border border-border/30 shadow-sm space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg border border-border/50 bg-background placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-foreground">Password</Label>
                <Link href="/auth/forgot-password" title="Reset your password" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-lg border border-border/50 bg-background placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">New to CraveFit?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link href="/auth/sign-up">
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 font-bold rounded-lg transition-all bg-transparent"
            >
              Create Free Account
            </Button>
          </Link>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Track Meals</p>
          </div>
          <div className="p-3">
            <Leaf className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Health Focus</p>
          </div>
          <div className="p-3">
            <Utensils className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Food Discovery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
