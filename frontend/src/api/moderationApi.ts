import { apiClient } from './client';
import type { Experience } from '../types/experience';
import type { ModerationLog } from '../types/moderation';

interface ExperienceListResponse {
  data: Experience[];
}

interface ExperienceResponse {
  data: Experience;
}

interface ModerationLogListResponse {
  data: ModerationLog[];
}

export const moderationApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getModerationQueue: builder.query<Experience[], void>({
      query: () => '/moderation/queue',
      transformResponse: (response: ExperienceListResponse) => response.data,
      providesTags: ['ModerationQueue'],
    }),
    approveExperience: builder.mutation<Experience, { experienceId: string; notes?: string }>({
      query: ({ experienceId, notes }) => ({
        url: `/moderation/${experienceId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      transformResponse: (response: ExperienceResponse) => response.data,
      invalidatesTags: ['ModerationQueue'],
    }),
    rejectExperience: builder.mutation<Experience, { experienceId: string; notes: string }>({
      query: ({ experienceId, notes }) => ({
        url: `/moderation/${experienceId}/reject`,
        method: 'POST',
        body: { notes },
      }),
      transformResponse: (response: ExperienceResponse) => response.data,
      invalidatesTags: ['ModerationQueue'],
    }),
    commentOnExperience: builder.mutation<ModerationLog, { experienceId: string; notes: string }>({
      query: ({ experienceId, notes }) => ({
        url: `/moderation/${experienceId}/comment`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['ModerationQueue'],
    }),
    getModerationLogs: builder.query<ModerationLog[], string>({
      query: (experienceId) => `/moderation/${experienceId}/logs`,
      transformResponse: (response: ModerationLogListResponse) => response.data,
    }),
  }),
});

export const {
  useGetModerationQueueQuery,
  useApproveExperienceMutation,
  useRejectExperienceMutation,
  useCommentOnExperienceMutation,
  useGetModerationLogsQuery,
} = moderationApi;
