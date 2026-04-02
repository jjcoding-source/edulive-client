import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export const getInitials = (name: string): string =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const avatarColor = (name: string): string => {
  const colors = [
    'bg-[#3B5FCC] text-[#B5C8FF]',
    'bg-[#0F6E56] text-[#9FE1CB]',
    'bg-[#5B3AA0] text-[#CECBF6]',
    'bg-[#7A3030] text-[#F5C4B3]',
    'bg-[#1D5A8A] text-[#B5D4F4]',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export const subjectColor: Record<string, string> = {
  Mathematics: 'text-edu-blue  bg-edu-blue/10  border-edu-blue/20',
  Physics:     'text-edu-green bg-edu-green/10 border-edu-green/20',
  Chemistry:   'text-edu-amber bg-edu-amber/10 border-edu-amber/20',
  Biology:     'text-edu-pink  bg-edu-pink/10  border-edu-pink/20',
  English:     'text-edu-purple bg-edu-purple/10 border-edu-purple/20',
}