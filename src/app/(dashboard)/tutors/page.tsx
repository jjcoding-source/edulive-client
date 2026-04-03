'use client'
import { useEffect, useState }  from 'react'
import Topbar                   from '@/components/layout/Topbar'
import TutorService             from '@/services/tutor.service'
import SessionService           from '@/services/session.service'
import { Star, Loader2, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getInitials, avatarColor } from '@/lib/utils'
import { useAppSelector }       from '@/store/hooks'

const SUBJECTS  = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']
const DAYS      = ['Su','Mo','Tu','We','Th','Fr','Sa']
const SLOTS     = ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','5:00 PM']

export default function TutorsPage() {
  const { user } = useAppSelector(s => s.auth)
  const [tutors,    setTutors]    = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [subject,   setSubject]   = useState('All')
  const [selected,  setSelected]  = useState<any | null>(null)
  const [tutorSessions, setTutorSessions] = useState<any[]>([])
  const [selectedSlot,  setSelectedSlot]  = useState<string>(SLOTS[1])
  const [booked,    setBooked]    = useState(false)
  const [booking,   setBooking]   = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [review,    setReview]    = useState({ rating: 5, text: '' })
  const [showReview,setShowReview]= useState(false)

  useEffect(() => {
    const params = subject !== 'All' ? { subject } : undefined
    setLoading(true)
    TutorService.getAll(params)
      .then(res => setTutors(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [subject])

  const openProfile = async (tutor: any) => {
    setSelected(tutor)
    setBooked(false)
    setShowReview(false)
    try {
      const res = await TutorService.getSessions(tutor._id)
      setTutorSessions(res.data.data)
    } catch { setTutorSessions([]) }
  }

  const handleBook = async () => {
    if (!selected || !selectedSlot) return
    setBooking(true)
    try {
      
      const session = tutorSessions[0]
      if (session) {
        await SessionService.join(session._id)
      }
      setBooked(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  const handleReview = async () => {
    if (!selected || !review.text.trim()) return
    setReviewing(true)
    try {
      await TutorService.addReview(selected._id, review)
      // Update local rating display
      setSelected((prev: any) => ({
        ...prev,
        rating: Math.round(((prev.rating * prev.totalRatings + review.rating) / (prev.totalRatings + 1)) * 10) / 10,
        totalRatings: prev.totalRatings + 1,
      }))
      setShowReview(false)
      setReview({ rating: 5, text: '' })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div>
      <Topbar title="Find a Tutor" subtitle="Browse and book sessions with expert tutors" />
      <div className="p-8">

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-7">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                subject === s
                  ? 'bg-edu-blue/12 border-edu-blue/30 text-edu-blue'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/45 hover:text-white/70'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/25 text-sm">No tutors found{subject !== 'All' ? ` for ${subject}` : ''}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {tutors.map(t => (
              <div key={t._id} className="edu-card p-5 flex flex-col hover:border-white/[0.13] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(t.name)}`}>
                    {getInitials(t.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-white truncate">{t.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{t.subjects?.join(' · ')}</p>
                  </div>
                  <div className="flex items-center gap-1 text-edu-amber text-xs font-medium flex-shrink-0">
                    <Star className="w-3 h-3 fill-edu-amber" />
                    {t.rating?.toFixed(1) ?? '—'}
                  </div>
                </div>

                {t.bio && (
                  <p className="text-xs text-white/35 leading-relaxed mb-3 line-clamp-2">{t.bio}</p>
                )}

                <div className="flex gap-1.5 flex-wrap mb-4">
                  {(t.subjects ?? []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-white/40">{tag}</span>
                  ))}
                </div>

                <div className="flex border-t border-white/[0.06] pt-3 mb-3">
                  <div className="flex-1 text-center">
                    <div className="font-display text-sm font-bold">{t.totalRatings ?? 0}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">Reviews</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="font-display text-sm font-bold">{t.rating?.toFixed(1) ?? '—'}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">Rating</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="font-display text-sm font-bold">{t.subjects?.length ?? 0}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">Subjects</div>
                  </div>
                </div>

                <button onClick={() => openProfile(t)}
                  className="mt-auto w-full py-2.5 bg-edu-blue/10 border border-edu-blue/20 rounded-xl text-xs font-medium text-edu-blue hover:bg-edu-blue/20 transition-colors">
                  View Profile & Book
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Profile modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-edu-card border border-white/[0.1] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/[0.07]">
                <h2 className="font-display font-bold text-lg">Tutor Profile</h2>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/10">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="grid grid-cols-[1fr_300px]">
                {/* Left: profile */}
                <div className="p-6 border-r border-white/[0.07]">
                  <div className="flex gap-4 mb-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${avatarColor(selected.name)}`}>
                      {getInitials(selected.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold">{selected.name}</h3>
                      <p className="text-sm text-white/40 mt-0.5">{selected.subjects?.join(' · ')}</p>
                    </div>
                    <div className="text-center">
                      <div className="font-display text-3xl font-bold text-edu-amber">
                        {selected.rating?.toFixed(1) ?? '—'}
                      </div>
                      <div className="text-edu-amber text-xs">★★★★★</div>
                      <div className="text-[10px] text-white/25 mt-1">{selected.totalRatings} reviews</div>
                    </div>
                  </div>

                  {selected.bio && (
                    <p className="text-sm text-white/50 leading-relaxed mb-5">{selected.bio}</p>
                  )}

                  {/* Tutor's upcoming sessions */}
                  {tutorSessions.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Upcoming Sessions</p>
                      {tutorSessions.slice(0, 3).map((s: any) => (
                        <div key={s._id} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                          <div>
                            <p className="text-sm text-white/70">{s.title}</p>
                            <p className="text-xs text-white/30 mt-0.5">
                              {new Date(s.startTime).toLocaleString('en-IN', {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            s.status === 'live'
                              ? 'text-red-400 border-red-500/20 bg-red-500/10'
                              : 'text-white/30 border-white/[0.08] bg-white/[0.04]'
                          }`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review form (students only) */}
                  {user?.role === 'student' && (
                    showReview ? (
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                        <p className="text-sm font-medium mb-3">Leave a Review</p>
                        <div className="flex gap-2 mb-3">
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setReview(r => ({ ...r, rating: n }))}
                              className={`text-xl transition-colors ${n <= review.rating ? 'text-edu-amber' : 'text-white/20'}`}>
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={review.text}
                          onChange={e => setReview(r => ({ ...r, text: e.target.value }))}
                          className="edu-input resize-none h-20 text-xs mb-3"
                          placeholder="Share your experience with this tutor..."
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setShowReview(false)} className="edu-btn-ghost text-xs flex-1">
                            Cancel
                          </button>
                          <button onClick={handleReview} disabled={reviewing}
                            className="edu-btn-primary text-xs flex-1 flex items-center justify-center gap-2">
                            {reviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Submit Review
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowReview(true)}
                        className="edu-btn-ghost text-sm w-full">
                        ★ Leave a Review
                      </button>
                    )
                  )}
                </div>

                {/* Right: booking */}
                <div className="p-6">
                  <h3 className="font-display font-semibold text-sm mb-5">Book a Session</h3>

                  {booked ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-edu-green/15 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-edu-green" />
                      </div>
                      <p className="font-display font-bold text-lg mb-1">Booked!</p>
                      <p className="text-sm text-white/40 mt-1">{selectedSlot}</p>
                      <p className="text-xs text-white/25 mt-0.5">with {selected.name}</p>
                      <button onClick={() => setSelected(null)} className="edu-btn-primary text-sm mt-6 w-full">
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Simple calendar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <div className="flex gap-1">
                            <button className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center text-white/40">
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center text-white/40">
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                          {DAYS.map(d => <div key={d} className="text-center text-[9px] text-white/20 py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }, (_, i) => (
                            <div key={`e${i}`} />
                          ))}
                          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => {
                            const day     = i + 1
                            const today   = new Date().getDate()
                            const isPast  = day < today
                            const isTod   = day === today
                            return (
                              <div key={day}
                                className={`h-8 flex items-center justify-center text-xs rounded-lg cursor-pointer ${
                                  isTod    ? 'bg-edu-blue text-white' :
                                  isPast   ? 'text-white/15 cursor-not-allowed' :
                                             'bg-edu-green/12 text-edu-green hover:bg-edu-green/20'
                                }`}>
                                {day}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mb-5">
                        <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2.5">Available Slots</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {SLOTS.map(slot => (
                            <button key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 text-[11px] rounded-lg border transition-colors ${
                                slot === selectedSlot
                                  ? 'bg-edu-blue text-white border-edu-blue'
                                  : 'bg-edu-green/10 text-edu-green border-edu-green/20 hover:bg-edu-green/20'
                              }`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button onClick={handleBook} disabled={booking}
                        className="edu-btn-primary w-full text-sm flex items-center justify-center gap-2">
                        {booking
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
                          : `Confirm · ${selectedSlot}`}
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