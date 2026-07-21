import { NavLink } from 'react-router-dom';
import type { SVGProps } from 'react';
import type { UserRole } from '../../types/user';
import {
  IconCompass,
  IconMap,
  IconLayers,
  IconShieldCheck,
  IconBuilding,
  IconGrid,
  IconHeart,
  IconChevronLeft,
  IconSparkles,
} from '../ui/icons';

interface NavItem {
  to: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  roles?: UserRole[]; // omit = visible to everyone signed in
  end?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: 'Explore',
    items: [
      { to: '/explorer', label: 'Explorer', icon: IconCompass, end: true },
      { to: '/journeys', label: 'Journeys', icon: IconMap },
      { to: '/favorites', label: 'Favorites', icon: IconHeart },
    ],
  },
  {
    label: 'Create',
    items: [
      {
        to: '/my-experiences',
        label: 'My experiences',
        icon: IconLayers,
        roles: ['partner', 'admin'],
      },
      {
        to: '/partner-dashboard',
        label: 'Partner dashboard',
        icon: IconBuilding,
        roles: ['partner', 'admin'],
      },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/moderation', label: 'Moderation queue', icon: IconShieldCheck, roles: ['admin'] },
      { to: '/admin', label: 'Admin overview', icon: IconGrid, roles: ['admin'] },
    ],
  },
];

interface SidebarProps {
  role: UserRole | undefined;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ role, collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col shrink-0 h-full border-r border-[var(--color-line)] bg-white transition-[width] duration-150 ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-600)] text-white">
          <IconSparkles width={16} height={16} />
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-bold tracking-tight text-[var(--color-ink-900)]">
            TimeCapsule
          </span>
        )}
      </div>

      <nav className="tc-scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || (role && item.roles.includes(role)),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              {!collapsed && <p className="tc-nav-section-label mb-2">{section.label}</p>}
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <span className="tc-nav-link" data-active={isActive}>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center ${
                            isActive ? 'text-[var(--color-brand-600)]' : ''
                          }`}
                        >
                          <item.icon />
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-line)] p-3">
        <button
          onClick={onToggleCollapsed}
          className="flex w-full items-center justify-center rounded-[var(--radius-control)] p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-surface-sunken)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevronLeft
            className={`transition-transform duration-150 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
