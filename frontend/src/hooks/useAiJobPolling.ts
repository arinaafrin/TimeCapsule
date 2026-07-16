import { useEffect, useState } from 'react';
import { useGetAiJobQuery } from '../api/aiJobsApi';
import type { AiJobStatus } from '../types/aiJob';

const TERMINAL_STATUSES: AiJobStatus[] = ['completed', 'failed'];
const POLL_INTERVAL_MS = 2000;

export function useAiJobPolling(jobId: string | null) {
  const [pollingInterval, setPollingInterval] = useState(POLL_INTERVAL_MS);

  const { data: job, isLoading, error } = useGetAiJobQuery(jobId ?? '', {
    skip: !jobId,
    pollingInterval,
  });

  useEffect(() => {
    if (job && TERMINAL_STATUSES.includes(job.status)) {
      setPollingInterval(0);
    }
  }, [job]);

  const isDone = job?.status === 'completed';
  const isFailed = job?.status === 'failed';
  const isPolling = Boolean(jobId) && !isDone && !isFailed;

  return { job, isLoading, error, isPolling, isDone, isFailed };
}
