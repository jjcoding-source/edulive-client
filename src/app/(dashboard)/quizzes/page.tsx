'use client'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setQuiz, setCurrentIndex, answerQuestion, toggleFlag, tickTimer, submitQuiz } from '@/store/slices/quizSlice'
import Topbar from '@/components/layout/Topbar'
import { Flag, ChevronLeft, ChevronRight, Zap, CheckCircle, XCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import type { Quiz } from '@/types'

const DEMO_QUIZ: Quiz = {
  _id: 'q1', title: 'Chemistry Unit Test', subject: 'Chemistry', duration: 30,
  createdBy: 'tutor1',
  questions: [
    {
      _id: 'q1', type: 'mcq', marks: 4, negativeMarks: 1,
      text: 'Which correctly represents the product of the reaction between ethanol and acetic acid in the presence of concentrated H₂SO₄?',
      options: [
        { id:'A', text:'Acetaldehyde (CH₃CHO) + Water' },
        { id:'B', text:'Ethyl acetate (CH₃COOC₂H₅) + Water via esterification' },
        { id:'C', text:'Acetic anhydride + Ethylene' },
        { id:'D', text:'Ethylene glycol + Carbon dioxide' },
      ],
      correctOption: 'B',
      explanation: 'Esterification: Ethanol + Acetic acid → Ethyl acetate + H₂O in presence of H₂SO₄ catalyst.',
    },
    {
      _id: 'q2', type: 'mcq', marks: 4, negativeMarks: 1,
      text: 'The IUPAC name of CH₃–CH(OH)–CH₂–CH₃ is:',
      options: [
        { id:'A', text:'1-methylpropan-1-ol' },
        { id:'B', text:'butan-2-ol' },
        { id:'C', text:'2-butanol' },
        { id:'D', text:'sec-butanol' },
      ],
      correctOption: 'B',
      explanation: 'The parent chain is butane with -OH at C2, giving butan-2-ol.',
    },
    {
      _id: 'q3', type: 'mcq', marks: 4, negativeMarks: 1,
      text: 'Which of the following is NOT a characteristic of benzene?',
      options: [
        { id:'A', text:'Planar hexagonal structure' },
        { id:'B', text:'All C–C bond lengths are equal' },
        { id:'C', text:'Undergoes addition reactions readily' },
        { id:'D', text:'Delocalized π electrons' },
      ],
      correctOption: 'C',
      explanation: 'Benzene undergoes electrophilic substitution, not addition, due to aromatic stability.',
    },
  ],
}

export default function QuizzesPage() {
  const dispatch = useAppDispatch()
  const { quiz, currentIndex, attempts, timeLeft, isSubmitted, score } = useAppSelector(s => s.quiz)
  const [showExplanation, setShowExplanation] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    dispatch(setQuiz(DEMO_QUIZ))
  }, [])

  useEffect(() => {
    if (!started || isSubmitted || timeLeft === 0) return
    const timer = setInterval(() => dispatch(tickTimer()), 1000)
    return () => clearInterval(timer)
  }, [started, isSubmitted, timeLeft])

  if (!quiz) return null

  const q       = quiz.questions[currentIndex]
  const attempt = attempts[q._id]

  const handleAnswer = (optId: string) => {
    if (isSubmitted) return
    dispatch(answerQuestion({ questionId: q._id, answer: optId }))
    setShowExplanation(true)
  }

  const handleSubmit = () => {
    let total = 0
    quiz.questions.forEach(question => {
      const a = attempts[question._id]
      if (a?.answer === question.correctOption) total += question.marks
      else if (a?.answer && a.answer !== question.correctOption && question.negativeMarks)
        total -= question.negativeMarks
    })
    dispatch(submitQuiz(Math.max(0, total)))
  }

  const getStatus = (qId: string): 'answered' | 'current' | 'flagged' | 'unanswered' => {
    if (quiz.questions[currentIndex]._id === qId) return 'current'
    if (attempts[qId]?.flagged) return 'flagged'
    if (attempts[qId]?.answer) return 'answered'
    return 'unanswered'
  }

  const statusStyles = {
    answered:  'bg-edu-green/15 text-edu-green border-edu-green/30',
    current:   'bg-edu-blue text-white border-edu-blue',
    flagged:   'bg-edu-amber/12 text-edu-amber border-edu-amber/25',
    unanswered:'bg-white/[0.05] text-white/35 border-white/[0.08]',
  }

  if (!started) {
    return (
      <div>
        <Topbar title="Quizzes" />
        <div className="p-8 flex items-center justify-center min-h-[70vh]">
          <div className="edu-card p-10 text-center max-w-md">
            <div className="w-16 h-16 bg-edu-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap className="w-8 h-8 text-edu-blue" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">{quiz.title}</h2>
            <p className="text-white/40 text-sm mb-6">{quiz.subject} · {quiz.questions.length} Questions · {quiz.duration} min</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label:'Questions', val: quiz.questions.length },
                { label:'Duration',  val: `${quiz.duration}m` },
                { label:'Marks',     val: `${quiz.questions.reduce((a,b)=>a+b.marks,0)}` },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                  <div className="font-display text-xl font-bold">{s.val}</div>
                  <div className="text-[11px] text-white/30 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStarted(true)} className="edu-btn-primary w-full">
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    const total = quiz.questions.reduce((a,b)=>a+b.marks,0)
    const pct   = Math.round(((score ?? 0) / total) * 100)
    return (
      <div>
        <Topbar title="Quiz Result" />
        <div className="p-8 flex items-center justify-center min-h-[70vh]">
          <div className="edu-card p-10 text-center max-w-md">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${pct >= 60 ? 'bg-edu-green/15' : 'bg-edu-red/15'}`}>
              {pct >= 60
                ? <CheckCircle className="w-10 h-10 text-edu-green" />
                : <XCircle    className="w-10 h-10 text-edu-red"   />}
            </div>
            <h2 className="font-display text-3xl font-bold mb-1">{pct}%</h2>
            <p className="text-white/40 text-sm mb-6">
              {score} / {total} marks · {pct >= 60 ? 'Good job!' : 'Keep practicing!'}
            </p>
            <button onClick={() => { dispatch(setQuiz(DEMO_QUIZ)); setStarted(false); setShowExplanation(false) }}
              className="edu-btn-primary w-full">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar title="Quizzes" subtitle={quiz.title} />
      <div className="flex h-[calc(100vh-4rem)]">

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-edu-surface border-r border-white/[0.07] p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Meta */}
          <div className="bg-edu-blue/[0.07] border border-edu-blue/15 rounded-xl p-4">
            <p className="font-display font-bold text-sm mb-0.5">{quiz.title}</p>
            <p className="text-xs text-white/30 mb-4">{quiz.subject} · {quiz.questions.length} Questions</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-edu-blue/15 border border-edu-blue/25 flex items-center justify-center font-display font-bold text-edu-blue text-sm">
                {formatTime(timeLeft)}
              </div>
              <div>
                <p className="text-sm text-white/60 font-medium">Time Left</p>
                <p className="text-xs text-white/30">Started 10:00 AM</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-white/30 mb-1">
                <span>Progress</span>
                <span>{Object.keys(attempts).length}/{quiz.questions.length}</span>
              </div>
              <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full bg-edu-blue rounded-full transition-all"
                  style={{ width: `${(Object.keys(attempts).length / quiz.questions.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Navigator */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-3">Navigator</p>
            <div className="grid grid-cols-5 gap-1.5">
              {quiz.questions.map((qItem, i) => {
                const st = getStatus(qItem._id)
                return (
                  <button key={qItem._id}
                    onClick={() => { dispatch(setCurrentIndex(i)); setShowExplanation(false) }}
                    className={`w-9 h-9 rounded-lg text-xs font-medium border transition-colors ${statusStyles[st]}`}>
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {[
              { color:'bg-edu-green/30',  label:'Answered' },
              { color:'bg-edu-blue',      label:'Current'  },
              { color:'bg-edu-amber/30',  label:'Flagged'  },
              { color:'bg-white/[0.08]',  label:'Not attempted' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-white/40">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} className="edu-btn-primary text-sm mt-auto">
            Submit Quiz
          </button>
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full bg-edu-blue/10 border border-edu-blue/20 text-edu-blue">MCQ</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-edu-green/10 border border-edu-green/20 text-edu-green">+{q.marks} / −{q.negativeMarks}</span>
              </div>
              <button onClick={() => dispatch(toggleFlag(q._id))}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  attempt?.flagged
                    ? 'bg-edu-amber/10 border-edu-amber/25 text-edu-amber'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60'
                }`}>
                <Flag className="w-3 h-3" />
                {attempt?.flagged ? 'Flagged' : 'Flag for Review'}
              </button>
            </div>

            <p className="text-xs text-white/30 mb-3">Question {currentIndex + 1} of {quiz.questions.length}</p>
            <h2 className="font-display text-xl font-semibold leading-relaxed mb-7">{q.text}</h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {q.options?.map(opt => {
                const isSelected = attempt?.answer === opt.id
                const isCorrect  = showExplanation && opt.id === q.correctOption
                const isWrong    = showExplanation && isSelected && opt.id !== q.correctOption
                return (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)}
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

            {/* Explanation */}
            {showExplanation && q.explanation && (
              <div className="mt-6 bg-edu-green/[0.07] border border-edu-green/20 rounded-2xl p-5 fade-in">
                <p className="text-xs font-medium text-edu-green mb-2">Explanation</p>
                <p className="text-sm text-white/55 leading-relaxed">{q.explanation}</p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-8">
              <button
                disabled={currentIndex === 0}
                onClick={() => { dispatch(setCurrentIndex(currentIndex - 1)); setShowExplanation(!!attempts[quiz.questions[currentIndex - 1]?._id]?.answer) }}
                className="edu-btn-ghost flex items-center gap-2 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {currentIndex < quiz.questions.length - 1
                ? <button
                    onClick={() => { dispatch(setCurrentIndex(currentIndex + 1)); setShowExplanation(!!attempts[quiz.questions[currentIndex + 1]?._id]?.answer) }}
                    className="edu-btn-primary flex items-center gap-2">
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                : <button onClick={handleSubmit} className="edu-btn-primary">Submit Quiz</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}