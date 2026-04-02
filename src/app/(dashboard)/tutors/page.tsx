'use client'
import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Star, Clock, Users, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getInitials, avatarColor } from '@/lib/utils'

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']

const TUTORS = [
  {
    id:'t1', name:'Dr. Priya Sharma',  subject:'Mathematics · Physics',
    rating:4.9, students:1247, experience:'6 yr', satisfaction:98,
    tags:['Calculus','Mechanics','IIT-JEE'],  available:true,
    bio:'Ph.D. Mathematics, IIT Bombay. Specialist in real analysis and applied calculus. Former IIT faculty.',
    totalSessions:3890,
    reviews:[
      { name:'Arjun R.', rating:5, text:'Best calculus teacher I\'ve had. Explains integration by parts so intuitively!' },
      { name:'Sneha K.', rating:5, text:'Whiteboard sessions are incredibly engaging. Highly recommended.' },
    ],
  },
  {
    id:'t2', name:'Prof. Kiran Mehta',  subject:'Physics · Chemistry',
    rating:4.7, students:890,  experience:'9 yr', satisfaction:95,
    tags:['Thermodynamics','Organic','NEET'], available:false,
    bio:'9 years of teaching experience. Expert in NEET preparation with 200+ selections.',
    totalSessions:2100,
    reviews:[
      { name:'Rohit S.',   rating:5, text:'Amazing conceptual clarity. The thermodynamics sessions were excellent.' },
      { name:'Priya M.',   rating:4, text:'Very knowledgeable. Would love more solved examples in class.' },
    ],
  },
  {
    id:'t3', name:'Ms. Ananya Iyer',    subject:'Chemistry · Biology',
    rating:4.8, students:740,  experience:'4 yr', satisfaction:97,
    tags:['Organic Chem','Cell Bio','NEET'], available:true,
    bio:'Biochemistry graduate with passion for making organic chemistry approachable and fun.',
    totalSessions:1560,
    reviews:[
      { name:'Kavya R.',   rating:5, text:'She makes organic chemistry actually fun! Great visual explanations.' },
      { name:'Aryan S.',   rating:5, text:'My chemistry scores jumped 20% after just 3 sessions.' },
    ],
  },
]

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const CALENDAR: Record<string, 'available'|'booked'|'unavailable'|'selected'|'empty'> = {
  '0':'empty','1':'available','2':'available','3':'booked','4':'available','5':'available','6':'booked',
  '7':'unavailable','8':'available','9':'selected','10':'available','11':'booked','12':'available','13':'booked',
  '14':'unavailable','15':'available','16':'available','17':'available','18':'booked','19':'available','20':'unavailable',
  '21':'available','22':'available','23':'available','24':'booked','25':'available','26':'available','27':'unavailable',
  '28':'available','29':'available','30':'available',
}
const SLOTS = ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','5:00 PM']
const SLOT_STATUS = ['taken','open','selected','open','taken','open']

export default function TutorsPage() {
  const [activeSubject, setActiveSubject] = useState('All')
  const [selected, setSelected] = useState<typeof TUTORS[0] | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM')
  const [booked, setBooked] = useState(false)

  const filtered = TUTORS.filter(t =>
    activeSubject === 'All' || t.subject.includes(activeSubject)
  )

  return (
    <div>
      <Topbar title="Find a Tutor" subtitle="Browse and book sessions with expert tutors" />
      <div className="p-8">

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-7">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                activeSubject === s
                  ? 'bg-edu-blue/12 border-edu-blue/30 text-edu-blue'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/45 hover:text-white/70'
              }`}>
              {s}
            </button>
          ))}
          <button className="text-xs px-4 py-2 rounded-full border bg-edu-green/08 border-edu-green/20 text-edu-green">
            Available Now
          </button>
          <button className="text-xs px-4 py-2 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/45 hover:text-white/70">
            Top Rated
          </button>
        </div>

        {/* Tutor grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {filtered.map(t => (
            <div key={t.id} className="edu-card p-5 hover:border-white/[0.13] transition-colors flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(t.name)}`}>
                  {getInitials(t.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-white truncate">{t.name}</p>
                  <p className="text-xs text-white/35 mt-0.5">{t.subject}</p>
                </div>
                <div className="flex items-center gap-1 text-edu-amber text-xs font-medium flex-shrink-0">
                  <Star className="w-3 h-3 fill-edu-amber" /> {t.rating}
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap mb-4">
                {t.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-white/40">{tag}</span>
                ))}
              </div>

              <div className="flex border-t border-white/[0.06] pt-3 mb-3">
                {[
                  { val: t.students, label:'Students' },
                  { val: t.experience, label:'Experience' },
                  { val: `${t.satisfaction}%`, label:'Satisfaction' },
                ].map(s => (
                  <div key={s.label} className="flex-1 text-center">
                    <div className="font-display text-sm font-bold text-white">{s.val}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${t.available ? 'bg-edu-green' : 'bg-edu-red'}`} />
                <span className={t.available ? 'text-edu-green' : 'text-white/35'}>
                  {t.available ? 'Available Now' : 'In Session'}
                </span>
              </div>

              <button onClick={() => { setSelected(t); setBooked(false) }}
                className="mt-auto w-full py-2.5 bg-edu-blue/10 border border-edu-blue/20 rounded-xl text-xs font-medium text-edu-blue hover:bg-edu-blue/20 transition-colors">
                View Profile & Book
              </button>
            </div>
          ))}
        </div>

        {/* Profile + Booking modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-edu-card border border-white/[0.1] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/[0.07]">
                <h2 className="font-display font-bold text-lg">Tutor Profile</h2>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/10">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="grid grid-cols-[1fr_300px] gap-0">
                {/* Profile */}
                <div className="p-6 border-r border-white/[0.07]">
                  <div className="flex gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${avatarColor(selected.name)}`}>
                      {getInitials(selected.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold">{selected.name}</h3>
                      <p className="text-sm text-white/40 mt-0.5">{selected.subject}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {selected.tags.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-white/40">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-display text-3xl font-bold text-edu-amber">{selected.rating}</div>
                      <div className="text-edu-amber text-xs">★★★★★</div>
                      <div className="text-[10px] text-white/25 mt-1">312 reviews</div>
                    </div>
                  </div>

                  <p className="text-sm text-white/50 leading-relaxed mb-6">{selected.bio}</p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { val: selected.students, label:'Students Taught' },
                      { val: selected.totalSessions, label:'Sessions Done' },
                      { val: `${selected.satisfaction}%`, label:'Satisfaction' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                        <div className="font-display text-lg font-bold">{s.val}</div>
                        <div className="text-[10px] text-white/30 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-display font-semibold text-sm mb-3 text-white/60 uppercase tracking-wide text-xs">Recent Reviews</h4>
                  <div className="flex flex-col divide-y divide-white/[0.05]">
                    {selected.reviews.map(r => (
                      <div key={r.name} className="py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-white/70 font-medium">{r.name}</span>
                          <span className="text-xs text-edu-amber">{'★'.repeat(r.rating)}</span>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking */}
                <div className="p-6">
                  <h3 className="font-display font-semibold text-sm mb-5">Book a Session</h3>

                  {booked ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-edu-green/15 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-edu-green" />
                      </div>
                      <p className="font-display font-bold text-lg mb-1">Booked!</p>
                      <p className="text-sm text-white/40">Wed Apr 9 · {selectedSlot}</p>
                      <p className="text-xs text-white/25 mt-0.5">with {selected.name}</p>
                      <button onClick={() => setSelected(null)} className="edu-btn-primary text-sm mt-6 w-full">
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Calendar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">April 2026</span>
                          <div className="flex gap-1">
                            <button className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white/70">
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white/70">
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                          {DAYS.map(d => <div key={d} className="text-center text-[9px] text-white/20 py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {Array.from({ length: 31 }, (_, i) => {
                            const st = CALENDAR[String(i)]
                            if (!st || st === 'empty') return <div key={i} className="h-8" />
                            return (
                              <div key={i} className={`h-8 flex items-center justify-center text-xs rounded-lg cursor-pointer ${
                                st === 'selected'    ? 'bg-edu-blue text-white' :
                                st === 'available'   ? 'bg-edu-green/12 text-edu-green hover:bg-edu-green/20' :
                                st === 'booked'      ? 'bg-edu-blue/10 text-edu-blue/50' :
                                                       'text-white/15 cursor-default'
                              }`}>
                                {i + 1}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Time slots */}
                      <div className="mb-5">
                        <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2.5">Available Slots · Wed Apr 9</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {SLOTS.map((slot, i) => (
                            <button key={slot} onClick={() => SLOT_STATUS[i] === 'open' || SLOT_STATUS[i] === 'selected' ? setSelectedSlot(slot) : null}
                              className={`py-2 text-[11px] rounded-lg border transition-colors ${
                                slot === selectedSlot            ? 'bg-edu-blue text-white border-edu-blue' :
                                SLOT_STATUS[i] === 'taken'       ? 'bg-transparent text-white/15 border-white/[0.06] cursor-default line-through' :
                                                                   'bg-edu-green/10 text-edu-green border-edu-green/20 hover:bg-edu-green/20'
                              }`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button onClick={() => setBooked(true)} className="edu-btn-primary w-full text-sm">
                        Confirm · Apr 9, {selectedSlot}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}