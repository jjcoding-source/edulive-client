'use client'
import { useEffect }        from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDashboard }   from '@/store/slices/dashboardSlice'
import Topbar               from '@/components/layout/Topbar'
import Link                 from 'next/link'
import {
  Clock, BookOpen, Target, MessageCircle,
  TrendingUp, TrendingDown, ArrowRight, Zap, Loader2,
} from 'lucide-react'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(s => s.auth)
  const { stats, upcomingSessions, isLoading, error } = useAppSelector(s => s.dashboard)

  useEffect(() => { dispatch(fetchDashboard()) }, [dispatch])

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  }

  if (isLoading) {
    return (
      <div>
        <Topbar title="Dashboard" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Topbar title="Dashboard" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-edu-red text-sm mb-3">{error}</p>
            <button onClick={() => dispatch(fetchDashboard())} className="edu-btn-ghost text-sm">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const kpis = [
    { label: 'Hours Studied',    value: stats?.hoursStudied    ?? 0,    change: 'this week',   up: true,  icon: Clock        },
    { label: 'Classes Attended', value: stats?.classesAttended ?? 0,    change: 'total',        up: true,  icon: BookOpen     },
    { label: 'Quiz Avg Score',   value: `${stats?.quizAvgScore ?? 0}%`, change: 'avg score',    up: (stats?.quizAvgScore ?? 0) >= 60, icon: Target },
    { label: 'Doubts Solved',    value: stats?.doubtsSolved    ?? 0,    change: 'total',        up: true,  icon: MessageCircle},
  ]

  const weeklyHours: number[] = stats?.weeklyHours ?? [0,0,0,0,0,0,0]
  const maxHours = Math.max(...weeklyHours, 1)
  const todayIdx = new Date().getDay()

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Overview of your learning activity" />
      <div className="p-8">

        <div className="flex items-center justify-between mb-7">
          <h2 className="font-display text-xl font-bold">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'Student'} 👋
          </h2>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {kpis.map(({ label, value, change, up, icon: Icon }) => (
            <div key={label} className="edu-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-widest text-white/30">{label}</span>
                <div className="w-8 h-8 bg-white/[0.05] rounded-lg flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-white/40" />
                </div>
              </div>
              <div className="font-display text-3xl font-bold text-white">{value}</div>
              <div className={`text-xs mt-1.5 flex items-center gap-1 ${up ? 'text-edu-green' : 'text-edu-red'}`}>
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}
              </div>
            </div>
          ))}
        </div>

        {/* Mid row */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Subject Progress */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Subject Performance</h3>
            {(stats?.subjectProgress ?? []).length === 0 ? (
              <p className="text-sm text-white/25 text-center py-6">
                Complete quizzes to see your subject performance.
              </p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {(stats?.subjectProgress ?? []).map((s: any, i: number) => {
                  const colors = ['bg-edu-blue','bg-edu-green','bg-edu-amber','bg-edu-pink','bg-edu-purple']
                  return (
                    <div key={s.subject} className="flex items-center gap-3">
                      <span className="text-xs text-white/55 w-[88px] flex-shrink-0">{s.subject}</span>
                      <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i % colors.length]}`}
                          style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-[11px] text-white/35 w-8 text-right">{s.score}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Weekly Hours */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Weekly Study Hours</h3>
            <div className="flex items-end justify-between h-28 gap-2">
              {weekdays.map((day, i) => {
                const pct     = (weeklyHours[i] / maxHours) * 100
                const isToday = i === todayIdx
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full flex items-end justify-center" style={{ height: '90px' }}>
                      <div
                        className={`w-full rounded-t-md transition-all ${isToday ? 'bg-edu-blue' : 'bg-edu-blue/25'}`}
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-edu-blue' : 'text-white/25'}`}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-[1.3fr_1fr] gap-5">
          {/* Upcoming Sessions from API */}
          <div className="edu-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-sm">Upcoming Sessions</h3>
              <Link href="/live" className="text-xs text-edu-blue/70 hover:text-edu-blue flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-white/25">No upcoming sessions.</p>
                <Link href="/tutors" className="text-xs text-edu-blue mt-2 inline-block hover:underline">
                  Browse tutors →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.05]">
                {upcomingSessions.slice(0, 4).map((s: any) => (
                  <div key={s._id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 bg-edu-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-edu-blue/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-medium truncate">{s.title}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {typeof s.tutor === 'object' ? s.tutor.name : 'Tutor'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.status === 'live'
                        ? <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" /> LIVE
                          </span>
                        : <span className="text-xs text-white/30">
                            {new Date(s.startTime).toLocaleString('en-IN', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak Areas from API */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Weak Areas</h3>
            {(stats?.weakAreas ?? []).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-white/25">No weak areas detected yet.</p>
                <p className="text-xs text-white/15 mt-1">Complete quizzes to get insights.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mb-4">
                {(stats?.weakAreas ?? []).map((w: any) => (
                  <div key={w.topic}
                    className="flex items-center justify-between px-4 py-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                    <span className="text-sm text-white/65">{w.topic}</span>
                    <span className="text-sm text-edu-red font-medium">{w.score}%</span>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-edu-blue/[0.07] border border-edu-blue/15 rounded-xl p-4 mt-3">
              <div className="flex items-center gap-2 text-edu-blue text-xs font-medium mb-1.5">
                <Zap className="w-3.5 h-3.5" /> Tip
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Focus on your weakest subjects first. Book a session with a tutor to get targeted help.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}