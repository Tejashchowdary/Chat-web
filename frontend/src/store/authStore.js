import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      register: async (userData) => {
        try {
          const response = await api.post('/auth/register', userData)
          const { user, token } = response.data
          
          set({ user, token, isLoading: false })
          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return { success: false, message }
        }
      },

      login: async (credentials) => {
        try {
          const response = await api.post('/auth/login', credentials)
          const { user, token } = response.data
          
          set({ user, token, isLoading: false })
          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, message }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, token: null })
          toast.success('Logged out successfully')
        }
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          const response = await api.get('/auth/me')
          const { user } = response.data
          set({ user, isLoading: false })
        } catch (error) {
          console.error('Auth check failed:', error)
          set({ user: null, token: null, isLoading: false })
        }
      },

      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }))
      },

      updateProfile: async (profileData) => {
        try {
          const response = await api.put('/auth/profile', profileData)
          const { user } = response.data
          
          set({ user })
          toast.success('Profile updated successfully!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          return { success: false, message }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
)