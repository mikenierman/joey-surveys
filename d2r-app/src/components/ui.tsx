'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ADMIN_NAV_GROUPS,
  REP_NAV,
  pendingLaneTitle,
  type NavGroup,
  type NavLink,
} from '@/lib/nav';
import type { DevUser } from '@/lib/auth';

function linkActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/';
  const target = href.replace(/\/$/, '') || '/';
  return path === target;
}

function AdminSidebarNav({ pendingLane }: { pendingLane?: string | null }) {
  const pathname = usePathname() || '';
  const activePath = pendingLane || pathname;

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-6 pt-2">
      {ADMIN_NAV_GROUPS.map((group, gi) => (
        <NavGroupBlock key={group.label || `g-${gi}`} group={group} activePath={activePath} />
      ))}
    </nav>
  );
}

function NavGroupBlock({
  group,
  activePath,
}: {
  group: NavGroup;
  activePath: string;
}) {
  const isSingleBare =
    !group.label && group.items.length === 1 && !group.items[0].children?.length;

  if (isSingleBare) {
    const item = group.items[0];
    return (
      <div>
        <SidebarLink item={item} activePath={activePath} />
      </div>
    );
  }

  return (
    <div>
      {group.label ? (
        <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          {group.label}
        </div>
      ) : null}
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={item.href}>
            <SidebarLink item={item} activePath={activePath} />
            {item.children?.length ? (
              <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-stone-700 pl-2">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <SidebarLink item={child} activePath={activePath} nested />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarLink({
  item,
  activePath,
  nested = false,
}: {
  item: NavLink;
  activePath: string;
  nested?: boolean;
}) {
  const active = linkActive(activePath, item.href);
  return (
    <Link
      href={item.href}
      className={`block rounded px-3 py-1.5 ${
        nested ? 'text-xs' : 'text-sm'
      } ${
        active
          ? 'bg-amber-500/15 font-medium text-amber-300'
          : 'text-stone-300 hover:bg-stone-800 hover:text-stone-50'
      }`}
    >
      {item.label}
    </Link>
  );
}

function RepTopNav() {
  const pathname = usePathname() || '';
  return (
    <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 pb-2">
      {REP_NAV.map((item) => {
        const active = linkActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded px-3 py-1.5 text-sm ${
              active
                ? 'bg-stone-800 text-amber-300'
                : 'text-stone-200 hover:bg-stone-800'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PendingLane({ path }: { path: string }) {
  const title = pendingLaneTitle(path);
  return (
    <div className="rounded-xl border border-dashed border-amber-400/80 bg-amber-50 px-6 py-10 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        Offline twin — pending lane
      </div>
      <h1 className="mt-3 text-xl font-semibold text-stone-900">{title}</h1>
      <p className="mt-1 font-mono text-xs text-stone-500">{path}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        This live admin route is mapped in the site map but not owned by a domain
        lane yet. Nav link is wired; content lands when the owning sandbox lane
        ships parity.
      </p>
    </div>
  );
}

export function AppShell({
  user,
  children,
  pendingLane,
}: {
  user: DevUser;
  children: React.ReactNode;
  pendingLane?: string | null;
}) {
  const isAdmin = user.role === 'admin' || user.role === 'manager';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900">
        <header className="border-b border-stone-300 bg-stone-950 text-stone-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <BrandMark />
            <UserControls user={user} />
          </div>
          <RepTopNav />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900">
      <aside className="flex w-60 shrink-0 flex-col border-r border-stone-800 bg-stone-950 text-stone-50">
        <div className="border-b border-stone-800 px-4 py-4">
          <BrandMark />
        </div>
        <AdminSidebarNav pendingLane={pendingLane} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-stone-300 bg-white px-4 py-3">
          <UserControls user={user} dark={false} />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-amber-400">
        D2R Failsafe Twin
      </div>
      <div className="text-lg font-semibold leading-tight">Direct 2 Retailers</div>
    </div>
  );
}

function UserControls({
  user,
  dark = true,
}: {
  user: DevUser;
  dark?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 text-sm ${dark ? '' : 'text-stone-700'}`}>
      <span className={dark ? 'text-stone-300' : 'text-stone-600'}>
        {user.name} · {user.role}
      </span>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className={
            dark
              ? 'rounded border border-stone-600 px-3 py-1 hover:bg-stone-800'
              : 'rounded border border-stone-300 px-3 py-1 hover:bg-stone-50'
          }
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-stone-600">{subtitle}</p> : null}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
}) {
  return (
    <div className="overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-stone-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 whitespace-nowrap">
                  {cell ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StubNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      {children}
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <form className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      {children}
    </form>
  );
}

export function FilterField({
  label,
  name,
  options,
  defaultValue = '',
  placeholder,
}: {
  label: string;
  name: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-stone-600">
      <span className="font-medium uppercase tracking-wide">{label}</span>
      {options ? (
        <select
          name={name}
          defaultValue={defaultValue}
          className="min-w-[10rem] rounded border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900"
        >
          <option value="">{placeholder || 'All'}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="min-w-[10rem] rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
      )}
    </label>
  );
}

export function FilterActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 pb-0.5">{children}</div>;
}

export function FilterSubmit() {
  return (
    <button
      type="submit"
      className="rounded bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-800"
    >
      Apply
    </button>
  );
}

export function FilterReset({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
    >
      Reset
    </a>
  );
}

export function ClusterNav({
  items,
  current,
}: {
  items: Array<{ href: string; label: string }>;
  current: string;
}) {
  return (
    <nav className="mb-4 flex flex-wrap gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded px-3 py-1 text-sm ${
            current === item.href
              ? 'bg-stone-900 text-white'
              : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
