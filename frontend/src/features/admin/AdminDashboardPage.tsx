import { Link } from 'react-router-dom';
import { useGetAdminStatsQuery } from '../../api/adminApi';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="tc-card p-4">
      <p className="text-2xl font-semibold text-[var(--color-ink-900)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">{label}</p>
    </div>
  );
}

function Breakdown({ title, entries }: { title: string; entries: Record<string, number> }) {
  return (
    <div className="tc-card p-4">
      <p className="text-sm font-semibold text-[var(--color-ink-900)]">{title}</p>
      <dl className="mt-2 space-y-1">
        {Object.entries(entries).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <dt className="capitalize text-[var(--color-ink-500)]">{key.replace('_', ' ')}</dt>
            <dd className="font-medium text-[var(--color-ink-900)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useGetAdminStatsQuery();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-ink-900)]">Admin dashboard</h1>
        <Link to="/moderation" className="text-sm font-medium text-slate-600 underline hover:text-slate-900">
          Moderation queue →
        </Link>
      </div>
      <p className="mt-2 text-[var(--color-ink-500)]">Platform-wide activity across every module.</p>

      {isLoading && <p className="mt-8 text-sm text-slate-400">Loading stats...</p>}
      {isError && (
        <p className="mt-8 text-sm text-red-600">Could not load admin stats. Are you logged in as an admin?</p>
      )}

      {stats && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Users" value={stats.users.total} />
            <StatCard label="Cities" value={stats.cities.total} />
            <StatCard label="Experiences" value={stats.experiences.total} />
            <StatCard label="Journeys" value={stats.journeys.total} />
            <StatCard label="AI generation jobs" value={stats.ai_generation_jobs.total} />
            <StatCard label="Favorites" value={stats.favorites.total} />
            <StatCard label="Partner organizations" value={stats.partner_organizations.total} />
            <StatCard label="Verified partners" value={stats.partner_organizations.verified} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Breakdown title="Experiences by status" entries={stats.experiences.by_status} />
            <Breakdown title="AI jobs by status" entries={stats.ai_generation_jobs.by_status} />
            <Breakdown title="Journeys by status" entries={stats.journeys.by_status} />
            <Breakdown title="Users by role" entries={stats.users.by_role} />
          </div>

          {stats.ai_generation_jobs.recent_failures.length > 0 && (
            <div className="mt-6 rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Recent generation failures</p>
              <ul className="mt-2 space-y-2">
                {stats.ai_generation_jobs.recent_failures.map((failure) => (
                  <li key={failure.id} className="text-sm text-red-700">
                    <span className="font-medium">{failure.city ?? 'Unknown city'}</span> — {failure.job_type}:{' '}
                    {failure.error_message ?? 'No error message recorded'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 tc-card p-4">
            <p className="text-sm font-semibold text-[var(--color-ink-900)]">Recent moderation activity</p>
            {stats.recent_moderation_activity.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No moderation actions yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {stats.recent_moderation_activity.map((entry) => (
                  <li key={entry.id} className="text-sm text-slate-600">
                    <span className="font-medium capitalize">{entry.action}</span>
                    {' — '}
                    {entry.city ?? 'Unknown city'}
                    {entry.era_label ? `, ${entry.era_label}` : ''}
                    {entry.reviewer_name ? ` by ${entry.reviewer_name}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
