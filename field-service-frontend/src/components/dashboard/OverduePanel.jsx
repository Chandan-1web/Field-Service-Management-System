import { ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";

import { formatLabel } from "../../utils/dashboardUtils";

function OverduePanel({ overdueWorkOrders, onViewReports, onViewWorkOrder }) {
  return (
    <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-600">
          SLA attention
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Overdue work orders
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {overdueWorkOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto text-emerald-600" />

            <p className="mt-3 font-bold text-emerald-900">No overdue work</p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              All active work orders are currently within SLA.
            </p>
          </div>
        ) : (
          overdueWorkOrders.slice(0, 4).map((workOrder) => (
            <button
              type="button"
              key={workOrder.workOrderId}
              onClick={() => onViewWorkOrder(workOrder.workOrderId)}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-950">
                    {workOrder.code}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {workOrder.title}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {workOrder.overdueDays > 0
                    ? `${workOrder.overdueDays}d late`
                    : `${workOrder.overdueHours}h late`}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={14} />
                {formatLabel(workOrder.status)}
              </div>
            </button>
          ))
        )}
      </div>

      {overdueWorkOrders.length > 0 && (
        <button
          type="button"
          onClick={onViewReports}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-amber-600"
        >
          Review overdue report
          <ArrowUpRight size={17} />
        </button>
      )}
    </article>
  );
}

export default OverduePanel;
