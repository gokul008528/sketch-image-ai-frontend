import { Link } from 'react-router-dom'
import CompareSlider from '../components/CompareSlider'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    label: 'Upload',
    title: 'Any sketch, any format',
    body: 'Drop in a photo of a napkin sketch, a scanned line drawing, or digital line art. PNG, JPG, or WebP.',
  },
  {
    label: 'Generate',
    title: 'Multiple directions at once',
    body: 'Every upload renders several variations side by side, so you can compare directions before committing.',
  },
  {
    label: 'Refine',
    title: 'Style, palette, and quality controls',
    body: 'Steer the render toward photoreal, cinematic, or product-shot lighting — and lock in a color palette.',
  },
  {
    label: 'Keep',
    title: 'Full history, always accessible',
    body: 'Every generation is saved to your account with the original sketch, so nothing gets lost between sessions.',
  },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-fadeUp">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-panelBorder bg-panel px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sageBright" />
              <span className="font-mono text-xs text-graphite">for artists & design teams</span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-chalk md:text-5xl">
              Every line you draw
              <br />
              becomes <span className="text-marker">something real.</span>
            </h1>
            <p className="mt-5 max-w-md text-graphite">
              Sketch2Real reads the structure of your line art and rebuilds it in photoreal
              detail — same composition, same intent, new material.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/studio' : '/register'} className="btn-primary">
                {user ? 'Open the studio' : 'Start converting — free'}
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </div>
          </div>

          <div className="animate-fadeUp [animation-delay:120ms]">
            <CompareSlider
              beforeSrc="https://images.unsplash.com/photo-1602928321679-560bb453f190?w=900&q=80"
              afterSrc="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=80"
            />
            <p className="mt-3 text-center font-mono text-xs text-graphite">
              drag the divider — this is the actual output, not a mockup
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-panelBorder/60 bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold text-chalk">From line to light</h2>
          <p className="mt-2 max-w-lg text-graphite">
            Four steps, no manual color work, no re-drawing. Just guidance on where the render should lean.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-panelBorder bg-panelBorder sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-canvas p-6">
                <span className="font-mono text-xs uppercase tracking-wider text-marker">{f.label}</span>
                <h3 className="mt-3 font-display text-lg font-medium text-chalk">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-panelBorder/60">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-2xl font-semibold text-chalk md:text-3xl">
            Your sketchbook has ideas worth rendering.
          </h2>
          <div className="mt-7">
            <Link to={user ? '/studio' : '/register'} className="btn-primary">
              {user ? 'Open the studio' : 'Create your free account'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
