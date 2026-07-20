import { apiClient } from './client';
import type { Experience } from '../types/experience';

interface ExperienceListResponse {
  data: Experience[];
}

export const favoritesApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listFavorites: builder.query<Experience[], void>({
      query: () => '/me/favorites',
      transformResponse: (response: ExperienceListResponse) => response.data,
      providesTags: ['Favorite'],
    }),
    addFavorite: builder.mutation<void, string>({
      query: (experienceId) => ({
        url: `/experiences/${experienceId}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorite'],
    }),
    removeFavorite: builder.mutation<void, string>({
      query: (experienceId) => ({
        url: `/experiences/${experienceId}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorite'],
    }),
  }),
});

export const {
  useListFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
