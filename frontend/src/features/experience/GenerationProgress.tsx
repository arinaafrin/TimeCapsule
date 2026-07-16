import { useEffect } from 'react';
import { useAiJobPolling } from '../../hooks/useAiJobPolling';

interface GenerationProgressProps {
  jobId: string;
  onComplete?: () => void;
}

const STATUS_MESSAGES: Record<string, string> = {
  queued: 'Your TimeCapsule is queued for generation...',
  processing: 'Generating your TimeCapsule — writing the narration and gathering imagery...',
  completed: 'Your TimeCapsule is ready!',
  failed: 'Something went wrong generating this TimeCapsule.',
};

export function GenerationProgress({ jobId, onComplete }: GenerationProgressProps) {
  const { job, isLoading, isDone, isFailed } = useAiJobPolling(jobId);

  useEffect(() => {
    if (isDone) {
      onComplete?.();
    }
  }, [isDone, onComplete]);

  if (isLoading && !job) {
    return (
      <div data-testid="generation-progress" className="rounded-md border border-slate-200 p-4">
        <p className="text-sm text-slate-500">Checking generation status...</p>
      </div>
    );
  }

  const status = job?.status ?? 'queued';

  return (
    <div
      data-testid="generation-progress"
      className={`rounded-md border p-4 ${
        isFailed
          ? 'border-red-200 bg-red-50'
          : isDone
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {!isDone && !isFailed && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
            aria-hidden="true"
          />
        )}
        <p
          className={`text-sm font-medium ${
            isFailed ? 'text-red-700' : isDone ? 'text-emerald-700' : 'text-slate-700'
          }`}
        >
          {STATUS_MESSAGES[status]}
        </p>
      </div>
      {isFailed && job?.error_message && (
        <p className="mt-2 text-xs text-red-500">{job.error_message}</p>
      )}
    </div>
  );
}
