import { useListFavoritesQuery, useRemoveFavoriteMutation } from '../../api/favoritesApi';
import { ExperienceCard } from '../experience/ExperienceCard';
import { Button } from '../../components/ui/Button';

export function FavoritesPage() {
  const { data: favorites = [], isLoading } = useListFavoritesQuery();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Your journeys</h1>
      <p className="mt-2 text-slate-500">Continue exploring the TimeCapsules you&apos;ve saved.</p>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-slate-400">Loading your favorites...</p>}

        {!isLoading && favorites.length === 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              You haven&apos;t favorited any TimeCapsules yet. Browse the Explorer to find one.
            </p>
          </div>
        )}

        {favorites.map((experience) => (
          <div key={experience.id} className="flex items-start gap-3">
            <div className="flex-1">
              <ExperienceCard experience={experience} />
            </div>
            <Button
              variant="secondary"
              disabled={isRemoving}
              onClick={() => removeFavorite(experience.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
