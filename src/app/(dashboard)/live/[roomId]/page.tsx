'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter }                      from 'next/navigation'
import {
  Mic, MicOff, Video, VideoOff, Monitor,
  Hand, PhoneOff, Users, MessageSquare,
  HelpCircle, Pen, Square, Minus, Trash2, Send, Loader2,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addMessage, setMessages, toggleMute, toggleVideo,
  toggleHand, setActiveTab, setConnected, resetClassroom,
  updateParticipants,
} from '@/store/slices/classroomSlice'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { getInitials, avatarColor }        from '@/lib/utils'
import type { ChatMessage }                from '@/types'
import ProgressService                     from '@/services/progress.service'

export default function LiveClassroomPage() {
  const params   = useParams()
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const roomId   = params.roomId as string

  const { isMuted, isVideoOn, handRaised, activeTab, messages, participants, isConnected } =
    useAppSelector(s => s.classroom)
  const { token, user } = useAppSelector(s => s.auth)

  const [chatInput,   setChatInput]   = useState('')
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [connecting,  setConnecting]  = useState(true)
  const [activeTool,  setActiveTool]  = useState<'pen'|'rect'|'line'>('pen')
  const [doubt,       setDoubt]       = useState('')
  const [showDoubt,   setShowDoubt]   = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return

    const socket = connectSocket(token)

    // ── Socket listeners ─────────────────────────────────────────
    socket.on('connected', () => {
      socket.emit('classroom:join', { roomId })
    })

    socket.on('classroom:joined', (data: any) => {
      setSessionInfo(data.session)
      setConnecting(false)
      dispatch(setConnected(true))
      // Record class attendance
      ProgressService.classAttended().catch(() => {})
    })

    socket.on('chat:message', (msg: ChatMessage) => {
      dispatch(addMessage(msg))
    })

    socket.on('classroom:participants', (list: any[]) => {
      dispatch(updateParticipants(list))
    })

    socket.on('classroom:userJoined', (data: any) => {
      const systemMsg: ChatMessage = {
        _id:       `sys-${Date.now()}`,
        roomId,
        sender:    { _id: 'system', name: 'System', role: 'student' },
        text:      `${data.name} joined the classroom`,
        timestamp: new Date().toISOString(),
      }
      dispatch(addMessage(systemMsg))
    })

    socket.on('classroom:userLeft', (data: any) => {
      const systemMsg: ChatMessage = {
        _id:       `sys-${Date.now()}`,
        roomId,
        sender:    { _id: 'system', name: 'System', role: 'student' },
        text:      `${data.name} left the classroom`,
        timestamp: new Date().toISOString(),
      }
      dispatch(addMessage(systemMsg))
    })

    socket.on('classroom:handRaised', (data: any) => {
      const msg: ChatMessage = {
        _id:       `hand-${Date.now()}`,
        roomId,
        sender:    { _id: data.userId, name: data.name, role: 'student' },
        text:      data.raised ? `✋ ${data.name} raised their hand` : `${data.name} lowered their hand`,
        timestamp: new Date().toISOString(),
      }
      dispatch(addMessage(msg))
    })

    socket.on('doubt:new', (data: any) => {
      const msg: ChatMessage = {
        _id:       `doubt-${Date.now()}`,
        roomId,
        sender:    { _id: data.from.userId, name: data.from.name, role: 'student' },
        text:      `❓ ${data.text}`,
        timestamp: data.timestamp,
      }
      dispatch(addMessage(msg))
    })

    socket.on('error', (data: any) => {
      console.error('Socket error:', data.message)
      setConnecting(false)
    })

    return () => {
      socket.emit('classroom:leave', { roomId })
      socket.removeAllListeners()
      disconnectSocket()
      dispatch(resetClassroom())
    }
  }, [token, roomId, dispatch])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(() => {
    if (!chatInput.trim() || !token) return
    const socket = connectSocket(token)
    socket.emit('chat:send', { roomId, text: chatInput.trim() })
    setChatInput('')
  }, [chatInput, roomId, token])

  const sendDoubt = useCallback(() => {
    if (!doubt.trim() || !token) return
    const socket = connectSocket(token)
    socket.emit('doubt:raise', { roomId, text: doubt.trim() })
    setDoubt('')
    setShowDoubt(false)
    ProgressService.doubtSolved().catch(() => {})
  }, [doubt, roomId, token])

  const handleRaiseHand = () => {
    if (!token) return
    const socket = connectSocket(token)
    const newVal = !handRaised
    dispatch(toggleHand())
    socket.emit('classroom:raiseHand', { roomId, raised: newVal })
  }

  const handleLeave = () => {
    if (token) {
      const socket = connectSocket(token)
      socket.emit('classroom:leave', { roomId })
    }
    disconnectSocket()
    dispatch(resetClassroom())
    router.push('/live')
  }

  const tabs = [
    { key: 'chat'   as const, icon: MessageSquare, label: 'Chat'   },
    { key: 'doubts' as const, icon: HelpCircle,    label: 'Doubts' },
    { key: 'people' as const, icon: Users,         label: 'People' },
  ]

  if (connecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080C15]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-edu-blue mx-auto mb-4" />
          <p className="text-white/40 text-sm">Connecting to classroom...</p>
          <p className="text-white/20 text-xs mt-1">Room: {roomId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#080C15] text-white overflow-hidden">

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-edu-surface border-b border-white/[0.07]">
          <div>
            <p className="font-display font-bold text-sm">{sessionInfo?.title ?? 'Live Session'}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {sessionInfo?.subject} · Room: {roomId.slice(0,8)}...
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5 text-xs text-red-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" />
              LIVE · {participants.length} connected
            </div>
            {user?.role === 'tutor' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-edu-blue/10 border border-edu-blue/20 rounded-lg text-xs text-edu-blue hover:bg-edu-blue/20 transition-colors"
                onClick={() => {
                  if (!token) return
                  const socket = connectSocket(token)
                  socket.emit('quiz:start', { roomId, quizId: 'demo' })
                }}>
                Start Quiz
              </button>
            )}
            <button onClick={handleLeave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              <PhoneOff className="w-3.5 h-3.5" /> Leave
            </button>
          </div>
        </div>

        {/* Whiteboard */}
        <div className="flex-1 relative bg-[#0F1625] overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(91,143,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(91,143,255,0.05) 1px,transparent 1px)',
            backgroundSize:  '32px 32px',
          }}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {([
              { tool: 'pen'  as const, icon: Pen    },
              { tool: 'rect' as const, icon: Square },
              { tool: 'line' as const, icon: Minus  },
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
            <button
              onClick={() => token && connectSocket(token).emit('whiteboard:clear', { roomId })}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-edu-red transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center z-10 relative fade-in">
            <p className="text-sm text-white/30 mb-4">
              {sessionInfo?.title ?? 'Shared Whiteboard'}
            </p>
            <p className="font-display text-2xl font-bold text-white/70">
              Whiteboard — collaborative mode
            </p>
            <p className="text-white/25 mt-3 text-sm">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} in this room
            </p>
          </div>
        </div>

        {/* Participant video strip */}
        <div className="flex gap-2.5 px-4 py-3 bg-edu-surface border-t border-white/[0.07] overflow-x-auto">
          {participants.slice(0, 6).map((p, idx) => (
            <div key={p.userId}
              className={`w-24 h-16 rounded-xl flex-shrink-0 relative flex items-center justify-center bg-[#1A2035] border ${
                idx === 0 ? 'border-edu-blue' : 'border-transparent'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(p.name)}`}>
                {getInitials(p.name)}
              </div>
              <span className="absolute bottom-1 left-2 text-[9px] text-white/50 truncate max-w-[80px]">
                {p.name.split(' ')[0]}
              </span>
              {p.role === 'tutor' && (
                <span className="absolute top-1 right-1 bg-edu-blue rounded text-[7px] px-1 text-white">T</span>
              )}
            </div>
          ))}
          {participants.length > 6 && (
            <div className="w-24 h-16 rounded-xl flex-shrink-0 bg-[#1A2035]/50 border border-transparent flex items-center justify-center">
              <span className="text-[10px] text-white/25">+{participants.length - 6} more</span>
            </div>
          )}
        </div>

        {/* Control bar */}
        <div className="flex items-center justify-center gap-4 px-5 py-4 bg-edu-bg border-t border-white/[0.07]">
          {[
            { action: () => dispatch(toggleMute()),  icon: isMuted   ? MicOff  : Mic,      label: isMuted   ? 'Unmute' : 'Mute',  danger: isMuted  },
            { action: () => dispatch(toggleVideo()), icon: isVideoOn ? Video   : VideoOff, label: 'Video',                         danger: !isVideoOn },
            { action: () => {},                       icon: Monitor,                         label: 'Screen',                        danger: false     },
            { action: () => dispatch(setActiveTab('chat')), icon: MessageSquare,            label: 'Chat',                          danger: false     },
            { action: handleRaiseHand,                icon: Hand,                            label: handRaised ? 'Lower' : 'Hand',  danger: handRaised },
          ].map(({ action, icon: Icon, label, danger }) => (
            <button key={label} onClick={action}
              className="flex flex-col items-center gap-1.5 group">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                danger
                  ? 'bg-red-500/15 border border-red-500/25 text-red-400'
                  : 'bg-white/[0.08] border border-white/10 text-white/60 group-hover:bg-white/[0.12]'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-white/30">{label}</span>
            </button>
          ))}
          <button onClick={handleLeave}
            className="flex flex-col items-center gap-1.5 group">
            <div className="w-11 h-11 rounded-full bg-edu-red/90 flex items-center justify-center hover:bg-edu-red transition-colors">
              <PhoneOff className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] text-white/30">End</span>
          </button>
        </div>
      </div>

      {/* ── Side Panel ───────────────────────────────────────────── */}
      <div className="w-72 flex flex-col bg-edu-surface border-l border-white/[0.07]">
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

        {/* Chat */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-xs text-white/20 text-center mt-8">
                  No messages yet. Say hello!
                </p>
              )}
              {messages.map(msg => {
                const isSystem = msg.sender._id === 'system'
                if (isSystem) {
                  return (
                    <p key={msg._id} className="text-[10px] text-white/20 text-center">
                      {msg.text}
                    </p>
                  )
                }
                return (
                  <div key={msg._id} className="flex gap-2 items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${avatarColor(msg.sender.name)}`}>
                      {getInitials(msg.sender.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/30 mb-1">
                        {msg.sender.name}{msg.sender.role === 'tutor' ? ' · Tutor' : ''}
                      </p>
                      <p className={`text-xs leading-relaxed rounded-tl-none rounded-xl px-2.5 py-2 break-words ${
                        msg.sender.role === 'tutor'
                          ? 'bg-edu-blue/10 border border-edu-blue/15 text-white/75'
                          : 'bg-white/[0.05] text-white/65'
                      }`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-white/[0.07] flex gap-2 items-center">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
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

        {/* Doubts */}
        {activeTab === 'doubts' && (
          <div className="flex-1 flex flex-col p-4">
            {!showDoubt ? (
              <button onClick={() => setShowDoubt(true)}
                className="edu-btn-primary text-sm flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4" /> Ask a Doubt
              </button>
            ) : (
              <div className="mb-4">
                <textarea
                  value={doubt}
                  onChange={e => setDoubt(e.target.value)}
                  className="edu-input resize-none h-24 text-xs mb-2"
                  placeholder="Type your doubt here..."
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowDoubt(false)} className="edu-btn-ghost text-xs flex-1">
                    Cancel
                  </button>
                  <button onClick={sendDoubt} className="edu-btn-primary text-xs flex-1">
                    Send Doubt
                  </button>
                </div>
              </div>
            )}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <HelpCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/25">Doubts appear here live.</p>
              </div>
            </div>
          </div>
        )}

        {/* People */}
        {activeTab === 'people' && (
          <div className="p-4 overflow-y-auto flex-1">
            <p className="text-[11px] text-white/25 mb-3">{participants.length} in this room</p>
            {participants.length === 0 && (
              <p className="text-xs text-white/20 text-center mt-8">No participants yet.</p>
            )}
            {participants.map(p => (
              <div key={p.userId} className="flex items-center gap-2.5 py-2 border-b border-white/[0.05] last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColor(p.name)}`}>
                  {getInitials(p.name)}
                </div>
                <span className="text-xs text-white/60 flex-1 truncate">{p.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                  p.role === 'tutor'
                    ? 'bg-edu-blue/10 text-edu-blue border-edu-blue/20'
                    : 'bg-white/[0.05] text-white/30 border-white/[0.08]'
                }`}>{p.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}