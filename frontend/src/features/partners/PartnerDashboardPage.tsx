import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useListPartnerOrganizationsQuery,
  useCreatePartnerOrganizationMutation,
  useVerifyPartnerOrganizationMutation,
} from '../../api/partnerOrganizationsApi';
import { useAppSelector } from '../../app/hooks';
import { Button } from '../../components/ui/Button';
import { CreateJourneyForm } from './CreateJourneyForm';

export function PartnerDashboardPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === 'admin';

  const { data: organizations = [], isLoading } = useListPartnerOrganizationsQuery();
  const [createOrganization, { isLoading: isCreating }] = useCreatePartnerOrganizationMutation();
  const [verifyOrganization, { isLoading: isVerifying }] = useVerifyPartnerOrganizationMutation();

  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createOrganization({ name }).unwrap();
    setName('');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Partner dashboard</h1>
        <div className="flex items-center gap-4">
          <Link to="/my-experiences" className="text-sm font-medium text-slate-600 underline hover:text-slate-900">
            My Experiences
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-slate-600 underline hover:text-slate-900">
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
      <p className="mt-2 text-slate-500">
        {isAdmin
          ? 'Review and verify institutions requesting TimeCapsule access.'
          : 'Manage the organizations you represent, and submit source material for review.'}
      </p>

      {!isAdmin && (
        <div className="mt-8 rounded-md border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Register a new organization</h2>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Louvre Digital Team"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
              {isCreating ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="mt-8">
          <CreateJourneyForm />
        </div>
      )}

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Loading organizations...</p>}

        {!isLoading && organizations.length === 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">No organizations yet.</p>
          </div>
        )}

        {organizations.map((organization) => (
          <div
            key={organization.id}
            className="flex items-center justify-between rounded-md border border-slate-200 p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{organization.name}</p>
              <span
                className={`text-xs font-medium ${
                  organization.verified ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {organization.verified ? 'Verified' : 'Pending verification'}
              </span>
            </div>

            {isAdmin && !organization.verified && (
              <Button
                variant="secondary"
                disabled={isVerifying}
                onClick={() => verifyOrganization(organization.id)}
              >
                Verify
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
