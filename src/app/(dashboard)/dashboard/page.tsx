'use client'
import { useAppSelector } from '@/store/hooks'
import Topbar from '@/components/layout/Topbar'
import {
  Clock, BookOpen, Target, MessageCircle,
  TrendingUp, TrendingDown, ArrowRight, Zap,
} from 'lucide-react'
import Link from 'next/link'

const kpis = [
  { label: 'Hours Studied',    value: '47',  change: '+12% this week', up: true,  icon: Clock      },
  { label: 'Classes Attended', value: '23',  change: '+3 vs last week',up: true,  icon: BookOpen   },
  { label: 'Quiz Avg Score',   value: '78%', change: '−4% this week',  up: false, icon: Target     },
  { label: 'Doubts Solved',    value: '31',  change: '+7 this month',  up: true,  icon: MessageCircle },
]

const subjects = [
  { name: 'Mathematics', score: 82, color: 'bg-edu-blue'   },
  { name: 'Physics',     score: 68, color: 'bg-edu-green'  },
  { name: 'Chemistry',   score: 54, color: 'bg-edu-amber'  },
  { name: 'Biology',     score: 91, color: 'bg-edu-pink'   },
  { name: 'English',     score: 76, color: 'bg-edu-purple' },
]

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekHours = [4, 6, 3, 7, 5, 6.5, 2]

const sessions = [
  { title: 'Calculus — Integration Methods', tutor: 'Dr. Priya Sharma', time: 'LIVE NOW',   live: true,  color: 'bg-edu-blue/10'   },
  { title: 'Thermodynamics Revision',         tutor: 'Prof. Kiran Mehta', time: 'Today 6 PM', live: false, color: 'bg-edu-green/10'  },
  { title: 'Organic Chemistry Quiz',          tutor: 'Ms. Ananya Iyer',   time: 'Tomorrow 10 AM', live: false, color: 'bg-edu-amber/10' },
  { title: 'Essay Writing Workshop',          tutor: 'Mr. Rahul Nair',    time: 'Thu 3 PM',   live: false, color: 'bg-edu-pink/10'   },
]

const weakAreas = [
  { topic: 'Chemical Bonding',         score: 42 },
  { topic: 'Electromagnetic Induction',score: 51 },
  { topic: 'Differential Equations',   score: 55 },
]

export default function DashboardPage() {
  const { user } = useAppSelector(s => s.auth)
  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  }

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Overview of your learning activity" />
      <div className="p-8">

        {/* Greeting */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-display text-xl font-bold">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'Student'} 👋
          </h2>
        </div>

        {/* KPI Cards */}
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

        {/* Mid row: Subject progress + Weekly chart */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Subject Progress */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Subject Performance</h3>
            <div className="flex flex-col gap-3.5">
              {subjects.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-white/55 w-[88px] flex-shrink-0">{s.name}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-[11px] text-white/35 w-8 text-right">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly chart */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Weekly Study Hours</h3>
            <div className="flex items-end justify-between h-28 gap-2">
              {weekdays.map((day, i) => {
                const max = Math.max(...weekHours)
                const pct = (weekHours[i] / max) * 100
                const isToday = i === 3
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full flex items-end justify-center" style={{ height: '90px' }}>
                      <div
                        className={`w-full rounded-t-md transition-all ${isToday ? 'bg-edu-blue' : 'bg-edu-blue/25'}`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-edu-blue' : 'text-white/25'}`}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom row: Sessions + Weak areas */}
        <div className="grid grid-cols-[1.3fr_1fr] gap-5">
          {/* Upcoming sessions */}
          <div className="edu-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-sm">Upcoming Sessions</h3>
              <Link href="/schedule" className="text-xs text-edu-blue/70 hover:text-edu-blue flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-white/[0.05]">
              {sessions.map(s => (
                <div key={s.title} className="flex items-center gap-3 py-3">
                  <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{s.title}</p>
                    <p className="text-xs text-white/35 mt-0.5">{s.tutor}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {s.live
                      ? <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" /> LIVE
                        </span>
                      : <span className="text-xs text-white/30">{s.time}</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak areas */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Weak Areas</h3>
            <div className="flex flex-col gap-2.5 mb-4">
              {weakAreas.map(w => (
                <div key={w.topic}
                  className="flex items-center justify-between px-4 py-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                  <span className="text-sm text-white/65">{w.topic}</span>
                  <span className="text-sm text-edu-red font-medium">{w.score}%</span>
                </div>
              ))}
            </div>
            <div className="bg-edu-blue/[0.07] border border-edu-blue/15 rounded-xl p-4">
              <div className="flex items-center gap-2 text-edu-blue text-xs font-medium mb-1.5">
                <Zap className="w-3.5 h-3.5" /> AI Recommendation
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Schedule 2 extra sessions on Chemical Bonding this week. Your quiz scores suggest
                gaps in Lewis structures and molecular geometry.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}