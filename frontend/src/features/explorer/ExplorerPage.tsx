import { useState } from 'react';
import { CityMapSelector } from './CityMapSelector';
import { YearTimelineSlider } from './YearTimelineSlider';
import { useListExperiencesQuery } from '../../api/experiencesApi';
import type { City } from '../../types/city';

const CURRENT_YEAR = new Date().getFullYear();

export function ExplorerPage() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);

  const { data: matchingExperiences = [], isFetching } = useListExperiencesQuery(
    selectedCity ? { city_id: selectedCity.id, year: selectedYear } : undefined,
    { skip: !selectedCity }
  );

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Explore TimeCapsule</h1>
      <p className="mt-2 text-slate-500">
        Pick a city, then choose a year to witness. If a TimeCapsule already exists for that
        moment, you'll step right in.
      </p>

      <div className="mt-8">
        <CityMapSelector selectedCity={selectedCity} onCitySelect={setSelectedCity} />
      </div>

      {selectedCity && (
        <div className="mt-8">
          <YearTimelineSlider value={selectedYear} onChange={setSelectedYear} />
        </div>
      )}

      {selectedCity && (
        <div className="mt-8" data-testid="explorer-results">
          {isFetching && <p className="text-sm text-slate-400">Checking for existing TimeCapsules...</p>}

          {!isFetching && matchingExperiences.length > 0 && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">
                A TimeCapsule already exists for {selectedCity.name} in {selectedYear}.
              </p>
            </div>
          )}

          {!isFetching && matchingExperiences.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No TimeCapsule exists yet for {selectedCity.name} in {selectedYear}. Partners can
                request one be generated.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
