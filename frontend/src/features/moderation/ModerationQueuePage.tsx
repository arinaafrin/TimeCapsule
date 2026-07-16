import { useGetModerationQueueQuery } from '../../api/moderationApi';
import { ModerationReviewCard } from './ModerationReviewCard';

export function ModerationQueuePage() {
  const { data: queue = [], isLoading } = useGetModerationQueueQuery();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Moderation queue</h1>
      <p className="mt-2 text-slate-500">
        Review AI-generated and partner-submitted TimeCapsules before they go live.
      </p>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-slate-400">Loading queue...</p>}

        {!isLoading && queue.length === 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Nothing pending review right now.</p>
          </div>
        )}

        {queue.map((experience) => (
          <ModerationReviewCard key={experience.id} experience={experience} />
        ))}
      </div>
    </div>
  );
}
