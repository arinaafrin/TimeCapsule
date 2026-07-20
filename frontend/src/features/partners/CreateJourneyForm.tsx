import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateJourneyMutation } from '../../api/journeysApi';
import { CityMapSelector } from '../explorer/CityMapSelector';
import { Button } from '../../components/ui/Button';
import type { City } from '../../types/city';
import type { CreateJourneyStopPayload } from '../../types/journey';

const CURRENT_YEAR = new Date().getFullYear();

function emptyStop(year: number): CreateJourneyStopPayload {
  return { year, era_label: '' };
}

export function CreateJourneyForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [stops, setStops] = useState<CreateJourneyStopPayload[]>([
    emptyStop(CURRENT_YEAR - 100),
    emptyStop(CURRENT_YEAR),
  ]);

  const [createJourney, { isLoading, error }] = useCreateJourneyMutation();
  const navigate = useNavigate();

  const updateStop = (index: number, patch: Partial<CreateJourneyStopPayload>) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)));
  };

  const addStop = () => setStops((prev) => [...prev, emptyStop(CURRENT_YEAR)]);

  const removeStop = (index: number) =>
    setStops((prev) => prev.filter((_, i) => i !== index));

  const canSubmit = title.trim() && selectedCity && stops.length >= 2;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;

    const journey = await createJourney({
      title,
      description: description || undefined,
      city_id: selectedCity.id,
      stops: stops.map((stop) => ({
        year: stop.year,
        era_label: stop.era_label || undefined,
        stop_latitude: stop.stop_latitude,
        stop_longitude: stop.stop_longitude,
      })),
    }).unwrap();

    navigate(`/journeys/${journey.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-slate-900">Create a Journey</h2>
      <p className="mt-1 text-sm text-slate-500">
        A Journey is a themed walk through multiple eras of one city — like Timescope's "Origins of
        Paris." Each stop is generated automatically once you submit.
      </p>

      <div className="mt-4">
        <label htmlFor="journey-title" className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="journey-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Origins of Paris"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="journey-description" className="block text-sm font-medium text-slate-700">
          Description (optional)
        </label>
        <textarea
          id="journey-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4">
        <CityMapSelector selectedCity={selectedCity} onCitySelect={setSelectedCity} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700">Stops (at least 2)</h3>

        <div className="mt-2 space-y-3">
          {stops.map((stop, index) => (
            <div key={index} className="flex items-end gap-2 rounded-md bg-slate-50 p-3">
              <div className="flex-1">
                <label htmlFor={`stop-year-${index}`} className="block text-xs font-medium text-slate-600">
                  Year
                </label>
                <input
                  id={`stop-year-${index}`}
                  type="number"
                  value={stop.year}
                  onChange={(e) => updateStop(index, { year: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`stop-era-${index}`} className="block text-xs font-medium text-slate-600">
                  Era label (optional)
                </label>
                <input
                  id={`stop-era-${index}`}
                  type="text"
                  value={stop.era_label ?? ''}
                  onChange={(e) => updateStop(index, { era_label: e.target.value })}
                  placeholder="e.g. World's Fair"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeStop(index)}
                disabled={stops.length <= 2}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStop}
          className="mt-3 text-sm font-medium text-slate-600 underline"
        >
          + Add another stop
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          Could not create this Journey. Check the fields and try again.
        </p>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={!canSubmit || isLoading}>
          {isLoading ? 'Creating...' : 'Create Journey'}
        </Button>
      </div>
    </form>
  );
}
