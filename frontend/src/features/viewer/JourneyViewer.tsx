import { useState } from 'react';
import { useListMediaQuery } from '../../api/mediaApi';
import { ImmersiveViewer } from './ImmersiveViewer';
import { NarrationPlayer } from './NarrationPlayer';
import type { Journey } from '../../types/journey';

interface JourneyViewerProps {
  journey: Journey;
}

const FADE_MS = 300;

export function JourneyViewer({ journey }: JourneyViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const stops = journey.stops;
  const activeStop = stops[activeIndex];
  const activeExperience = activeStop ? activeStop.experience : null;
  const activeExperienceId =
    activeExperience && 'id' in activeExperience ? activeExperience.id : '';

  const { data: mediaAssets = [] } = useListMediaQuery(activeExperienceId, {
    skip: !activeExperienceId,
  });

  const goToStop = (nextIndex: number) => {
    if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= stops.length) return;

    // A real cross-fade: fade the current stop out, swap the underlying
    // data (which lazy-loads that stop's media), then fade back in. This is
    // the "present fades, the past takes its place" moment as an explicit
    // interaction rather than a page reload.
    setTransitioning(true);
    window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setTransitioning(false);
    }, FADE_MS);
  };

  if (stops.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 p-4">
        <p className="text-sm text-slate-500">This journey has no stops yet.</p>
      </div>
    );
  }

  const cityName =
    activeExperience && 'city' in activeExperience && 'name' in activeExperience.city
      ? activeExperience.city.name
      : 'name' in journey.city
        ? journey.city.name
        : 'Unknown city';

  const hasStory =
    activeExperience && 'story_content' in activeExperience
      ? 'narrative_script' in activeExperience.story_content
      : false;

  const panorama = mediaAssets.find((m) => m.type === 'panorama_360');

  return (
    <div data-testid="journey-viewer">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{journey.title}</h2>
          <p className="text-sm text-slate-500">
            {cityName}
            {activeExperience && 'year' in activeExperience && `, ${activeExperience.year}`}
            {activeExperience && 'era_label' in activeExperience && activeExperience.era_label
              ? ` — ${activeExperience.era_label}`
              : ''}
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Stop {activeIndex + 1} of {stops.length}
        </span>
      </div>

      <div
        data-testid="journey-stop-content"
        className="transition-opacity duration-300"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {panorama && hasStory && activeExperience && 'story_content' in activeExperience && 'narrative_script' in activeExperience.story_content ? (
          <ImmersiveViewer
            imageUrl={panorama.url}
            audioUrl={activeExperience.story_content.audio_narration_url}
            narrativeScript={activeExperience.story_content.narrative_script}
            durationSeconds={activeExperience.story_content.estimated_duration_seconds}
          />
        ) : hasStory && activeExperience && 'story_content' in activeExperience && 'narrative_script' in activeExperience.story_content ? (
          <NarrationPlayer
            narrativeScript={activeExperience.story_content.narrative_script}
            durationSeconds={activeExperience.story_content.estimated_duration_seconds}
            hasAudio={false}
            isPlaying={false}
            currentTime={0}
            onTogglePlay={() => {}}
          />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-400">This stop is still being generated.</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToStop(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          ← Previous stop
        </button>

        <div className="flex gap-2" role="tablist" aria-label="Journey stops">
          {stops.map((stop, index) => (
            <button
              key={stop.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Stop ${index + 1}`}
              onClick={() => goToStop(index)}
              className={`h-2.5 w-2.5 rounded-full ${
                index === activeIndex ? 'bg-slate-900' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goToStop(activeIndex + 1)}
          disabled={activeIndex === stops.length - 1}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Next stop →
        </button>
      </div>
    </div>
  );
}
