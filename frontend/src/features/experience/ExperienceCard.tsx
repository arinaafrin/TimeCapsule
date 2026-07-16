import { Link } from 'react-router-dom';
import type { Experience } from '../../types/experience';

interface ExperienceCardProps {
  experience: Experience;
}

const STATUS_LABELS: Record<Experience['status'], string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const cityName = 'name' in experience.city ? experience.city.name : 'Unknown city';

  return (
    <Link
      to={`/experiences/${experience.id}`}
      className="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-400 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {cityName}, {experience.year}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {STATUS_LABELS[experience.status]}
        </span>
      </div>
      {experience.era_label && <p className="mt-1 text-sm text-slate-500">{experience.era_label}</p>}
    </Link>
  );
}
