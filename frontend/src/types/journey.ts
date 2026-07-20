import type { City } from './city';
import type { Experience } from './experience';

export type JourneyStatus = 'draft' | 'pending_review' | 'published';

export interface JourneyStop {
  id: string;
  sequence_order: number;
  stop_latitude: number | null;
  stop_longitude: number | null;
  experience: Experience | Record<string, never>;
}

export interface Journey {
  id: string;
  title: string;
  description: string | null;
  city: City | Record<string, never>;
  city_id: string;
  status: JourneyStatus;
  created_by: string;
  stops: JourneyStop[];
  created_at: string;
}

export interface CreateJourneyStopPayload {
  year: number;
  era_label?: string;
  stop_latitude?: number;
  stop_longitude?: number;
}

export interface CreateJourneyPayload {
  title: string;
  description?: string;
  city_id: string;
  stops: CreateJourneyStopPayload[];
}
