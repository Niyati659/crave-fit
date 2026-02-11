'use client'

import { Button } from '@/components/ui/button'
import { Utensils, LayoutDashboard, Search, UtensilsCrossed, LogIn, LogOut, Sparkles } from 'lucide-react'
import { authStorage } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface HeaderProps {
    currentView: string
    onNavigate: (view: any) => void
    isLoggedIn: boolean
}

export function Header({ currentView, onNavigate, isLoggedIn }: HeaderProps) {
    const router = useRouter()

    const handleLogout = () => {
        authStorage.logout()
        window.location.reload()
    }

    const handleLogin = () => {
        router.push('/auth/login')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-6xl mx-auto items-center justify-between px-4">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => onNavigate('landing')}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <Utensils className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-black text-foreground hidden sm:inline-block">CraveFit</span>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-1 sm:gap-4">
                    <Button
                        variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onNavigate('dashboard')}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden md:inline">Dashboard</span>
                    </Button>

                    <Button
                        variant={currentView === 'quiz' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onNavigate('quiz')}
                        className="flex items-center gap-2 font-semibold text-primary"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden md:inline">Quiz</span>
                    </Button>

                    <Button
                        variant={currentView === 'recommendations' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onNavigate('recommendations')}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <Search className="w-4 h-4" />
                        <span className="hidden md:inline">Foods</span>
                    </Button>

                    <Button
                        variant={currentView === 'meal-tracker' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onNavigate('meal-tracker')}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span className="hidden md:inline">Tracker</span>
                    </Button>
                </nav>

                {/* Auth Actions */}
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleLogin}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-4"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
