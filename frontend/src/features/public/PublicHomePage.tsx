import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../auth/authSlice';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconLayers, IconMap, IconShieldCheck, IconSparkles, IconCompass } from '../../components/ui/icons';

const FEATURES = [
  {
    icon: IconMap,
    title: 'Journeys, not single scenes',
    body:
      'A Journey is a themed walking route made of multiple Stops — each one a real coordinate, a real year, and its own reconstructed environment, the way a genuine guided time-travel walk actually works.',
  },
  {
    icon: IconLayers,
    title: 'Past, present, and imagined future',
    body:
      'Every Stop can show a place as it was, as it is today, or — clearly labeled as speculative — how it might look decades from now, grounded in real planning and climate data.',
  },
  {
    icon: IconShieldCheck,
    title: 'Historian-reviewed, not just generated',
    body:
      'Content moves through a moderation workflow before publishing, so what you experience is checked, sourced, and accountable — not an unverified AI guess.',
  },
  {
    icon: IconCompass,
    title: 'Built for small cities first',
    body:
      'Turnkey enough for a municipality or museum to run a real pilot, starting with the small cities every big platform ignores.',
  },
];

export function PublicHomePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)]">
      {/* Top nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-600)] text-white">
            <IconSparkles width={16} height={16} />
          </div>
          <span className="text-base font-bold tracking-tight">TimeCapsule</span>
        </div>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/explorer">
              <Button size="sm">Go to Explorer</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-10 text-center">
        <span className="tc-badge tc-badge-brand mb-5">Immersive time-travel tourism</span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-ink-900)] sm:text-5xl">
          Walk through who we were.
          <br />
          Walk into who we&apos;ll become.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-ink-500)]">
          TimeCapsule turns a real place — a street, a square, a city — into a walkable 360°
          journey through its past, its present, and an imagined future, starting with the small
          cities the rest of the industry overlooks.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to={isAuthenticated ? '/explorer' : '/register'}>
            <Button className="px-6">Start exploring</Button>
          </Link>
          <Link to="/journeys">
            <Button variant="secondary" className="px-6">
              Browse journeys
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="tc-card-hover">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
                <f.icon />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-ink-900)]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-500)]">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="tc-card flex flex-col items-center gap-4 bg-[var(--color-brand-600)] px-8 py-12 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-xl font-bold">Bring TimeCapsule to your city</h2>
            <p className="mt-1 text-sm text-[var(--color-brand-100)]">
              For museums, tourism boards, and municipalities ready to pilot an immersive journey.
            </p>
          </div>
          <Link to="/register">
            <Button variant="secondary" className="shrink-0">
              Partner with us
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--color-line)] py-8 text-center text-xs text-[var(--color-ink-300)]">
        © {new Date().getFullYear()} TimeCapsule. Built in Vaasa, Finland.
      </footer>
    </div>
  );
}
