import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { createUserProfile, getUserProfile } from '@/lib/firestore'
import type { UserProfile } from '@/types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  initialized: boolean

  signIn:           (email: string, password: string) => Promise<boolean>
  signUp:           (email: string, password: string, displayName: string) => Promise<void>
  signOut:          () => Promise<void>
  signInWithGoogle: () => Promise<boolean>
  resetPassword:    (email: string) => Promise<void>
  refreshProfile:   () => Promise<void>
  setLoading:       (v: boolean) => void
  initialize:       () => () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  profile:     null,
  loading:     false,
  isAdmin:     false,
  initialized: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed, user:", user?.uid)
      if (user) {
        try {
          const profile = await getUserProfile(user.uid)
          const tokenResult = await user.getIdTokenResult()
          const isAdmin = tokenResult.claims['role'] === 'admin' ||
                          profile?.role === 'admin'
          set({ user, profile, isAdmin, initialized: true })
          console.log("Auth store updated successfully.")
        } catch (err) {
          console.error("Error fetching user profile or token:", err)
          set({ user: null, profile: null, isAdmin: false, initialized: true })
        }
      } else {
        set({ user: null, profile: null, isAdmin: false, initialized: true })
      }
    })
    return unsubscribe
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(user.uid)
      const tokenResult = await user.getIdTokenResult()
      return tokenResult.claims['role'] === 'admin' || profile?.role === 'admin'
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true })
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName })
      await createUserProfile(user.uid, {
        email,
        displayName,
        role: 'customer',
        addresses: [],
      })
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth)
    set({ user: null, profile: null, isAdmin: false })
  },

  signInWithGoogle: async () => {
    set({ loading: true })
    try {
      const { user } = await signInWithPopup(auth, googleProvider)
      let profile = await getUserProfile(user.uid)
      if (!profile) {
        await createUserProfile(user.uid, {
          email:       user.email!,
          displayName: user.displayName ?? 'Guest',
          photoURL:    user.photoURL ?? undefined,
          role:        'customer',
          addresses:   [],
        })
        profile = await getUserProfile(user.uid)
      }
      const tokenResult = await user.getIdTokenResult()
      return tokenResult.claims['role'] === 'admin' || profile?.role === 'admin'
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email)
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return
    const profile = await getUserProfile(user.uid)
    set({ profile })
  },

  setLoading: (v) => set({ loading: v }),
}))
