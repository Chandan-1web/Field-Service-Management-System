import {
  ClipboardList,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

function DashboardHero({
  user,
  greeting,
  workspaceName,
  formattedDate,
  formattedTime,
  formattedLastSync,
  overdueCount,
  totalActiveWorkOrders,
  completionRate,
  isRefreshing,
  onRefresh,
  onViewWorkOrders,
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
            <Sparkles size={16} />
            Live operational workspace
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-sky-300 bg-clip-text text-transparent">
              {user?.name || "Manager"}
            </span>{" "}
            👋
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-violet-200">
              {workspaceName}
            </span>

            <span className="text-slate-400">{formattedDate}</span>

            <span className="hidden text-slate-600 sm:inline">•</span>

            <span className="font-semibold text-slate-300">
              {formattedTime}
            </span>
          </div>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            {overdueCount > 0
              ? `${overdueCount} overdue work ${
                  overdueCount === 1 ? "order requires" : "orders require"
                } your attention today.`
              : "All active work orders are currently within SLA."}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
              System operational
            </span>

            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-sky-300">
              Last sync: {formattedLastSync}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onViewWorkOrders}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-50"
          >
            <ClipboardList size={18} />
            View work orders
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <RefreshCcw size={18} />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Active work orders</p>

          <p className="mt-2 text-3xl font-black">{totalActiveWorkOrders}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Completion rate</p>

          <p className="mt-2 text-3xl font-black text-emerald-300">
            {completionRate}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Overdue work</p>

          <p className="mt-2 text-3xl font-black text-amber-300">
            {overdueCount}
          </p>
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;
