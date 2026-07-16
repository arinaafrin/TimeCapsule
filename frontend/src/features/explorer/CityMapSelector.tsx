import { useEffect, useRef, useState } from 'react';
import { useSearchCitiesQuery } from '../../api/citiesApi';
import type { City } from '../../types/city';

interface CityMapSelectorProps {
  selectedCity: City | null;
  onCitySelect: (city: City) => void;
}

declare global {
  interface Window {
    google?: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let mapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (!mapsScriptPromise) {
    mapsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
  }

  return mapsScriptPromise;
}

export function CityMapSelector({ selectedCity, onCitySelect }: CityMapSelectorProps) {
  const [search, setSearch] = useState('');
  const { data: cities = [], isFetching } = useSearchCitiesQuery(search || undefined);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    let cancelled = false;
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!cancelled) setMapsReady(true);
      })
      .catch(() => {
        // Silently fall back to the coordinate-list view below.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapContainerRef.current || !selectedCity) return;

    const position = { lat: selectedCity.latitude, lng: selectedCity.longitude };

    if (!mapRef.current) {
      mapRef.current = new window.google!.maps.Map(mapContainerRef.current, {
        center: position,
        zoom: 11,
      });
    } else {
      mapRef.current.setCenter(position);
    }

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    markerRef.current = new window.google!.maps.Marker({
      position,
      map: mapRef.current,
      title: selectedCity.name,
    });
  }, [mapsReady, selectedCity]);

  return (
    <div className="w-full">
      <label htmlFor="city-search" className="block text-sm font-medium text-slate-700">
        Search for a city
      </label>
      <input
        id="city-search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="e.g. Paris, Kyoto, Cairo..."
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />

      {isFetching && <p className="mt-2 text-sm text-slate-400">Searching...</p>}

      {!isFetching && cities.length > 0 && (
        <ul className="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
          {cities.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => onCitySelect(city)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  selectedCity?.id === city.id ? 'bg-slate-100 font-medium' : ''
                }`}
              >
                {city.name}, {city.country}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isFetching && search && cities.length === 0 && (
        <p className="mt-2 text-sm text-slate-400">No cities found for "{search}".</p>
      )}

      {selectedCity && (
        <div className="mt-4">
          {GOOGLE_MAPS_API_KEY ? (
            <div ref={mapContainerRef} data-testid="google-map" className="h-64 w-full rounded-md bg-slate-100" />
          ) : (
            <div
              data-testid="map-fallback"
              className="flex h-32 w-full items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500"
            >
              {selectedCity.name} — {selectedCity.latitude.toFixed(4)}, {selectedCity.longitude.toFixed(4)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
