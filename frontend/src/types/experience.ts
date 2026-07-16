import type { City } from './city';

export type ExperienceStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

export interface StoryContent {
  id: string;
  narrative_script: string;
  description: string;
  audio_narration_url: string | null;
  ai_model_used: string | null;
  estimated_duration_seconds: number;
  created_at: string;
}

export interface Experience {
  id: string;
  city: City | Record<string, never>;
  city_id: string;
  year: number;
  era_label: string | null;
  status: ExperienceStatus;
  created_by: string | null;
  approved_by: string | null;
  google_maps_link: string | null;
  story_content: StoryContent | Record<string, never>;
  created_at: string;
  updated_at: string;
}
