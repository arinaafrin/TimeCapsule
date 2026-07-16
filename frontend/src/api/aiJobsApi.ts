import { apiClient } from './client';
import type { AiGenerationJob } from '../types/aiJob';

interface GenerateResponse {
  job_id: string;
  status: string;
}

interface JobResponse {
  data: AiGenerationJob;
}

export const aiJobsApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    generateStory: builder.mutation<GenerateResponse, string>({
      query: (experienceId) => ({
        url: `/experiences/${experienceId}/generate`,
        method: 'POST',
      }),
    }),
    getAiJob: builder.query<AiGenerationJob, string>({
      query: (jobId) => `/ai-jobs/${jobId}`,
      transformResponse: (response: JobResponse) => response.data,
    }),
  }),
});

export const { useGenerateStoryMutation, useGetAiJobQuery } = aiJobsApi;
