'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Mic, MicOff, Video, VideoOff, Monitor, Hand,
  PhoneOff, Users, MessageSquare, HelpCircle,
  Pen, Circle, Square, Minus, Trash2, Send,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addMessage, toggleMute, toggleVideo, toggleHand,
  setActiveTab, setConnected, resetClassroom,
} from '@/store/slices/classroomSlice'
import { connectSocket, disconnectSocket, SOCKET_EVENTS } from '@/lib/socket'
import { getInitials, avatarColor } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const DEMO_MSGS: ChatMessage[] = [
  { _id:'1', roomId:'', sender:{ _id:'t1', name:'Dr. Priya Sharma', role:'tutor' },   text:'Let\'s apply integration by parts to ∫x·eˣ dx. Who can identify u and dv?', timestamp: '' },
  { _id:'2', roomId:'', sender:{ _id:'s1', name:'Arjun R.',          role:'student' }, text:'u = x and dv = eˣdx I think?',                                               timestamp: '' },
  { _id:'3', roomId:'', sender:{ _id:'t1', name:'Dr. Priya Sharma', role:'tutor' },   text:'Correct! Now du = dx and v = eˣ. Let\'s substitute into the formula.',         timestamp: '' },
  { _id:'4', roomId:'', sender:{ _id:'s2', name:'Sneha K.',          role:'student' }, text:'Why do we choose u = x and not u = eˣ?',                                      timestamp: '' },
  { _id:'5', roomId:'', sender:{ _id:'t1', name:'Dr. Priya Sharma', role:'tutor' },   text:'Great question! Use LIATE — Algebraic comes before Exponential.',              timestamp: '' },
]

const participants = [
  { name:'Dr. Priya Sharma', role:'tutor'   as const, initials:'PS' },
  { name:'Arjun Ravi',       role:'student' as const, initials:'AR' },
  { name:'Sneha K.',         role:'student' as const, initials:'SK' },
  { name:'Mihir P.',         role:'student' as const, initials:'MP' },
]

export default function LiveClassroomPage() {
  const params   = useParams()
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const { isMuted, isVideoOn, handRaised, activeTab, messages } = useAppSelector(s => s.classroom)
  const { token } = useAppSelector(s => s.auth)

  const [chatInput, setChatInput] = useState('')
  const [activeTool, setActiveTool] = useState<'pen'|'circle'|'rect'|'line'>('pen')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Seed demo messages
    DEMO_MSGS.forEach(m => dispatch(addMessage(m)))

    if (token) {
      const socket = connectSocket(token)
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: params.roomId })
      dispatch(setConnected(true))

      socket.on(SOCKET_EVENTS.NEW_MESSAGE, (msg: ChatMessage) => dispatch(addMessage(msg)))

      return () => {
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId: params.roomId })
        disconnectSocket()
        dispatch(resetClassroom())
      }
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!chatInput.trim()) return
    const newMsg: ChatMessage = {
      _id: Date.now().toString(),
      roomId: params.roomId as string,
      sender: { _id: 'me', name: 'You', role: 'student' },
      text: chatInput,
      timestamp: new Date().toISOString(),
    }
    dispatch(addMessage(newMsg))
    setChatInput('')
  }

  const tabs = [
    { key: 'chat',   icon: MessageSquare, label: 'Chat'    },
    { key: 'doubts', icon: HelpCircle,    label: 'Doubts'  },
    { key: 'people', icon: Users,         label: 'People'  },
  ] as const

  return (
    <div className="flex h-screen bg-[#080C15] text-white overflow-hidden">

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-edu-surface border-b border-white/[0.07]">
          <div>
            <p className="font-display font-bold text-sm">Calculus — Integration Methods</p>
            <p className="text-xs text-white/30 mt-0.5">Session #CAL-2042 · 01:12:34</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5 text-xs text-red-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" /> LIVE · 27 Students
            </div>
            <button
              onClick={() => { disconnectSocket(); router.push('/dashboard') }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              <PhoneOff className="w-3.5 h-3.5" /> Leave
            </button>
          </div>
        </div>

        {/* Whiteboard */}
        <div className="flex-1 relative bg-[#0F1625] overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(91,143,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(91,143,255,0.05) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}>

          {/* Toolbar */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {([
              { tool:'pen' as const,    icon: Pen    },
              { tool:'circle' as const, icon: Circle },
              { tool:'rect' as const,   icon: Square },
              { tool:'line' as const,   icon: Minus  },
            ]).map(({ tool, icon: Icon }) => (
              <button key={tool} onClick={() => setActiveTool(tool)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
                  activeTool === tool
                    ? 'bg-edu-blue/15 border-edu-blue/30 text-edu-blue'
                    : 'bg-white/[0.05] border-white/[0.08] text-white/40 hover:text-white/70'
                }`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-edu-red transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Formula annotation */}
          <div className="absolute top-8 right-12 bg-edu-blue/10 border border-edu-blue/20 rounded-xl px-3 py-2 text-xs text-edu-blue z-10">
            Step 3: Apply formula →
          </div>

          {/* Content */}
          <div className="text-center z-10 relative fade-in">
            <p className="text-sm text-white/30 mb-3">Integration by Parts Formula</p>
            <p className="font-display text-3xl font-bold text-white tracking-tight">∫u dv = uv − ∫v du</p>
            <p className="text-white/40 mt-5 text-sm">Example: ∫x·eˣ dx</p>
            <p className="text-white/60 mt-2">Let u = x, dv = eˣdx</p>
            <p className="text-white/60 mt-1">→ du = dx, v = eˣ</p>
            <p className="text-edu-blue font-medium mt-2 text-lg">∴ = xeˣ − eˣ + C</p>
          </div>
        </div>

        {/* Video strip */}
        <div className="flex gap-2.5 px-4 py-3 bg-edu-surface border-t border-white/[0.07] overflow-x-auto">
          {participants.map((p, idx) => (
            <div key={p.name}
              className={`w-24 h-16 rounded-xl flex-shrink-0 relative flex items-center justify-center bg-[#1A2035] border ${
                idx === 0 ? 'border-edu-blue' : 'border-transparent'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(p.name)}`}>
                {p.initials}
              </div>
              <span className="absolute bottom-1 left-2 text-[9px] text-white/50">{p.name.split(' ')[0]}</span>
              {p.role === 'tutor' && (
                <span className="absolute top-1 right-1 bg-edu-blue rounded text-[7px] px-1 text-white">Tutor</span>
              )}
            </div>
          ))}
          <div className="w-24 h-16 rounded-xl flex-shrink-0 bg-[#1A2035]/50 border border-transparent flex items-center justify-center">
            <span className="text-[10px] text-white/25">+23 more</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-5 py-4 bg-edu-bg border-t border-white/[0.07]">
          {[
            { action: () => dispatch(toggleMute()),  icon: isMuted ? MicOff : Mic,      label: isMuted ? 'Unmute' : 'Mute', danger: isMuted },
            { action: () => dispatch(toggleVideo()), icon: isVideoOn ? Video : VideoOff,label: 'Video',   danger: false },
            { action: () => {},                       icon: Monitor,                      label: 'Screen',  danger: false },
            { action: () => dispatch(setActiveTab('chat')), icon: MessageSquare,          label: 'Chat',    danger: false },
            { action: () => dispatch(toggleHand()),  icon: Hand,                          label: handRaised ? 'Lower Hand' : 'Raise Hand', danger: false },
          ].map(({ action, icon: Icon, label, danger }) => (
            <button key={label} onClick={action}
              className="flex flex-col items-center gap-1.5 group">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                danger ? 'bg-red-500/15 border border-red-500/25 text-red-400' : 'bg-white/[0.08] border border-white/10 text-white/60 group-hover:bg-white/[0.12]'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-white/30">{label}</span>
            </button>
          ))}
          <button
            onClick={() => { disconnectSocket(); router.push('/dashboard') }}
            className="flex flex-col items-center gap-1.5 group">
            <div className="w-11 h-11 rounded-full bg-edu-red/90 flex items-center justify-center hover:bg-edu-red transition-colors">
              <PhoneOff className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] text-white/30">End</span>
          </button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-72 flex flex-col bg-edu-surface border-l border-white/[0.07]">
        {/* Tabs */}
        <div className="flex border-b border-white/[0.07]">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => dispatch(setActiveTab(key))}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs border-b-2 transition-colors ${
                activeTab === key
                  ? 'text-edu-blue border-edu-blue'
                  : 'text-white/35 border-transparent hover:text-white/60'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
              {messages.map(msg => (
                <div key={msg._id} className="flex gap-2 items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${avatarColor(msg.sender.name)}`}>
                    {getInitials(msg.sender.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-white/30 mb-1">
                      {msg.sender.name}{msg.sender.role === 'tutor' ? ' · Tutor' : ''}
                    </p>
                    <p className={`text-xs leading-relaxed rounded-tl-none rounded-xl px-2.5 py-2 ${
                      msg.sender.role === 'tutor'
                        ? 'bg-edu-blue/10 border border-edu-blue/15 text-white/75'
                        : 'bg-white/[0.05] text-white/65'
                    }`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-white/[0.07] flex gap-2 items-center">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 placeholder:text-white/25 focus:outline-none focus:border-edu-blue/30"
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}
                className="w-8 h-8 bg-edu-blue rounded-xl flex items-center justify-center hover:bg-[#4a7ef0] transition-colors flex-shrink-0">
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </>
        )}

        {activeTab === 'people' && (
          <div className="p-4 overflow-y-auto">
            <p className="text-[11px] text-white/25 mb-3">27 participants</p>
            {participants.map(p => (
              <div key={p.name} className="flex items-center gap-2.5 py-2 border-b border-white/[0.05] last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColor(p.name)}`}>
                  {p.initials}
                </div>
                <span className="text-xs text-white/60 flex-1">{p.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                  p.role === 'tutor'
                    ? 'bg-edu-blue/10 text-edu-blue border-edu-blue/20'
                    : 'bg-white/[0.05] text-white/30 border-white/[0.08]'
                }`}>{p.role}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <HelpCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/25">No doubts raised yet.</p>
              <p className="text-xs text-white/15 mt-1">Raise your hand to ask a question.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}