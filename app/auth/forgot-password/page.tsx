'use client'

import React from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Mail, Utensils, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            })

            if (error) throw error
            setIsSubmitted(true)
        } catch (error: any) {
            setError(error.message || 'An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/3 flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Check your email</h2>
                    <p className="text-muted-foreground mb-8">
                        We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                    </p>
                    <Link href="/auth/login">
                        <Button className="w-full h-12 font-bold rounded-lg">
                            Return to Login
                        </Button>
                    </Link>
                </div>
            </div>
        )
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
                    <h2 className="text-3xl font-bold text-foreground mb-2">Reset Password</h2>
                    <p className="text-muted-foreground">Enter your email and we'll send you a recovery link</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl p-8 border border-border/30 shadow-sm space-y-6">
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold text-foreground">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-11 rounded-lg border border-border/50 bg-background focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-900">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 font-bold rounded-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
                        </Button>
                    </form>

                    <div className="text-center">
                        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
