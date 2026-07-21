import { useState } from 'react';
import type { Experience } from '../../types/experience';
import {
  useApproveExperienceMutation,
  useRejectExperienceMutation,
  useCommentOnExperienceMutation,
} from '../../api/moderationApi';

interface ModerationReviewCardProps {
  experience: Experience;
}

export function ModerationReviewCard({ experience }: ModerationReviewCardProps) {
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'idle' | 'reject' | 'comment'>('idle');

  const [approveExperience, { isLoading: isApproving }] = useApproveExperienceMutation();
  const [rejectExperience, { isLoading: isRejecting }] = useRejectExperienceMutation();
  const [commentOnExperience, { isLoading: isCommenting }] = useCommentOnExperienceMutation();

  // const cityName = 'name' in experience.city ? experience.city.name : 'Unknown city';
  // const description =
  //   'description' in experience.story_content ? experience.story_content.description : null;

  const cityName = experience.city?.name ?? 'Unknown city';
  const description = experience.story_content?.description ?? null;

  const handleApprove = async () => {
    await approveExperience({ experienceId: experience.id, notes: notes || undefined }).unwrap();
    setNotes('');
    setMode('idle');
  };

  const handleReject = async () => {
    if (!notes.trim()) return;
    await rejectExperience({ experienceId: experience.id, notes }).unwrap();
    setNotes('');
    setMode('idle');
  };

  const handleComment = async () => {
    if (!notes.trim()) return;
    await commentOnExperience({ experienceId: experience.id, notes }).unwrap();
    setNotes('');
    setMode('idle');
  };

  return (
    <div className="rounded-md border border-slate-200 p-4" data-testid="moderation-review-card">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {cityName}, {experience.year}
        </h3>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
          Pending review
        </span>
      </div>
      {experience.era_label && <p className="mt-1 text-sm text-slate-500">{experience.era_label}</p>}

      {description ? (
        <p className="mt-3 text-sm text-slate-700">{description}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No story description available yet.</p>
      )}

      {(mode === 'reject' || mode === 'comment') && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={mode === 'reject' ? 'Explain why this is being rejected...' : 'Add a comment...'}
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={3}
        />
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {mode === 'idle' && (
          <>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setMode('reject')}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setMode('comment')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Comment
            </button>
          </>
        )}

        {mode === 'reject' && (
          <>
            <button
              type="button"
              onClick={handleReject}
              disabled={isRejecting || !notes.trim()}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
            >
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </>
        )}

        {mode === 'comment' && (
          <>
            <button
              type="button"
              onClick={handleComment}
              disabled={isCommenting || !notes.trim()}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Post comment
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
