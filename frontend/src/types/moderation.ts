export type ModerationAction = 'approved' | 'rejected' | 'comment';

export interface ModerationLog {
  id: string;
  experience_id: string;
  reviewer_id: string;
  action: ModerationAction;
  notes: string | null;
  created_at: string;
}
