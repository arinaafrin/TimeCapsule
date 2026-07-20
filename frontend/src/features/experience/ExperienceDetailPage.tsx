import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetExperienceQuery } from '../../api/experiencesApi';
import { useGenerateStoryMutation } from '../../api/aiJobsApi';
import { useListMediaQuery, useGenerateMediaMutation } from '../../api/mediaApi';
import {
  useListFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from '../../api/favoritesApi';
import { GenerationProgress } from './GenerationProgress';
import { MediaUploadForm } from './MediaUploadForm';
import { ImmersiveViewer } from '../viewer/ImmersiveViewer';
import { NarrationPlayer } from '../viewer/NarrationPlayer';
import { useAppSelector } from '../../app/hooks';

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: experience, isLoading, refetch } = useGetExperienceQuery(id ?? '', { skip: !id });
  const { data: mediaAssets = [], refetch: refetchMedia } = useListMediaQuery(id ?? '', { skip: !id });

  const [generateStory, { isLoading: isGeneratingStory }] = useGenerateStoryMutation();
  const [generateMedia, { isLoading: isGeneratingMedia }] = useGenerateMediaMutation();

  const { data: favorites = [] } = useListFavoritesQuery();
  const [addFavorite, { isLoading: isFavoriting }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isUnfavoriting }] = useRemoveFavoriteMutation();
  const isFavorited = favorites.some((favorite) => favorite.id === id);

  const handleToggleFavorite = () => {
    if (!id) return;
    if (isFavorited) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  const [activeStoryJobId, setActiveStoryJobId] = useState<string | null>(null);
  const [activeMediaJobId, setActiveMediaJobId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const currentUser = useAppSelector((state) => state.auth.user);

  const canManage =
    experience &&
    currentUser &&
    (currentUser.role === 'admin' || currentUser.id === experience.created_by);

  const handleGenerateStory = async () => {
    if (!id) return;
    const result = await generateStory(id).unwrap();
    setActiveStoryJobId(result.job_id);
  };

  const handleGenerateMedia = async () => {
    if (!id) return;
    const result = await generateMedia(id).unwrap();
    setActiveMediaJobId(result.job_id);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-slate-400">Loading TimeCapsule...</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-slate-500">This TimeCapsule could not be found.</p>
      </div>
    );
  }

  const cityName = 'name' in experience.city ? experience.city.name : 'Unknown city';
  const hasStory = 'narrative_script' in experience.story_content;
  const panorama = mediaAssets.find((m) => m.type === 'panorama_360');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {cityName}, {experience.year}
          </h1>
          {experience.era_label && <p className="mt-1 text-slate-500">{experience.era_label}</p>}
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={isFavoriting || isUnfavoriting}
          aria-pressed={isFavorited}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isFavorited ? '★ Favorited' : '☆ Favorite'}
        </button>
      </div>

      {panorama && hasStory && 'narrative_script' in experience.story_content && (
        <div className="mt-6">
          <ImmersiveViewer
            imageUrl={panorama.url}
            audioUrl={experience.story_content.audio_narration_url}
            narrativeScript={experience.story_content.narrative_script}
            durationSeconds={experience.story_content.estimated_duration_seconds}
          />
        </div>
      )}

      {!panorama && (
        <div className="mt-6">
          {hasStory && 'narrative_script' in experience.story_content ? (
            <NarrationPlayer
              narrativeScript={experience.story_content.narrative_script}
              durationSeconds={experience.story_content.estimated_duration_seconds}
              hasAudio={false}
              isPlaying={false}
              currentTime={0}
              onTogglePlay={() => {}}
            />
          ) : (
            <p className="text-sm text-slate-400">No story has been generated for this TimeCapsule yet.</p>
          )}
        </div>
      )}

      {canManage && !hasStory && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGenerateStory}
            disabled={isGeneratingStory || Boolean(activeStoryJobId)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isGeneratingStory ? 'Requesting...' : 'Generate Story'}
          </button>
        </div>
      )}

      {activeStoryJobId && (
        <div className="mt-6">
          <GenerationProgress jobId={activeStoryJobId} onComplete={refetch} />
        </div>
      )}

      {canManage && hasStory && !panorama && (
        <div className="mt-6 space-y-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerateMedia}
              disabled={isGeneratingMedia || Boolean(activeMediaJobId)}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {isGeneratingMedia ? 'Requesting...' : 'Generate 360° Image'}
            </button>
            <button
              type="button"
              onClick={() => setShowUploadForm((v) => !v)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {showUploadForm ? 'Cancel upload' : 'Upload media instead'}
            </button>
          </div>

          {showUploadForm && (
            <MediaUploadForm
              experienceId={id!}
              onUploaded={() => {
                setShowUploadForm(false);
                refetchMedia();
              }}
            />
          )}
        </div>
      )}

      {activeMediaJobId && (
        <div className="mt-6">
          <GenerationProgress jobId={activeMediaJobId} onComplete={refetchMedia} />
        </div>
      )}
    </div>
  );
}
