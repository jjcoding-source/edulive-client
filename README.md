# EduLive — Frontend

Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Redux Toolkit · Socket.io

## Setup
npm install
cp .env.local.example .env.local   # add your API URL
npm run dev

## Pages
- `/`              Landing page
- `/login`         Login
- `/register`      Register (student/tutor)
- `/dashboard`     Student dashboard
- `/live/[roomId]` Live classroom
- `/quizzes`       Quiz interface
- `/tutors`        Browse & book tutors

## Git history
1. Global styles + Tailwind tokens
2. TypeScript types
3. Redux store (auth, classroom, quiz)
4. Socket.io client + Axios + utils
5. Root layout + Redux provider
6. Landing page
7. Auth pages (login + register)
8. Dashboard layout (Sidebar + Topbar)
9. Student dashboard
10. Live classroom
11. Quiz page
12. Tutors page
13. Env + README