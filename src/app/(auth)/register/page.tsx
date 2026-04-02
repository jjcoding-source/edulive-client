'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/lib/api'

const schema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Invalid email'),
  grade:     z.string().min(1, 'Required'),
  password:  z.string().min(8, 'Min 8 characters'),
  role:      z.enum(['student', 'tutor']),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [role, setRole]         = useState<'student' | 'tutor'>('student')
  const dispatch = useAppDispatch()
  const router   = useRouter()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, setError } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'student' } })

  const switchRole = (r: 'student' | 'tutor') => {
    setRole(r)
    setValue('role', r)
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/register', {
        name:     `${data.firstName} ${data.lastName}`,
        email:    data.email,
        password: data.password,
        role:     data.role,
        grade:    data.grade,
      })
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }))
      router.push('/dashboard')
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Registration failed' })
    }
  }

  return (
    <>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 bg-[#0E1220] border-r border-white/[0.07] px-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full border border-edu-blue/10 bg-edu-blue/[0.04] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full border border-edu-purple/10 bg-edu-purple/[0.03] translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <Link href="/" className="font-display font-extrabold text-2xl block mb-14">
            Edu<span className="text-edu-blue">Live</span>
          </Link>
          <h2 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight mb-4">
            Your <span className="text-edu-blue">Live Learning</span><br />
            Journey Starts Here
          </h2>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-10">
            Connect with expert tutors, join live classrooms, and track your progress — all in one place.
          </p>
          {[
            'Unlimited access to 340+ expert tutors',
            'Live HD classrooms with shared whiteboards',
            'AI-powered weak area detection',
            'MCQ & subjective quizzes with instant feedback',
          ].map(t => (
            <div key={t} className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-4 h-4 text-edu-green flex-shrink-0" />
              <span className="text-sm text-white/50">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center flex-1 px-10 lg:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto py-8">
          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-white/35 mb-6">Join 12,000+ students already on EduLive</p>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-0 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-6">
            {(['student', 'tutor'] as const).map(r => (
              <button key={r} type="button" onClick={() => switchRole(r)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  role === r
                    ? 'bg-edu-blue/15 border border-edu-blue/25 text-edu-blue'
                    : 'text-white/40 hover:text-white/60'
                }`}>
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400">
                {errors.root.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">First name</label>
                <input {...register('firstName')} className="edu-input" placeholder="Arjun" />
                {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Last name</label>
                <input {...register('lastName')} className="edu-input" placeholder="Ravi" />
                {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Email address</label>
              <input {...register('email')} className="edu-input" placeholder="arjun@gmail.com" />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">
                {role === 'student' ? 'Grade / Class' : 'Primary Subject'}
              </label>
              <input {...register('grade')} className="edu-input"
                placeholder={role === 'student' ? 'Grade 11 · Science' : 'e.g. Mathematics, Physics'} />
              {errors.grade && <p className="text-xs text-red-400 mt-1">{errors.grade.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  className="edu-input pr-10" placeholder="Create a strong password (min 8 chars)" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="edu-btn-primary mt-1 flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-white/25">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 edu-btn-ghost text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/30 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-edu-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}