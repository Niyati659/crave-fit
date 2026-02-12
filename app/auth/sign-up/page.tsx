'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Utensils, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!name || !email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })

      if (error) throw error

      router.push('/auth/sign-up-success')
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!password) return { level: 0, color: 'bg-gray-200', text: '' }
    if (password.length < 6) return { level: 1, color: 'bg-red-400', text: 'Weak' }
    if (password.length < 10) return { level: 2, color: 'bg-yellow-400', text: 'Fair' }
    return { level: 3, color: 'bg-green-400', text: 'Strong' }
  }

  const strength = passwordStrength()

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
          <h2 className="text-3xl font-bold text-foreground mb-2">Join CraveFit</h2>
          <p className="text-muted-foreground">Start your health journey with personalized meal tracking</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl p-8 border border-border/30 shadow-sm space-y-6">
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border border-border/50 bg-background placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
            </div>

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
              <Label htmlFor="password" className="font-semibold text-foreground">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-lg border border-border/50 bg-background placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
              {password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all`}
                      style={{ width: `${(strength.level / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{strength.text}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="font-semibold text-foreground">Confirm Password</Label>
              <Input
                id="repeat-password"
                type="password"
                placeholder="••••••••"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-12 rounded-lg border border-border/50 bg-background placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
              {repeatPassword && password === repeatPassword && (
                <div className="flex items-center gap-2 pt-1 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-semibold">Passwords match</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </div>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password || password !== repeatPassword}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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
              <span className="px-2 bg-white text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 font-bold rounded-lg transition-all bg-transparent"
            >
              Log In Instead
            </Button>
          </Link>
        </div>

        {/* Password Requirements */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-3">Password Requirements:</p>
          <ul className="space-y-2 text-xs text-blue-800">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              At least 6 characters
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Mix of uppercase and lowercase
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Numbers and special characters recommended
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
