import { apiClient } from './client';
import type { City } from '../types/city';

interface CitiesResponse {
  data: City[];
}

interface CityResponse {
  data: City;
}

export const citiesApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    searchCities: builder.query<City[], string | void>({
      query: (search) => ({
        url: '/cities',
        params: search ? { search } : undefined,
      }),
      transformResponse: (response: CitiesResponse) => response.data,
    }),
    getCity: builder.query<City, string>({
      query: (id) => `/cities/${id}`,
      transformResponse: (response: CityResponse) => response.data,
    }),
  }),
});

export const { useSearchCitiesQuery, useGetCityQuery } = citiesApi;
