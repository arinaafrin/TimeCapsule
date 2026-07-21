import { Link } from 'react-router-dom';
import { useListExperiencesQuery } from '../../api/experiencesApi';
import { ExperienceCard } from './ExperienceCard';

export function MyExperiencesPage() {
  const { data: experiences = [], isLoading } = useListExperiencesQuery({ mine: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My experiences</h1>
        <Link to="/explorer" className="text-sm font-medium text-slate-600 underline hover:text-slate-900">
          ← Back to Explorer
        </Link>
      </div>
      <p className="mt-2 text-slate-500">
        Every TimeCapsule you've created, including drafts and anything still pending review.
      </p>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-slate-400">Loading your experiences...</p>}

        {!isLoading && experiences.length === 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              You haven&apos;t created any experiences yet. Start one from the Explorer.
            </p>
          </div>
        )}

        {experiences.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
    </div>
  );
}
