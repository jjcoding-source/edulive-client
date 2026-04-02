'use client'
import { Bell, Search } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'

interface Props { title: string; subtitle?: string }

export default function Topbar({ title, subtitle }: Props) {
  const { user } = useAppSelector(s => s.auth)
  const today    = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="h-16 border-b border-white/[0.07] flex items-center justify-between px-8 sticky top-0 bg-edu-bg/80 backdrop-blur-md z-40">
      <div>
        <h1 className="font-display font-bold text-lg text-white">{title}</h1>
        {subtitle && <p className="text-xs text-white/35">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white/60 placeholder:text-white/25 w-52 focus:outline-none focus:border-edu-blue/40"
            placeholder="Search classes, tutors..."
          />
        </div>
        <button className="relative w-9 h-9 bg-white/[0.05] border border-white/[0.08] rounded-xl flex items-center justify-center hover:bg-white/[0.09] transition-colors">
          <Bell className="w-4 h-4 text-white/50" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-edu-blue" />
        </button>
        <div className="text-xs text-white/25 hidden lg:block border-l border-white/[0.07] pl-3 ml-1">
          {today}
        </div>
      </div>
    </header>
  )
}