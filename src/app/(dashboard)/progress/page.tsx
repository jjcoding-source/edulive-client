'use client'
import { useEffect }              from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDashboard }         from '@/store/slices/dashboardSlice'
import Topbar                     from '@/components/layout/Topbar'
import { Loader2, BarChart3 }     from 'lucide-react'
import ProgressService            from '@/services/progress.service'

const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const colors   = ['bg-edu-blue','bg-edu-green','bg-edu-amber','bg-edu-pink','bg-edu-purple']

export default function ProgressPage() {
  const dispatch = useAppDispatch()
  const { stats, isLoading } = useAppSelector(s => s.dashboard)

  useEffect(() => {
    dispatch(fetchDashboard())
    const dayIndex = new Date().getDay()
    ProgressService.logStudyHours(1, dayIndex).catch(() => {})
  }, [dispatch])

  if (isLoading) {
    return (
      <div>
        <Topbar title="Progress" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      </div>
    )
  }

  const weeklyHours: number[] = stats?.weeklyHours ?? [0,0,0,0,0,0,0]
  const maxH = Math.max(...weeklyHours, 1)

  return (
    <div>
      <Topbar title="Progress" subtitle="Your learning journey at a glance" />
      <div className="p-8">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Hours Studied',    val: stats?.hoursStudied    ?? 0 },
            { label: 'Classes Attended',        val: stats?.classesAttended ?? 0 },
            { label: 'Doubts Solved',           val: stats?.doubtsSolved    ?? 0 },
          ].map(s => (
            <div key={s.label} className="edu-card p-6 text-center">
              <div className="font-display text-4xl font-bold text-white mb-2">{s.val}</div>
              <div className="text-sm text-white/35">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Weekly chart */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Weekly Study Hours</h3>
            <div className="flex items-end justify-between gap-2" style={{ height: '160px' }}>
              {weekdays.map((day, i) => {
                const pct     = (weeklyHours[i] / maxH) * 100
                const isToday = i === new Date().getDay()
                return (
                  <div key={day} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] text-white/30">
                      {weeklyHours[i] > 0 ? `${weeklyHours[i]}h` : ''}
                    </span>
                    <div className="w-full flex items-end" style={{ height: '120px' }}>
                      <div
                        className={`w-full rounded-t-md transition-all ${isToday ? 'bg-edu-blue' : 'bg-edu-blue/25'}`}
                        style={{ height: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-edu-blue' : 'text-white/25'}`}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Subject breakdown */}
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-5">Subject Performance</h3>
            {(stats?.subjectProgress ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32">
                <BarChart3 className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-xs text-white/25">Complete quizzes to see stats</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {(stats?.subjectProgress ?? []).map((s: any, i: number) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/60">{s.subject}</span>
                      <span className="text-white/40">{s.score}% · {s.totalQuizzes} quiz{s.totalQuizzes !== 1 ? 'zes' : ''}</span>
                    </div>
                    <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${colors[i % colors.length]}`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weak areas */}
        {(stats?.weakAreas ?? []).length > 0 && (
          <div className="edu-card p-6">
            <h3 className="font-display font-semibold text-sm mb-4">Topics Needing Attention</h3>
            <div className="grid grid-cols-3 gap-3">
              {(stats?.weakAreas ?? []).map((w: any) => (
                <div key={w.topic}
                  className="flex items-center justify-between px-4 py-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                  <span className="text-sm text-white/65">{w.topic}</span>
                  <span className="text-sm text-edu-red font-bold">{w.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}