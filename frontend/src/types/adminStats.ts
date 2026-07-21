export interface AdminStats {
  users: {
    total: number;
    by_role: { visitor: number; partner: number; admin: number };
  };
  cities: { total: number };
  experiences: {
    total: number;
    by_status: {
      draft: number;
      pending_review: number;
      approved: number;
      rejected: number;
      archived: number;
    };
  };
  journeys: {
    total: number;
    by_status: { draft: number; pending_review: number; published: number };
  };
  ai_generation_jobs: {
    total: number;
    by_status: { queued: number; processing: number; completed: number; failed: number };
    recent_failures: Array<{
      id: string;
      job_type: string;
      error_message: string | null;
      experience_id: string;
      city: string | null;
      failed_at: string | null;
    }>;
  };
  favorites: { total: number };
  partner_organizations: { total: number; verified: number; pending: number };
  recent_moderation_activity: Array<{
    id: string;
    action: 'approved' | 'rejected' | 'comment';
    notes: string | null;
    reviewer_name: string | null;
    experience_id: string;
    era_label: string | null;
    city: string | null;
    created_at: string | null;
  }>;
}
