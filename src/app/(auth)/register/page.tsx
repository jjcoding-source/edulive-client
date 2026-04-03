'use client'
import { useEffect, useState }  from 'react'
import Link                      from 'next/link'
import { useRouter }             from 'next/navigation'
import { useForm }               from 'react-hook-form'
import { zodResolver }           from '@hookform/resolvers/zod'
import { z }                     from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector }    from '@/store/hooks'
import { registerThunk, clearError }         from '@/store/slices/authSlice'

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
  const { isLoading, error, isAuthenticated } = useAppSelector(s => s.auth)

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'student' } })

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  const switchRole = (r: 'student' | 'tutor') => {
    setRole(r); setValue('role', r)
  }

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(registerThunk({
      name:     `${data.firstName} ${data.lastName}`,
      email:    data.email,
      password: data.password,
      role:     data.role,
      grade:    data.grade,
    }))
    if (registerThunk.fulfilled.match(result)) router.push('/dashboard')
  }

  return (
    <>
      <div className="hidden lg:flex flex-col justify-center flex-1 bg-[#0E1220] border-r border-white/[0.07] px-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full border border-edu-blue/10 bg-edu-blue/[0.04] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <Link href="/" className="font-display font-extrabold text-2xl block mb-14">
            Edu<span className="text-edu-blue">Live</span>
          </Link>
          <h2 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight mb-4">
            Your <span className="text-edu-blue">Live Learning</span><br />Journey Starts Here
          </h2>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-10">
            Connect with expert tutors, join live classrooms, and track your progress.
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

      <div className="flex flex-col justify-center flex-1 px-10 lg:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto py-8">
          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-white/35 mb-6">Join 12,000+ students already on EduLive</p>

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

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              <input {...register('email')} className="edu-input" placeholder="arjun@gmail.com" autoComplete="email" />
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
                  className="edu-input pr-10" placeholder="Min 8 characters" autoComplete="new-password" />
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
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-edu-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}