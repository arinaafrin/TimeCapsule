import { useParams } from 'react-router-dom';
import { useGetJourneyQuery } from '../../api/journeysApi';
import { JourneyViewer } from '../viewer/JourneyViewer';

export function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: journey, isLoading } = useGetJourneyQuery(id ?? '', { skip: !id });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-slate-400">Loading journey...</p>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-slate-500">This journey could not be found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JourneyViewer journey={journey} />
    </div>
  );
}
