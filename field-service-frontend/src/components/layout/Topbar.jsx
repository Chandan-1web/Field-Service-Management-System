import { Bell, Menu, Search, UserRound } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

function Topbar({ openMobileSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openMobileSidebar}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden min-w-[18rem] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100 md:flex">
            <Search size={18} className="shrink-0 text-slate-400" />

            <input
              type="search"
              placeholder="Search work orders, customers or sites..."
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <UserRound size={19} />
            </div>

            <div className="hidden sm:block">
              <p className="max-w-40 truncate text-sm font-bold text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {user?.role || "Unknown role"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
