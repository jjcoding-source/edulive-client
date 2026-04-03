'use client'
import { useEffect, useState }           from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setQuiz, setCurrentIndex, answerQuestion,
  toggleFlag, tickTimer, submitQuiz as submitQuizAction, resetQuiz,
} from '@/store/slices/quizSlice'
import Topbar     from '@/components/layout/Topbar'
import QuizService from '@/services/quiz.service'
import {
  Flag, ChevronLeft, ChevronRight,
  Zap, CheckCircle, XCircle, Loader2, BookOpen,
} from 'lucide-react'
import { formatTime } from '@/lib/utils'

export default function QuizzesPage() {
  const dispatch = useAppDispatch()
  const { quiz, currentIndex, attempts, timeLeft, isSubmitted, score } =
    useAppSelector(s => s.quiz)

  const [quizList,        setQuizList]        = useState<any[]>([])
  const [loadingList,     setLoadingList]     = useState(true)
  const [started,         setStarted]         = useState(false)
  const [submitting,      setSubmitting]      = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [serverResult,    setServerResult]    = useState<any>(null)

  // Load quiz list
  useEffect(() => {
    QuizService.getAll()
      .then(res => setQuizList(res.data.data))
      .catch(console.error)
      .finally(() => setLoadingList(false))

    return () => { dispatch(resetQuiz()) }
  }, [dispatch])

  // Timer
  useEffect(() => {
    if (!started || isSubmitted || timeLeft === 0) return
    const t = setInterval(() => dispatch(tickTimer()), 1000)
    if (timeLeft === 0) handleSubmit()
    return () => clearInterval(t)
  }, [started, isSubmitted, timeLeft, dispatch])

  const startQuiz = async (quizId: string) => {
    try {
      const res = await QuizService.getById(quizId)
      dispatch(setQuiz(res.data.data))
      setStarted(true)
      setShowExplanation(false)
      setServerResult(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load quiz')
    }
  }

  const handleAnswer = (optId: string) => {
    if (isSubmitted) return
    dispatch(answerQuestion({ questionId: quiz!.questions[currentIndex]._id, answer: optId }))
    setShowExplanation(false)
  }

  const handleSubmit = async () => {
    if (!quiz || submitting) return
    setSubmitting(true)
    try {
      const answers = Object.values(attempts).map(a => ({
        questionId: a.questionId,
        answer:     a.answer,
        flagged:    a.flagged,
      }))
      const res = await QuizService.submit(quiz._id, { answers })
      const result = res.data.data
      setServerResult(result)
      dispatch(submitQuizAction(result.score))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatus = (qId: string) => {
    if (!quiz) return 'unanswered'
    if (quiz.questions[currentIndex]._id === qId) return 'current'
    if (attempts[qId]?.flagged)  return 'flagged'
    if (attempts[qId]?.answer)   return 'answered'
    return 'unanswered'
  }

  const statusStyles: Record<string, string> = {
    answered:   'bg-edu-green/15 text-edu-green border-edu-green/30',
    current:    'bg-edu-blue text-white border-edu-blue',
    flagged:    'bg-edu-amber/12 text-edu-amber border-edu-amber/25',
    unanswered: 'bg-white/[0.05] text-white/35 border-white/[0.08]',
  }

  // ── Quiz list ──────────────────────────────────────────────────
  if (!started) {
    return (
      <div>
        <Topbar title="Quizzes" subtitle="Test your knowledge with subject quizzes" />
        <div className="p-8">
          {loadingList ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          ) : quizList.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No quizzes available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {quizList.map((q: any) => (
                <div key={q._id} className="edu-card p-6 flex flex-col">
                  <div className="w-12 h-12 bg-edu-blue/10 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-edu-blue" />
                  </div>
                  <h3 className="font-display font-bold text-base mb-1">{q.title}</h3>
                  <p className="text-xs text-white/35 mb-4">{q.subject}</p>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                      { label: 'Questions', val: q.questions?.length ?? '?' },
                      { label: 'Duration',  val: `${q.duration}m` },
                      { label: 'Marks',     val: q.questions?.reduce((a: number, b: any) => a + (b.marks ?? 4), 0) ?? '?' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.04] rounded-xl p-2 text-center">
                        <div className="font-display text-base font-bold">{s.val}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => startQuiz(q._id)} className="edu-btn-primary text-sm mt-auto">
                    Start Quiz →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!quiz) return null

  const q       = quiz.questions[currentIndex]
  const attempt = attempts[q._id]

  // ── Result screen ──────────────────────────────────────────────
  if (isSubmitted && serverResult) {
    const pct = serverResult.percentage ?? 0
    return (
      <div>
        <Topbar title="Quiz Result" />
        <div className="p-8 flex items-center justify-center min-h-[70vh]">
          <div className="edu-card p-10 text-center max-w-md w-full">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${pct >= 60 ? 'bg-edu-green/15' : 'bg-edu-red/15'}`}>
              {pct >= 60
                ? <CheckCircle className="w-10 h-10 text-edu-green" />
                : <XCircle    className="w-10 h-10 text-edu-red"   />}
            </div>
            <h2 className="font-display text-4xl font-bold mb-2">{pct}%</h2>
            <p className="text-white/40 text-sm mb-2">
              {serverResult.score} / {serverResult.totalMarks} marks
            </p>
            <p className={`text-sm font-medium mb-8 ${pct >= 60 ? 'text-edu-green' : 'text-edu-red'}`}>
              {pct >= 60 ? '🎉 Great job!' : '📚 Keep practicing!'}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                <div className="text-edu-green font-bold text-lg">
                  {serverResult.answers.filter((a: any) => a.isCorrect).length}
                </div>
                <div className="text-[10px] text-white/30 mt-1">Correct</div>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                <div className="text-edu-red font-bold text-lg">
                  {serverResult.answers.filter((a: any) => !a.isCorrect && a.answer).length}
                </div>
                <div className="text-[10px] text-white/30 mt-1">Wrong</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { dispatch(resetQuiz()); setStarted(false); setServerResult(null) }}
                className="edu-btn-ghost flex-1 text-sm">
                Back to Quizzes
              </button>
              <button onClick={() => startQuiz(quiz._id)} className="edu-btn-primary flex-1 text-sm">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz interface ─────────────────────────────────────────────
  return (
    <div>
      <Topbar title="Quizzes" subtitle={quiz.title} />
      <div className="flex h-[calc(100vh-4rem)]">

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-edu-surface border-r border-white/[0.07] p-5 flex flex-col gap-5 overflow-y-auto">
          <div className="bg-edu-blue/[0.07] border border-edu-blue/15 rounded-xl p-4">
            <p className="font-display font-bold text-sm mb-0.5">{quiz.title}</p>
            <p className="text-xs text-white/30 mb-4">{quiz.subject} · {quiz.questions.length} questions</p>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm border-1.5 ${
                timeLeft < 300
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-edu-blue/15 border-edu-blue/25 text-edu-blue'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <div>
                <p className="text-sm text-white/60 font-medium">Time Left</p>
                <p className="text-xs text-white/30">{quiz.duration} min total</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-white/30 mb-1">
                <span>Progress</span>
                <span>{Object.values(attempts).filter(a => a.answer).length}/{quiz.questions.length}</span>
              </div>
              <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full bg-edu-blue rounded-full transition-all"
                  style={{ width: `${(Object.values(attempts).filter(a => a.answer).length / quiz.questions.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-3">Navigator</p>
            <div className="grid grid-cols-5 gap-1.5">
              {quiz.questions.map((qItem, i) => (
                <button key={qItem._id}
                  onClick={() => { dispatch(setCurrentIndex(i)); setShowExplanation(!!attempts[qItem._id]?.answer) }}
                  className={`w-9 h-9 rounded-lg text-xs font-medium border transition-colors ${statusStyles[getStatus(qItem._id)]}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { color: 'bg-edu-green/30',  label: 'Answered'      },
              { color: 'bg-edu-blue',      label: 'Current'       },
              { color: 'bg-edu-amber/30',  label: 'Flagged'       },
              { color: 'bg-white/[0.08]',  label: 'Not attempted' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-white/40">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="edu-btn-primary text-sm mt-auto flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Quiz'}
          </button>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full bg-edu-blue/10 border border-edu-blue/20 text-edu-blue">
                  {q.type === 'mcq' ? 'MCQ' : 'Subjective'}
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-edu-green/10 border border-edu-green/20 text-edu-green">
                  +{q.marks} / −{q.negativeMarks ?? 1}
                </span>
              </div>
              <button onClick={() => dispatch(toggleFlag(q._id))}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  attempt?.flagged
                    ? 'bg-edu-amber/10 border-edu-amber/25 text-edu-amber'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60'
                }`}>
                <Flag className="w-3 h-3" />
                {attempt?.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            <p className="text-xs text-white/30 mb-3">Question {currentIndex + 1} of {quiz.questions.length}</p>
            <h2 className="font-display text-xl font-semibold leading-relaxed mb-7">{q.text}</h2>

            <div className="flex flex-col gap-3">
              {q.options?.map((opt: any) => {
                const isSelected = attempt?.answer === opt.id
                const isCorrect  = showExplanation && opt.id === q.correctOption
                const isWrong    = showExplanation && isSelected && !isCorrect
                return (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)}
                    disabled={isSubmitted}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isCorrect  ? 'bg-edu-green/10 border-edu-green/30' :
                      isWrong    ? 'bg-red-500/08 border-red-500/25'     :
                      isSelected ? 'bg-edu-blue/10 border-edu-blue'      :
                                   'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15'
                    }`}>
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      isCorrect  ? 'border-edu-green bg-edu-green/15 text-edu-green' :
                      isWrong    ? 'border-red-400 bg-red-500/10 text-red-400'       :
                      isSelected ? 'border-edu-blue bg-edu-blue/15 text-edu-blue'    :
                                   'border-white/15 text-white/35'
                    }`}>
                      {opt.id}
                    </div>
                    <span className={`text-sm ${isSelected || isCorrect ? 'text-white/90' : 'text-white/65'}`}>
                      {opt.text}
                    </span>
                  </button>
                )
              })}
            </div>

            {showExplanation && q.explanation && (
              <div className="mt-6 bg-edu-green/[0.07] border border-edu-green/20 rounded-2xl p-5 fade-in">
                <p className="text-xs font-medium text-edu-green mb-2">Explanation</p>
                <p className="text-sm text-white/55 leading-relaxed">{q.explanation}</p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  dispatch(setCurrentIndex(currentIndex - 1))
                  setShowExplanation(!!attempts[quiz.questions[currentIndex - 1]?._id]?.answer)
                }}
                className="edu-btn-ghost flex items-center gap-2 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {currentIndex < quiz.questions.length - 1
                ? <button onClick={() => {
                    dispatch(setCurrentIndex(currentIndex + 1))
                    setShowExplanation(!!attempts[quiz.questions[currentIndex + 1]?._id]?.answer)
                  }}
                  className="edu-btn-primary flex items-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
                : <button onClick={handleSubmit} disabled={submitting}
                  className="edu-btn-primary flex items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Quiz
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}