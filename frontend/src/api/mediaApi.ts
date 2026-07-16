import { apiClient } from './client';
import type { MediaAsset, MediaAssetType, MediaSourceType } from '../types/media';

interface MediaListResponse {
  data: MediaAsset[];
}

interface MediaResponse {
  data: MediaAsset;
}

interface GenerateMediaResponse {
  job_id: string;
  status: string;
}

export interface UploadMediaPayload {
  experienceId: string;
  type: MediaAssetType;
  sourceType: MediaSourceType;
  attributionText?: string;
  file: File;
}

export const mediaApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listMedia: builder.query<MediaAsset[], string>({
      query: (experienceId) => `/experiences/${experienceId}/media`,
      transformResponse: (response: MediaListResponse) => response.data,
      providesTags: (_result, _error, experienceId) => [{ type: 'Media', id: experienceId }],
    }),
    uploadMedia: builder.mutation<MediaAsset, UploadMediaPayload>({
      query: ({ experienceId, type, sourceType, attributionText, file }) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('source_type', sourceType);
        if (attributionText) formData.append('attribution_text', attributionText);
        formData.append('file', file);

        return {
          url: `/experiences/${experienceId}/media`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: MediaResponse) => response.data,
      invalidatesTags: (_result, _error, { experienceId }) => [{ type: 'Media', id: experienceId }],
    }),
    generateMedia: builder.mutation<GenerateMediaResponse, string>({
      query: (experienceId) => ({
        url: `/experiences/${experienceId}/generate-media`,
        method: 'POST',
      }),
    }),
  }),
});

export const { useListMediaQuery, useUploadMediaMutation, useGenerateMediaMutation } = mediaApi;
