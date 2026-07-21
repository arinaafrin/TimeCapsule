import { apiClient } from './client';
import type { AdminStats } from '../types/adminStats';

interface AdminStatsResponse {
  data: AdminStats;
}

export const adminApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      transformResponse: (response: AdminStatsResponse) => response.data,
      providesTags: ['AdminStats'],
    }),
  }),
});

export const { useGetAdminStatsQuery } = adminApi;
