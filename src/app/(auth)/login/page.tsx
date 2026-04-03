'use client'
import { useEffect }       from 'react'
import Link                from 'next/link'
import { useRouter }       from 'next/navigation'
import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import { z }               from 'zod'
import { Eye, EyeOff, Play, Zap, BarChart3, Loader2 } from 'lucide-react'
import { useState }        from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginThunk, clearError }         from '@/store/slices/authSlice'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: Play,      bg: 'bg-edu-blue/10',  color: 'text-edu-blue',  text: 'HD live classrooms with interactive whiteboards' },
  { icon: Zap,       bg: 'bg-edu-green/10', color: 'text-edu-green', text: 'Real-time doubt solving via WebSockets' },
  { icon: BarChart3, bg: 'bg-edu-amber/10', color: 'text-edu-amber', text: 'AI-powered progress tracking & weak area detection' },
]

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { isLoading, error, isAuthenticated } = useAppSelector(s => s.auth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  
  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(loginThunk(data))
    if (loginThunk.fulfilled.match(result)) {
      router.push('/dashboard')
    }
  }

  return (
    <>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 bg-[#0E1220] border-r border-white/[0.07] px-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full border border-edu-blue/10 bg-edu-blue/[0.04] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full border border-edu-green/10 bg-edu-green/[0.03] translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <Link href="/" className="font-display font-extrabold text-2xl tracking-tight block mb-14">
            Edu<span className="text-edu-blue">Live</span>
          </Link>
          <h2 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight mb-4">
            Welcome back!<br />
            <span className="text-edu-blue">Continue learning</span><br />
            where you left off.
          </h2>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-10">
            Your next live session is waiting. Log in to join your class.
          </p>
          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, bg, color, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm text-white/50">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center flex-1 px-10 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          <h1 className="font-display text-2xl font-bold mb-1">Sign in to EduLive</h1>
          <p className="text-sm text-white/35 mb-8">Enter your credentials to continue</p>

          {/* API error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Email address</label>
              <input {...register('email')} className="edu-input" placeholder="arjun@gmail.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-white/40">Password</label>
                <Link href="/forgot-password" className="text-xs text-edu-blue/70 hover:text-edu-blue transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="edu-input pr-10"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="edu-btn-primary mt-1 flex items-center justify-center gap-2">
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : 'Sign In →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-white/25">or continue with</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 edu-btn-ghost text-sm" disabled>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/30 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-edu-blue hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  )
}