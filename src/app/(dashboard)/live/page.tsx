'use client'
import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSessions, joinSession }     from '@/store/slices/sessionSlice'
import Topbar    from '@/components/layout/Topbar'
import { Monitor, Clock, Users, Plus, Loader2, Lock, Radio } from 'lucide-react'
import SessionService, { CreateSessionPayload } from '@/services/session.service'
import { useForm } from 'react-hook-form'

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']

export default function LivePage() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { sessions, isLoading, error } = useAppSelector(s => s.sessions)
  const { user }                        = useAppSelector(s => s.auth)

  const [filter, setFilter]     = useState('All')
  const [joining, setJoining]   = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const { register, handleSubmit, reset } = useForm<CreateSessionPayload>()

  useEffect(() => {
    dispatch(fetchSessions({ status: 'live' }))
    // Poll every 30s for new live sessions
    const interval = setInterval(() => dispatch(fetchSessions({ status: 'live' })), 30_000)
    return () => clearInterval(interval)
  }, [dispatch])

  const filtered = sessions.filter(s =>
    filter === 'All' || s.subject === filter
  )

  const handleJoin = async (sessionId: string, roomId: string) => {
    setJoining(sessionId)
    try {
      const result = await dispatch(joinSession(sessionId))
      if (joinSession.fulfilled.match(result)) {
        router.push(`/live/${roomId}`)
      }
    } finally {
      setJoining(null)
    }
  }

  const handleCreate = async (data: CreateSessionPayload) => {
    setCreating(true)
    try {
      const res = await SessionService.create(data)
      const session = res.data.data
      // Go live immediately
      await SessionService.goLive(session._id)
      router.push(`/live/${session.roomId}`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create session')
    } finally {
      setCreating(false)
      setShowCreate(false)
      reset()
    }
  }

  return (
    <div>
      <Topbar title="Live Classes" subtitle="Join an ongoing session or start a new one" />
      <div className="p-8">

        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                  filter === s
                    ? 'bg-edu-blue/12 border-edu-blue/30 text-edu-blue'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/45 hover:text-white/70'
                }`}>
                {s}
              </button>
            ))}
          </div>
          {user?.role === 'tutor' && (
            <button onClick={() => setShowCreate(true)}
              className="edu-btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Start New Session
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        )}

        {/* No sessions */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Radio className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No live sessions right now.</p>
            <p className="text-white/15 text-xs mt-1">
              {user?.role === 'tutor' ? 'Start a session to teach.' : 'Check back soon or browse tutors to book one.'}
            </p>
          </div>
        )}

        {/* Session cards */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(s => {
            const tutor  = typeof s.tutor === 'object' ? s.tutor as any : null
            const isLive = s.status === 'live'
            return (
              <div key={s._id} className="edu-card p-5 flex flex-col hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  {isLive
                    ? <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" /> LIVE
                      </span>
                    : <span className="text-xs text-white/30 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1">
                        Scheduled
                      </span>
                  }
                  <span className="text-xs text-white/30">{s.subject}</span>
                </div>

                <h3 className="font-display font-semibold text-sm text-white mb-1 flex-1">
                  {s.title}
                </h3>
                <p className="text-xs text-white/35 mb-4">
                  {tutor?.name ?? 'Tutor'}
                </p>

                <div className="flex gap-3 text-xs text-white/30 mb-4 border-t border-white/[0.06] pt-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {s.students?.length ?? 0} joined
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.durationMinutes}m
                  </span>
                  {s.maxStudents && (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Max {s.maxStudents}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleJoin(s._id, s.roomId)}
                  disabled={joining === s._id || !isLive}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isLive
                      ? 'bg-edu-blue/10 border border-edu-blue/20 text-edu-blue hover:bg-edu-blue/20'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/20 cursor-not-allowed'
                  }`}>
                  {joining === s._id
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining...</>
                    : isLive ? <><Monitor className="w-3.5 h-3.5" /> Join Now</> : 'Not started yet'
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Create session modal (tutor) */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-edu-card border border-white/[0.1] rounded-2xl w-full max-w-md p-6">
              <h2 className="font-display font-bold text-lg mb-5">Start New Session</h2>
              <form onSubmit={handleSubmit(handleCreate)} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Session Title</label>
                  <input {...register('title', { required: true })}
                    className="edu-input" placeholder="e.g. Calculus — Integration Methods" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Subject</label>
                  <select {...register('subject', { required: true })}
                    className="edu-input bg-[#141827]">
                    {['Mathematics','Physics','Chemistry','Biology','English','Computer Science'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Duration (min)</label>
                    <input {...register('durationMinutes')} type="number"
                      defaultValue={60} className="edu-input" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Max Students</label>
                    <input {...register('maxStudents')} type="number"
                      defaultValue={50} className="edu-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Start Time</label>
                  <input {...register('startTime', { required: true })}
                    type="datetime-local" className="edu-input" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="edu-btn-ghost flex-1 text-sm">Cancel</button>
                  <button type="submit" disabled={creating}
                    className="edu-btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                    {creating
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                      : '🔴 Go Live'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}