import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser, loggedOut } from '../../features/auth/authSlice';
import { Badge } from '../ui/Badge';
import { IconSearch, IconMenu, IconChevronDown, IconLogout } from '../ui/icons';

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const roleTone =
    user?.role === 'admin' ? 'brand' : user?.role === 'partner' ? 'success' : 'neutral';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-line)] bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded-[var(--radius-control)] p-2 text-[var(--color-ink-700)] hover:bg-[var(--color-surface-sunken)] md:hidden"
          aria-label="Open navigation"
        >
          <IconMenu />
        </button>

        <div className="hidden items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-sm text-[var(--color-ink-500)] sm:flex">
          <IconSearch width={16} height={16} />
          <span>Search journeys, cities, stops…</span>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        {user && <Badge tone={roleTone}>{user.role}</Badge>}

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-[var(--radius-control)] p-1.5 hover:bg-[var(--color-surface-sunken)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-semibold text-[var(--color-brand-700)]">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
          <span className="hidden text-sm font-medium text-[var(--color-ink-900)] sm:inline">
            {user?.name ?? 'Guest'}
          </span>
          <IconChevronDown width={14} height={14} className="text-[var(--color-ink-500)]" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="tc-card absolute right-0 top-12 z-20 w-48 overflow-hidden p-1.5">
              <div className="px-2.5 py-2">
                <p className="truncate text-sm font-medium text-[var(--color-ink-900)]">{user?.name}</p>
                <p className="truncate text-xs text-[var(--color-ink-500)]">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  dispatch(loggedOut());
                  navigate('/');
                }}
                className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-left text-sm text-[var(--color-ink-700)] hover:bg-[var(--color-surface-sunken)]"
              >
                <IconLogout width={16} height={16} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
