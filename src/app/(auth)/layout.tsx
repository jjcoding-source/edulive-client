export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-edu-bg flex items-stretch">
      {children}
    </div>
  )
}