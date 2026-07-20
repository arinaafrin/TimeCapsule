import { apiClient } from './client';
import type { Journey, CreateJourneyPayload } from '../types/journey';

interface JourneyListResponse {
  data: Journey[];
}

interface JourneyResponse {
  data: Journey;
}

export const journeysApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listJourneys: builder.query<Journey[], void>({
      query: () => '/journeys',
      transformResponse: (response: JourneyListResponse) => response.data,
      providesTags: ['Journey'],
    }),
    getJourney: builder.query<Journey, string>({
      query: (id) => `/journeys/${id}`,
      transformResponse: (response: JourneyResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Journey', id }],
    }),
    createJourney: builder.mutation<Journey, CreateJourneyPayload>({
      query: (body) => ({ url: '/journeys', method: 'POST', body }),
      transformResponse: (response: JourneyResponse) => response.data,
      invalidatesTags: ['Journey'],
    }),
  }),
});

export const { useListJourneysQuery, useGetJourneyQuery, useCreateJourneyMutation } = journeysApi;
