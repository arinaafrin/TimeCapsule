import { useState } from 'react';

interface YearTimelineSliderProps {
  minYear?: number;
  maxYear?: number;
  value: number;
  onChange: (year: number) => void;
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

export function YearTimelineSlider({
  minYear = -500,
  maxYear = 2100,
  value,
  onChange,
}: YearTimelineSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (next: number) => {
    setLocalValue(next);
    onChange(next);
  };

  const isFuture = localValue > new Date().getFullYear();
  const isPast = localValue < new Date().getFullYear();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{formatYear(minYear)}</span>
        <span className="text-lg font-semibold text-slate-900" data-testid="year-display">
          {formatYear(localValue)}
          {isFuture && <span className="ml-2 text-xs font-normal text-indigo-500">(projected future)</span>}
          {isPast && <span className="ml-2 text-xs font-normal text-amber-600">(historical)</span>}
        </span>
        <span>{formatYear(maxYear)}</span>
      </div>
      <input
        type="range"
        role="slider"
        aria-label="Select year"
        min={minYear}
        max={maxYear}
        value={localValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="mt-2 w-full accent-slate-900"
      />
    </div>
  );
}
