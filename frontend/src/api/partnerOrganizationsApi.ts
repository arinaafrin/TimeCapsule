import { apiClient } from './client';
import type { PartnerOrganization } from '../types/partnerOrganization';

interface OrganizationListResponse {
  data: PartnerOrganization[];
}

interface OrganizationResponse {
  data: PartnerOrganization;
}

export const partnerOrganizationsApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listPartnerOrganizations: builder.query<PartnerOrganization[], void>({
      query: () => '/partner-organizations',
      transformResponse: (response: OrganizationListResponse) => response.data,
      providesTags: ['PartnerOrganization'],
    }),
    createPartnerOrganization: builder.mutation<PartnerOrganization, { name: string }>({
      query: (body) => ({ url: '/partner-organizations', method: 'POST', body }),
      transformResponse: (response: OrganizationResponse) => response.data,
      invalidatesTags: ['PartnerOrganization'],
    }),
    verifyPartnerOrganization: builder.mutation<PartnerOrganization, string>({
      query: (id) => ({ url: `/partner-organizations/${id}/verify`, method: 'POST' }),
      transformResponse: (response: OrganizationResponse) => response.data,
      invalidatesTags: ['PartnerOrganization'],
    }),
  }),
});

export const {
  useListPartnerOrganizationsQuery,
  useCreatePartnerOrganizationMutation,
  useVerifyPartnerOrganizationMutation,
} = partnerOrganizationsApi;
