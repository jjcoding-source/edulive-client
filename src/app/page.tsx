import Link from 'next/link'
import { Play, Zap, BarChart3, Users, Star, ArrowRight, CheckCircle } from 'lucide-react'

const stats = [
  { val: '12K+', label: 'Active Students' },
  { val: '340+', label: 'Expert Tutors'   },
  { val: '98%',  label: 'Satisfaction'    },
]

const features = [
  {
    icon:  <Play className="w-5 h-5 text-edu-blue" />,
    bg:    'bg-edu-blue/10',
    title: 'Live Classrooms',
    desc:  'HD video, shared whiteboard, and real-time tools in every session.',
  },
  {
    icon:  <Zap className="w-5 h-5 text-edu-green" />,
    bg:    'bg-edu-green/10',
    title: 'Instant Doubt Solving',
    desc:  'WebSocket-powered Q&A so no question goes unanswered during class.',
  },
  {
    icon:  <BarChart3 className="w-5 h-5 text-edu-amber" />,
    bg:    'bg-edu-amber/10',
    title: 'Progress Analytics',
    desc:  'Subject-wise dashboards highlighting weak areas and learning streaks.',
  },
]

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-edu-bg text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-12 py-5 border-b border-white/[0.07] sticky top-0 bg-edu-bg/80 backdrop-blur-md z-50">
        <span className="font-display font-extrabold text-xl tracking-tight">
          Edu<span className="text-edu-blue">Live</span>
        </span>
        <div className="flex gap-8 text-sm text-white/50">
          {['Features', 'Tutors', 'Pricing', 'Blog'].map(l => (
            <span key={l} className="hover:text-white/80 cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/login"
            className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link href="/register" className="edu-btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid grid-cols-2 gap-16 items-center px-12 py-24 max-w-7xl mx-auto">
        <div className="fade-in">
          <div className="inline-flex items-center gap-2 bg-edu-blue/10 border border-edu-blue/25 rounded-full px-4 py-2 text-xs text-edu-blue mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-edu-blue live-pulse" />
            Live classes now available
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
            Learn from the<br />
            <span className="text-edu-blue">Best Tutors,</span><br />
            Live &amp; Online
          </h1>
          <p className="text-white/45 text-base leading-relaxed max-w-md mb-9">
            Join interactive live classrooms, solve doubts in real-time, and track
            your progress with personalized AI-powered dashboards.
          </p>
          <div className="flex gap-3">
            <Link href="/register" className="edu-btn-primary flex items-center gap-2">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tutors" className="edu-btn-ghost">
              Browse Tutors
            </Link>
          </div>
          {/* Stats */}
          <div className="flex gap-10 mt-12">
            {stats.map(s => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-white/35 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live class preview card */}
        <div className="fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="edu-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-full px-3 py-1 text-xs text-red-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" />
                LIVE
              </div>
              <span className="text-xs text-white/35">Advanced Mathematics</span>
            </div>

            {/* Whiteboard preview */}
            <div className="bg-[#1E2438] rounded-xl h-44 mb-4 relative overflow-hidden flex items-center justify-center"
              style={{
                backgroundImage: 'linear-gradient(rgba(91,143,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(91,143,255,0.04) 1px,transparent 1px)',
                backgroundSize: '28px 28px',
              }}>
              <div className="text-center z-10 relative">
                <div className="font-display text-2xl font-bold text-edu-blue">∫₀^∞ e⁻ˣ² dx = √π/2</div>
                <div className="text-xs text-white/30 mt-2">Gaussian Integral — Step 3 of 5</div>
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {['AK','SR','MP','TN'].map((i, idx) => (
                    <div key={i}
                      className={`w-7 h-7 rounded-full border-2 border-[#141827] flex items-center justify-center text-[9px] font-bold ${idx > 0 ? '-ml-2' : ''}`}
                      style={{ background: ['#3B5FCC','#0F6E56','#7A3030','#5B3AA0'][idx],
                               color:      ['#B5C8FF','#9FE1CB','#F5C4B3','#CECBF6'][idx] }}>
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/35">+23 watching</span>
              </div>
              <span className="text-xs text-white/25">Dr. Priya Sharma</span>
            </div>

            {/* Tool row */}
            <div className="flex gap-2 mt-3">
              {['Whiteboard', 'Chat', 'Quiz', 'Raise Hand'].map((t, i) => (
                <span key={t}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    i === 0
                      ? 'bg-edu-blue/10 border-edu-blue/30 text-edu-blue'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/60'
                  }`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subjects ribbon */}
      <div className="border-y border-white/[0.06] bg-edu-surface/50 py-4 overflow-hidden">
        <div className="flex gap-6 px-12 flex-wrap">
          {subjects.map(s => (
            <span key={s}
              className="text-sm text-white/30 hover:text-white/60 cursor-pointer transition-colors whitespace-nowrap">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-3">Everything you need to learn better</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            From live sessions to AI-powered weak-area detection — EduLive has it all.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="edu-card p-6 hover:border-white/[0.12] transition-colors">
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-12 pb-24 max-w-7xl mx-auto">
        <div className="edu-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 60% 50%, #5B8FFF 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold mb-3">Ready to start learning?</h2>
            <p className="text-white/40 text-sm mb-8">
              Join 12,000+ students who are already learning smarter with EduLive.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/register" className="edu-btn-primary flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="edu-btn-ghost">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] px-12 py-8 flex items-center justify-between text-xs text-white/25">
        <span className="font-display font-bold text-sm text-white/50">
          Edu<span className="text-edu-blue">Live</span>
        </span>
        <span>© 2026 EduLive. All rights reserved.</span>
      </footer>
    </div>
  )
}