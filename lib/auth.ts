export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
}

// Simple localStorage-based auth
export const authStorage = {
  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('craveFit_user', JSON.stringify(user))
    }
  },

  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('craveFit_user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('craveFit_user')
    }
  },

  signup: (email: string, password: string, name: string): User => {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name,
    }
    authStorage.setUser(user)
    return user
  },

  login: (email: string, password: string): User | null => {
    // In a real app, this would validate against a backend
    // For now, we'll check if user exists in localStorage
    const user = authStorage.getUser()
    if (user && user.email === email) {
      return user
    }
    // Allow any email/password for demo (in real app, validate properly)
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name: email.split('@')[0],
    }
    authStorage.setUser(newUser)
    return newUser
  },

  logout: () => {
    authStorage.removeUser()
  },
}
