export type MediaAssetType = 'panorama_360' | 'still_image' | 'thumbnail' | '3d_model';
export type MediaSourceType = 'ai_generated' | 'archival' | 'partner_upload';

export interface MediaAsset {
  id: string;
  experience_id: string;
  type: MediaAssetType;
  source_type: MediaSourceType;
  attribution_text: string | null;
  url: string;
  created_at: string;
}
