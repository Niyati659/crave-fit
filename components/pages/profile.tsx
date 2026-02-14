'use client'

import React, { useState, useEffect, useRef } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
    User,
    Scale,
    Ruler,
    Target,
    ArrowLeft,
    Save,
    ChevronRight,
    Utensils,
    Activity,
    UserCircle2,
    Mail,
    Camera,
    Loader2,
    Upload,
    Edit3,
    CheckCircle2,
    ShieldCheck,
    Zap,
    Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ProfileData {
    full_name: string
    email: string
    avatar_url: string
    age: string
    weight: string
    height: string
    gender: string
    goal: string
    other_goal: string
    allergies: string
    goal_timeline: string
    target_weight: string
}

interface ProfileProps {
    onBack: () => void
    onUpdate?: (userId?: string) => void
}

export function Profile({ onBack, onUpdate }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeMetric, setActiveMetric] = useState<string>('weight')
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])


    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState<ProfileData>({
        full_name: '',
        email: '',
        avatar_url: '',
        age: '',
        weight: '',
        height: '',
        gender: '',
        goal: 'healthy',
        other_goal: '',
        allergies: '',
        goal_timeline: '3',
        target_weight: ''
    })

    const fileInputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        async function getProfile() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (error && error.code !== 'PGRST116') throw error

                const initialProfile = {
                    full_name: data?.full_name || session.user.user_metadata?.full_name || '',
                    email: session.user.email || '',
                    avatar_url: data?.avatar_url || '',
                    age: data?.age?.toString() || '',
                    weight: data?.weight?.toString() || '',
                    height: data?.height?.toString() || '',
                    gender: data?.gender || '',
                    goal: data?.goal || 'healthy',
                    other_goal: data?.other_goal || '',
                    allergies: data?.allergies || '',
                    goal_timeline: data?.goal_timeline || '3',
                    target_weight: data?.target_weight?.toString() || ''
                }

                setProfile(initialProfile)

                // Auto-switch to view mode if profile has at least a name
                if (data?.full_name || session.user.user_metadata?.full_name) {
                    setIsEditing(false)
                } else {
                    setIsEditing(true)
                }

            } catch (error: any) {
                toast.error('Error loading profile')
            } finally {
                setLoading(false)
            }
        }

        getProfile()
    }, [])
    useEffect(() => {
        if (profile.allergies) {
            setSelectedAllergies(
                profile.allergies.split(',').map(a => a.trim())
            )
        }
    }, [profile.allergies])

    const toggleAllergy = (item: string) => {
        let updated

        if (selectedAllergies.includes(item)) {
            updated = selectedAllergies.filter(a => a !== item)
        } else {
            updated = [...selectedAllergies, item]
        }

        setSelectedAllergies(updated)

        setProfile(prev => ({
            ...prev,
            allergies: updated.join(', ')
        }))
    }


    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const filePath = `${session.user.id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Persist immediately to database
            const { error: dbError } = await supabase.from('profiles').update({
                avatar_url: publicUrl,
                updated_at: new Date().toISOString()
            }).eq('id', session.user.id)

            if (dbError) throw dbError

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
            if (onUpdate) onUpdate(session.user.id)
            toast.success('Avatar updated and saved!')
        } catch (error: any) {
            console.error('Supabase Avatar Upload Error:', error)
            toast.error('Error uploading avatar: Ensure "avatars" bucket is public.')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No session')

            const { error } = await supabase.from('profiles').upsert({
                id: session.user.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                age: profile.age ? parseInt(profile.age) : null,
                weight: profile.weight ? parseFloat(profile.weight) : null,
                height: profile.height ? parseFloat(profile.height) : null,
                target_weight: profile.target_weight ? parseFloat(profile.target_weight) : null,
                gender: profile.gender,
                goal: profile.goal,
                other_goal: profile.goal === 'other' ? profile.other_goal : '',
                allergies: profile.allergies,
                goal_timeline: profile.goal_timeline,
                updated_at: new Date().toISOString()
            })

            if (error) throw error
            if (onUpdate) onUpdate(session.user.id)
            toast.success('Profile updated successfully!')
            setIsEditing(false)
        } catch (error: any) {
            console.error('Supabase Profile Sync Error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            toast.error(error.message || 'Error updating profile')
        } finally {
            setSaving(false)
        }
    }

    const getGoalInfo = (goalId: string) => {
        switch (goalId) {
            case 'weight_loss': return { label: 'Weight Loss', icon: '📉', color: 'text-blue-500', bg: 'bg-blue-50' }
            case 'weight_gain': return { label: 'Mass Gain', icon: '📈', color: 'text-orange-500', bg: 'bg-orange-50' }
            case 'healthy': return { label: 'Active Health', icon: '🥗', color: 'text-green-500', bg: 'bg-green-50' }
            case 'diabetic': return { label: 'Sugar Control', icon: '🩸', color: 'text-red-500', bg: 'bg-red-50' }
            default: return { label: profile.other_goal || 'Custom Goal', icon: '✨', color: 'text-purple-500', bg: 'bg-purple-50' }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full" />
                    <div className="h-4 w-40 bg-primary/10 rounded" />
                </div>
            </div>
        )
    }

    const goalInfo = getGoalInfo(profile.goal)
    const bmi =
        profile.weight && profile.height
            ? (
                Number(profile.weight) /
                Math.pow(Number(profile.height) / 100, 2)
            ).toFixed(1)
            : null

    const bmiStatus = bmi
        ? Number(bmi) < 18.5
            ? 'Underweight'
            : Number(bmi) < 25
                ? 'Normal'
                : Number(bmi) < 30
                    ? 'Overweight'
                    : 'Obese'
        : null

    const ALLERGEN_OPTIONS = [
        'Peanuts',
        'Milk',
        'Gluten',
        'Soy',
        'Eggs',
        'Shellfish',
        'Tree Nuts',
        'Wheat',
        'Yeast',
        'Sesame'
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="rounded-full hover:bg-primary/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            {isEditing ? 'Edit Profile' : 'Member Profile'}
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            Verified Health Account
                        </p>
                    </div>
                </div>
                {!isEditing && (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="rounded-xl border-primary/20 hover:bg-primary/5 font-bold gap-2"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </Button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="overflow-hidden border-border/30 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl">
                        <div className="p-8 space-y-10">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-muted flex items-center justify-center transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
                                        {profile.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="bg-gradient-to-br from-primary/10 to-primary/30 w-full h-full flex items-center justify-center">
                                                <UserCircle2 className="w-24 h-24 text-primary/40" />
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                                    >
                                        <Camera className="w-6 h-6" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-foreground">Update Photo</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG or WEBP (Max 2MB)</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <User className="w-3.5 h-3.5" /> Full Name
                                        </Label>
                                        <Input
                                            placeholder="Your Name"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="h-14 rounded-2xl bg-white/60 border-border/40 focus:border-primary/50 text-base font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" /> Identity (Email)
                                        </Label>
                                        <Input
                                            value={profile.email}
                                            disabled
                                            className="h-14 rounded-2xl bg-black/5 border-none opacity-60 cursor-not-allowed italic"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5" /> Basic Info
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                value={profile.gender}
                                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                                className="w-full h-14 px-4 rounded-2xl border border-border/40 bg-white/60 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                                            >
                                                <option value="">Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="non-binary">Other</option>
                                            </select>
                                            <Input
                                                type="number"
                                                placeholder="Age"
                                                value={profile.age}
                                                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                                className="h-14 rounded-2xl bg-white/60 border-border/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground ml-1">Current Weight (kg)</Label>
                                            <Input
                                                type="number" step="0.1"
                                                value={profile.weight}
                                                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                                className="h-14 rounded-2xl bg-white/60 border-border/40"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground ml-1">Height (cm)</Label>
                                            <Input
                                                type="number" step="0.1"
                                                value={profile.height}
                                                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                                className="h-14 rounded-2xl bg-white/60 border-border/40"
                                            />
                                        </div>
                                    </div>
                                    {(profile.goal === 'weight_loss' || profile.goal === 'weight_gain') && (
                                        <div className="space-y-2 mt-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/50">
                                            <Label className="text-xs font-bold text-emerald-700 flex items-center gap-2">
                                                🎯 Target Weight (kg)
                                            </Label>
                                            <Input
                                                type="number" step="0.1"
                                                placeholder={profile.goal === 'weight_loss' ? 'e.g. 65' : 'e.g. 75'}
                                                value={profile.target_weight}
                                                onChange={(e) => setProfile({ ...profile, target_weight: e.target.value })}
                                                className="h-14 rounded-2xl bg-white border-2 border-emerald-200 focus:border-emerald-500"
                                            />
                                            <p className="text-[10px] text-emerald-600 italic px-1">Your calorie goal will be calculated based on the gap between your current and target weight.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                            {/* Allergies Section */}
                            <div className="space-y-4">

                                <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Utensils className="w-3.5 h-3.5" />
                                    Dietary Restrictions & Allergies
                                </Label>

                                {/* Chips */}
                                <div className="flex flex-wrap gap-2">

                                    {ALLERGEN_OPTIONS.map(item => {
                                        const active = selectedAllergies.includes(item)

                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleAllergy(item)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                    ${active
                                                        ? 'bg-red-500/15 border-red-500/40 text-red-600 shadow-sm'
                                                        : 'bg-white/40 border-border/40 text-muted-foreground hover:bg-red-500/10'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Custom Add */}
                                <Input
                                    placeholder="Add custom allergy..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            const value = (e.target as HTMLInputElement).value.trim()

                                            if (value && !selectedAllergies.includes(value)) {
                                                const updated = [...selectedAllergies, value]

                                                setSelectedAllergies(updated)
                                                setProfile(prev => ({
                                                    ...prev,
                                                    allergies: updated.join(', ')
                                                }))

                                                    ; (e.target as HTMLInputElement).value = ''
                                            }
                                        }
                                    }}
                                    className="h-12 rounded-2xl bg-white/60 border-border/40"
                                />

                                <p className="text-[10px] text-muted-foreground italic px-1">
                                    Select or add allergies to personalize food recommendations.
                                </p>

                            </div>


                            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                            {/* Goals */}
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" /> What is your primary focus?
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {[
                                        { id: 'weight_loss', label: 'Lose', icon: '📉' },
                                        { id: 'weight_gain', label: 'Build', icon: '📈' },
                                        { id: 'healthy', label: 'Healthy', icon: '🥗' },
                                        { id: 'diabetic', label: 'Sugar', icon: '🩸' },
                                        { id: 'other', label: 'Other', icon: '✨' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setProfile({ ...profile, goal: item.id })}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group ${profile.goal === item.id
                                                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                                                : 'border-border/40 bg-white/60 hover:border-primary/30'
                                                }`}
                                        >
                                            <span className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${profile.goal === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Timeline Field - Only for weight loss/gain */}
                                {(profile.goal === 'weight_loss' || profile.goal === 'weight_gain') && (
                                    <div className="space-y-3 mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-200/50">
                                        <Label className="text-xs font-bold text-blue-700 flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Timeline to achieve your goal
                                        </Label>
                                        <select
                                            value={profile.goal_timeline}
                                            onChange={(e) => setProfile({ ...profile, goal_timeline: e.target.value })}
                                            className="w-full h-12 rounded-xl bg-white border-2 border-blue-200 focus:border-blue-500 text-sm font-medium px-4 outline-none transition-all"
                                        >
                                            <option value="1">1 month</option>
                                            <option value="2">2 months</option>
                                            <option value="3">3 months</option>
                                            <option value="6">6 months</option>
                                            <option value="12">1 year</option>
                                        </select>
                                        <p className="text-[10px] text-blue-600 italic px-1">We'll customize your meal plans based on this timeline.</p>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="p-8 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                Data is encrypted and stored securely
                            </p>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-14 px-10 font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/30 gap-3"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Sync Profile
                            </Button>
                        </div>
                    </Card>
                </form>
            ) : (
                <div className="animate-in slide-in-from-top-4 duration-500 space-y-8">
                    {/* Summary Card */}
                    <Card className="overflow-hidden border-border/20 bg-white/40 backdrop-blur-2xl shadow-xl rounded-[2rem]">
                        <div className="p-10 flex flex-col md:flex-row items-center gap-10">

                            {/* Avatar + Goal */}
                            <div className="relative flex flex-col items-center">

                                {/* Avatar */}
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg bg-muted flex items-center justify-center">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle2 className="w-24 h-24 text-primary/40" />
                                    )}
                                </div>

                                {/* Goal Badge */}
                                <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${goalInfo.bg}`}>
                                    <span>{goalInfo.icon}</span>
                                    <span className={goalInfo.color}>{goalInfo.label}</span>
                                </div>
                            </div>

                            {/* Bio Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">

                                {/* Name */}
                                <h2 className="text-4xl font-black tracking-tight text-foreground">
                                    {profile.full_name || 'Health Hero'}
                                </h2>

                                {/* Email */}
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-primary/60" />
                                    {profile.email}
                                </p>

                                {/* Inline Meta */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-semibold text-muted-foreground">

                                    {profile.age && (
                                        <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                                            Age: {profile.age}
                                        </span>
                                    )}

                                    {profile.gender && (
                                        <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 capitalize">
                                            {profile.gender}
                                        </span>
                                    )}
                                </div>

                                {/* Goal Progress (Hardcoded Calc Ready) */}
                                {(profile.goal === 'weight_loss' || profile.goal === 'weight_gain') &&
                                    profile.weight &&
                                    profile.target_weight && (
                                        <div className="mt-4 space-y-2">

                                            <div className="flex justify-between text-xs font-bold">
                                                <span>Goal Progress</span>
                                                <span>
                                                    {Math.abs(
                                                        ((Number(profile.weight) - Number(profile.target_weight)) /
                                                            Number(profile.weight)) *
                                                        100
                                                    ).toFixed(0)}
                                                    %
                                                </span>
                                            </div>

                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-primary/60"
                                                    style={{
                                                        width: `${Math.min(
                                                            Math.abs(
                                                                ((Number(profile.weight) - Number(profile.target_weight)) /
                                                                    Number(profile.weight)) *
                                                                100
                                                            ),
                                                            100
                                                        )}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                            </div>
                            {/* RIGHT — BMI Square Health Tile */}
                            {bmi && (
                                <div className="hidden md:flex ml-auto items-center">

                                    <div className="w-36 h-36 bg-gradient-to-br from-purple-500/15 via-white/40 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-sm flex flex-col items-center justify-center text-center">

                                        {/* Icon */}
                                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
                                            <Activity className="w-4 h-4 text-purple-600" />
                                        </div>

                                        {/* BMI Value */}
                                        <div className="text-2xl font-black text-foreground leading-none">
                                            {bmi}
                                        </div>

                                        {/* Status */}
                                        {bmiStatus && (
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {bmiStatus}
                                            </p>
                                        )}

                                        {/* Label */}
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                                            BMI
                                        </p>

                                    </div>

                                </div>
                            )}

                        </div>
                    </Card>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">

                        {/* WEIGHT — BLUE */}
                        <div
                            onClick={() => setActiveMetric('weight')}
                            className={`cursor-pointer p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300
        ${activeMetric === 'weight'
                                    ? 'bg-gradient-to-br from-blue-500/25 via-white/40 to-blue-500/10 border-blue-500/40 shadow-lg scale-[1.02]'
                                    : 'bg-gradient-to-br from-blue-500/15 via-white/40 to-blue-500/5 border-blue-500/30 shadow-sm hover:shadow-md hover:-translate-y-1'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                <Scale className="w-5 h-5 text-blue-600" />
                            </div>

                            <div className="text-3xl font-black text-foreground">
                                {profile.weight || '--'}
                                <span className="text-base ml-1 text-muted-foreground">kg</span>
                            </div>

                            {profile.weight && profile.target_weight && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {Math.abs(
                                        Number(profile.weight) - Number(profile.target_weight)
                                    ).toFixed(1)} kg to goal
                                </p>
                            )}

                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-3">
                                Weight
                            </p>
                        </div>

                        {/* TARGET — PURPLE */}
                        <div
                            onClick={() => setActiveMetric('target')}
                            className={`cursor-pointer p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300
        ${activeMetric === 'target'
                                    ? 'bg-gradient-to-br from-purple-500/25 via-white/40 to-purple-500/10 border-purple-500/40 shadow-lg scale-[1.02]'
                                    : 'bg-gradient-to-br from-purple-500/15 via-white/40 to-purple-500/5 border-purple-500/30 shadow-sm hover:shadow-md hover:-translate-y-1'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>

                            <div className="text-3xl font-black text-foreground">
                                {profile.target_weight || '--'}
                                <span className="text-base ml-1 text-muted-foreground">kg</span>
                            </div>

                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-3">
                                Target Weight
                            </p>
                        </div>

                        {/* HEIGHT — CYAN */}
                        <div
                            onClick={() => setActiveMetric('height')}
                            className={`cursor-pointer p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300
        ${activeMetric === 'height'
                                    ? 'bg-gradient-to-br from-cyan-500/25 via-white/40 to-cyan-500/10 border-cyan-500/40 shadow-lg scale-[1.02]'
                                    : 'bg-gradient-to-br from-cyan-500/15 via-white/40 to-cyan-500/5 border-cyan-500/30 shadow-sm hover:shadow-md hover:-translate-y-1'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Ruler className="w-5 h-5 text-cyan-600" />
                            </div>

                            <div className="text-3xl font-black text-foreground">
                                {profile.height || '--'}
                                <span className="text-base ml-1 text-muted-foreground">cm</span>
                            </div>

                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-3">
                                Height
                            </p>
                        </div>

                        {/* AGE — ORANGE */}
                        <div
                            onClick={() => setActiveMetric('age')}
                            className={`cursor-pointer p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300
        ${activeMetric === 'age'
                                    ? 'bg-gradient-to-br from-orange-500/25 via-white/40 to-orange-500/10 border-orange-500/40 shadow-lg scale-[1.02]'
                                    : 'bg-gradient-to-br from-orange-500/15 via-white/40 to-orange-500/5 border-orange-500/30 shadow-sm hover:shadow-md hover:-translate-y-1'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                                <Activity className="w-5 h-5 text-orange-600" />
                            </div>

                            <div className="text-3xl font-black text-foreground">
                                {profile.age || '--'}
                                <span className="text-base ml-1 text-muted-foreground">yrs</span>
                            </div>

                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-3">
                                Age
                            </p>
                        </div>

                    </div>
                    {profile.allergies && (
                        <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-white/40 to-red-500/5 backdrop-blur-xl p-6 shadow-sm">

                            {/* Background Glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-start gap-4">

                                {/* Icon Tile */}
                                <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center shadow-sm">
                                    <Utensils className="w-6 h-6 text-red-600" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">

                                    {/* Title */}
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Active Sensitivities
                                    </p>

                                    {/* Chips */}
                                    <div className="flex flex-wrap gap-2 mt-3">

                                        {profile.allergies.split(',').map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-600 border border-red-500/20 backdrop-blur-sm"
                                            >
                                                {item.trim()}
                                            </span>
                                        ))}

                                    </div>

                                    {/* Helper Note */}
                                    <p className="text-[10px] text-muted-foreground mt-3 italic">
                                        Meals containing these allergens will be filtered or flagged.
                                    </p>

                                </div>

                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}