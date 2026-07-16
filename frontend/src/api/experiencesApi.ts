import { apiClient } from './client';
import type { Experience } from '../types/experience';

interface ExperienceListResponse {
  data: Experience[];
}

interface ExperienceResponse {
  data: Experience;
}

export interface ExperienceListParams {
  city_id?: string;
  year?: number;
  status?: string;
}

export interface CreateExperiencePayload {
  city_id: string;
  year: number;
  era_label?: string;
  google_maps_link?: string;
}

export const experiencesApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listExperiences: builder.query<Experience[], ExperienceListParams | void>({
      query: (params) => ({ url: '/experiences', params: params ?? undefined }),
      transformResponse: (response: ExperienceListResponse) => response.data,
      providesTags: ['Experience'],
    }),
    getExperience: builder.query<Experience, string>({
      query: (id) => `/experiences/${id}`,
      transformResponse: (response: ExperienceResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Experience', id }],
    }),
    createExperience: builder.mutation<Experience, CreateExperiencePayload>({
      query: (body) => ({ url: '/experiences', method: 'POST', body }),
      transformResponse: (response: ExperienceResponse) => response.data,
      invalidatesTags: ['Experience'],
    }),
  }),
});

export const {
  useListExperiencesQuery,
  useGetExperienceQuery,
  useCreateExperienceMutation,
} = experiencesApi;
