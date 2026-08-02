import { ArrowUpRight, ClipboardList, UserRound } from "lucide-react";

import {
  formatDateTime,
  formatLabel,
  priorityStyles,
  statusStyles,
} from "../../utils/dashboardUtils";

function RecentWorkOrders({ recentWorkOrders, onViewAll, onViewWorkOrder }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Live operations
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Recent work orders
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-800"
        >
          View all
          <ArrowUpRight size={16} />
        </button>
      </div>

      {recentWorkOrders.length === 0 ? (
        <div className="p-10 text-center">
          <ClipboardList size={32} className="mx-auto text-slate-300" />

          <p className="mt-4 font-bold text-slate-700">No work orders found</p>

          <p className="mt-2 text-sm text-slate-500">
            New work orders will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recentWorkOrders.map((workOrder) => (
            <button
              type="button"
              key={workOrder.id}
              onClick={() => onViewWorkOrder(workOrder.id)}
              className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 sm:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black text-white">
                    {workOrder.code}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      priorityStyles[workOrder.priority] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatLabel(workOrder.priority)}
                  </span>
                </div>

                <p className="mt-3 font-black text-slate-950">
                  {workOrder.title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {workOrder.customerName || "Unknown customer"}
                  {" · "}
                  {workOrder.siteName || "Unknown site"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Technician
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <UserRound size={15} />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    {workOrder.assignedToName || "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    statusStyles[workOrder.status] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatLabel(workOrder.status)}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  SLA Due
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {formatDateTime(workOrder.slaDueAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export default RecentWorkOrders;
