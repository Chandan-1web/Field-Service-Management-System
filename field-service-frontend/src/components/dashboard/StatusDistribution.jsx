import {
  BriefcaseBusiness,
  CheckCircle2,
  CirclePause,
  ClipboardList,
  Sparkles,
  Wrench,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

const iconMap = {
  newWorkOrders: Sparkles,
  assignedWorkOrders: BriefcaseBusiness,
  inProgressWorkOrders: Wrench,
  onHoldWorkOrders: CirclePause,
  completedWorkOrders: CheckCircle2,
  closedWorkOrders: ClipboardList,
  cancelledWorkOrders: XCircle,
};

function StatusDistribution({ summary, statusConfig, onViewWorkOrders }) {
  const maximumStatusValue = Math.max(
    ...statusConfig.map(({ key }) => summary?.[key] || 0),
    1,
  );

  return (
    <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Status mix
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Work order distribution
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewWorkOrders}
          className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-800"
        >
          Open work orders
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="mt-7 space-y-5">
        {statusConfig.map(({ key, label, badgeClass, barClass }) => {
          const Icon = iconMap[key] || ClipboardList;
          const value = summary?.[key] || 0;

          const width = Math.max(
            (value / maximumStatusValue) * 100,
            value > 0 ? 8 : 0,
          );

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${badgeClass}`}
                  >
                    <Icon size={17} />
                  </div>

                  <p className="font-bold text-slate-700">{label}</p>
                </div>

                <p className="text-lg font-black text-slate-950">{value}</p>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default StatusDistribution;
