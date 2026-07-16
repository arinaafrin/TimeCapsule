export type AiJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface AiGenerationJob {
  id: string;
  experience_id: string;
  status: AiJobStatus;
  job_type: 'story_text' | 'image' | 'full_bundle';
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}
