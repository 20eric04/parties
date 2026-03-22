export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-parties-dark auth-glow">
      {children}
    </div>
  )
}
