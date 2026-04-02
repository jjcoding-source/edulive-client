'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Monitor, PenSquare, BarChart3,
  Users, Calendar, Settings, LogOut, GraduationCap,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { getInitials, avatarColor } from '@/lib/utils'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/live',      icon: Monitor,         label: 'Live Classes' },
  { href: '/quizzes',   icon: PenSquare,       label: 'Quizzes'      },
  { href: '/progress',  icon: BarChart3,       label: 'Progress'     },
  { href: '/tutors',    icon: Users,           label: 'Find Tutors'  },
  { href: '/schedule',  icon: Calendar,        label: 'Schedule'     },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const dispatch  = useAppDispatch()
  const { user }  = useAppSelector(s => s.auth)

  return (
    <aside className="w-[220px] flex-shrink-0 bg-edu-surface border-r border-white/[0.07] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.07]">
        <span className="font-display font-extrabold text-xl tracking-tight">
          Edu<span className="text-edu-blue">Live</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-white/20 px-5 mb-2">Main</p>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-2 mb-0.5 ${
                active
                  ? 'text-edu-blue bg-edu-blue/[0.07] border-edu-blue'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03] border-transparent'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        <p className="text-[10px] uppercase tracking-widest text-white/20 px-5 mb-2 mt-5">Account</p>
        <Link href="/settings"
          className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.03] border-l-2 border-transparent transition-colors mb-0.5">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button onClick={() => dispatch(logout())}
          className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/40 hover:text-red-400 border-l-2 border-transparent transition-colors w-full text-left">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-white/[0.07] p-4 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(user.name)}`}>
            {getInitials(user.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-white/70 font-medium truncate">{user.name}</p>
            <p className="text-xs text-white/30 capitalize">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  )
}