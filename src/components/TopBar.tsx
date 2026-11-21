import { Menu, Upload } from 'lucide-react';

export type AppView = 'assistant' | 'documents' | 'graph' | 'evaluation';

interface TopBarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenUpload: () => void;
  onToggleMobileMenu: () => void;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: 'assistant', label: 'Assistant' },
  { id: 'documents', label: 'Documents' },
  { id: 'graph', label: 'Knowledge Graph' },
  { id: 'evaluation', label: 'Evaluation' },
];

export function TopBar({
  activeView,
  onChangeView,
  onOpenUpload,
  onToggleMobileMenu,
}: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-8 shrink-0">
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle workspace menu"
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <a
          href="#assistant"
          onClick={(e) => {
            e.preventDefault();
            onChangeView('assistant');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          EnterpriseMind
        </a>
      </div>

      <nav aria-label="Primary sections" className="hidden md:flex items-center gap-7 h-full">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`h-full inline-flex items-center text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                isActive
                  ? 'border-blue-700 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          Upload Document
        </button>
      </div>
    </header>
  );
}
