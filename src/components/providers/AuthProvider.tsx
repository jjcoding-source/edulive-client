'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getMeThunk } from '@/store/slices/authSlice'

const PUBLIC_ROUTES = ['/', '/login', '/register']

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch    = useAppDispatch()
  const router      = useRouter()
  const pathname    = usePathname()
  const { token, isAuthenticated, isLoading } = useAppSelector(s => s.auth)

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getMeThunk())
    }
  }, [token, isAuthenticated, dispatch])

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    if (!token && !isPublic) {
      router.push('/login')
    }
  }, [token, pathname, router])

  return <>{children}</>
}