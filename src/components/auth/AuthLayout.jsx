export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-marker">{eyebrow}</span>
          <h1 className="mt-2 font-display text-2xl font-semibold text-chalk">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-graphite">{subtitle}</p>}
        </div>
        <div className="card p-7">{children}</div>
      </div>
    </main>
  )
}
