import { ShieldCheck } from 'lucide-react';
import { SUGGESTED_QUERIES } from '../engine/corpus';
import type { EnterpriseUser } from '../engine/types';
import { USER_AVATARS } from '../utils/avatars';

interface WorkspaceSidebarProps {
  users: EnterpriseUser[];
  activeUser: EnterpriseUser;
  onSelectUser: (user: EnterpriseUser) => void;
  authorizedDocsCount: number;
  restrictedDocsCount: number;
  totalChunksCount: number;
  onRunSuggestedQuery: (query: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function WorkspaceSidebar({
  users,
  activeUser,
  onSelectUser,
  authorizedDocsCount,
  restrictedDocsCount,
  totalChunksCount,
  onRunSuggestedQuery,
  mobileOpen,
  onCloseMobile,
}: WorkspaceSidebarProps) {
  const sidebarBody = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[264px] shrink-0">
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Active Employee Identity
          </span>
          <ShieldCheck className="w-4 h-4 text-blue-700" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
            {USER_AVATARS[activeUser.id] ? (
              <img
                src={USER_AVATARS[activeUser.id]}
                alt={activeUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-slate-600">
                {activeUser.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {activeUser.name}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {activeUser.title}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600">
          {activeUser.department} <span aria-hidden="true">·</span>{' '}
          <span className="font-mono font-medium text-slate-900">
            Clearance L{activeUser.clearance}
          </span>
        </div>

        <div>
          <label
            htmlFor="rbac-role-select"
            className="block text-[11px] font-medium text-slate-500 mb-1"
          >
            Switch RBAC Persona
          </label>
          <select
            id="rbac-role-select"
            value={activeUser.id}
            onChange={(e) => {
              const found = users.find((u) => u.id === e.target.value);
              if (found) onSelectUser(found);
            }}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-2 text-slate-900 focus:outline-2 focus:outline-blue-700"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} · L{u.clearance} ({u.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200 space-y-2">
        <div className="text-xs font-semibold text-slate-500">
          Authorized Corpus Scope
        </div>
        <dl className="grid grid-cols-3 gap-2 pt-1">
          <div>
            <dt className="text-[11px] text-slate-500">Accessible</dt>
            <dd className="text-sm font-mono font-semibold text-slate-900 tabular-nums">
              {authorizedDocsCount}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Restricted</dt>
            <dd className="text-sm font-mono font-semibold text-amber-700 tabular-nums">
              {restrictedDocsCount}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Chunks</dt>
            <dd className="text-sm font-mono font-semibold text-slate-900 tabular-nums">
              {totalChunksCount}
            </dd>
          </div>
        </dl>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
        <div className="text-xs font-semibold text-slate-500">
          Verification Prompts
        </div>
        <div className="space-y-1.5">
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onRunSuggestedQuery(item.query);
                onCloseMobile();
              }}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors group focus-visible:outline-2 focus-visible:outline-blue-700"
            >
              <div className="text-xs font-medium text-slate-900 group-hover:text-blue-700 truncate">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {item.query}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block h-full shrink-0">{sidebarBody}</div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarBody}</div>
        </div>
      )}
    </>
  );
}
