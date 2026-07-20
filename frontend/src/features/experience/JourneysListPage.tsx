import { Link } from 'react-router-dom';
import { useListJourneysQuery } from '../../api/journeysApi';

export function JourneysListPage() {
  const { data: journeys = [], isLoading } = useListJourneysQuery();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Journeys</h1>
      <p className="mt-2 text-slate-500">
        Guided walks through multiple eras of a city, one stop at a time.
      </p>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Loading journeys...</p>}

        {!isLoading && journeys.length === 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">No published journeys yet.</p>
          </div>
        )}

        {journeys.map((journey) => (
          <Link
            key={journey.id}
            to={`/journeys/${journey.id}`}
            className="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-400 hover:shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{journey.title}</h3>
            {journey.description && <p className="mt-1 text-sm text-slate-500">{journey.description}</p>}
            <p className="mt-2 text-xs text-slate-400">{journey.stops.length} stops</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
