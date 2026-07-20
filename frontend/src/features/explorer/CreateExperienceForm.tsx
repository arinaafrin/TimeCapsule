import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateExperienceMutation } from '../../api/experiencesApi';

interface CreateExperienceFormProps {
  cityId: string;
  year: number;
}

export function CreateExperienceForm({ cityId, year }: CreateExperienceFormProps) {
  const [eraLabel, setEraLabel] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [createExperience, { isLoading, error }] = useCreateExperienceMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const experience = await createExperience({
      city_id: cityId,
      year,
      era_label: eraLabel || undefined,
      google_maps_link: googleMapsLink || undefined,
    }).unwrap();

    navigate(`/experiences/${experience.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Create this TimeCapsule</h3>
      <p className="mt-1 text-sm text-slate-500">
        Optionally pin a specific place with a Google Maps link — the story will be grounded in
        that exact spot instead of just the city as a whole.
      </p>

      <div className="mt-3">
        <label htmlFor="era-label" className="block text-sm font-medium text-slate-700">
          Era label (optional)
        </label>
        <input
          id="era-label"
          type="text"
          value={eraLabel}
          onChange={(e) => setEraLabel(e.target.value)}
          placeholder="e.g. Belle Époque"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-3">
        <label htmlFor="maps-link" className="block text-sm font-medium text-slate-700">
          Google Maps link (optional)
        </label>
        <input
          id="maps-link"
          type="url"
          value={googleMapsLink}
          onChange={(e) => setGoogleMapsLink(e.target.value)}
          placeholder="https://www.google.com/maps/place/..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          Could not create this TimeCapsule. Check the link format and try again.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create TimeCapsule'}
      </button>
    </form>
  );
}
