import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MapPin,
  UserRound,
  X,
} from "lucide-react";

import {
  formatDateTime,
  formatLabel,
  priorityStyles,
  statusStyles,
} from "../../utils/dashboardUtils";

function DetailCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon size={15} />
        {label}
      </div>

      <p className="mt-3 break-words font-bold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

function WorkOrderDetailsModal({ isOpen, workOrder, onClose }) {
  if (!isOpen || !workOrder) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close work order details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <section className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        {/* HEADER */}
        <header className="relative shrink-0 overflow-hidden bg-slate-950 px-6 py-5 text-white sm:px-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/25 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <ClipboardList size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                  Work order details
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black">{workOrder.code}</h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusStyles[workOrder.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatLabel(workOrder.status)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Review the complete service job information.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="space-y-6">
            {/* TITLE + DESCRIPTION */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                Service request
              </p>

              <h3 className="mt-3 text-2xl font-black text-slate-950">
                {workOrder.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {workOrder.description ||
                  "No description was provided for this work order."}
              </p>
            </div>

            {/* CUSTOMER/SITE */}
            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Customer"
                value={workOrder.customerName}
                icon={UserRound}
              />

              <DetailCard
                label="Service Site"
                value={workOrder.siteName}
                icon={MapPin}
              />
            </div>

            {/* PRIORITY/TECHNICIAN */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <AlertCircle size={15} />
                  Priority
                </div>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                    priorityStyles[workOrder.priority] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatLabel(workOrder.priority)}
                </span>
              </div>

              <DetailCard
                label="Assigned Technician"
                value={workOrder.assignedToName || "Not assigned"}
                icon={UserRound}
              />
            </div>

            {/* DATES */}
            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Created At"
                value={formatDateTime(workOrder.createdAt)}
                icon={CalendarClock}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <CalendarClock size={15} />
                  SLA Due
                </div>

                <p className="mt-3 font-bold text-slate-900">
                  {formatDateTime(workOrder.slaDueAt)}
                </p>
              </div>
            </div>

            {/* COMPLETION */}
            {workOrder.completedAt && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Work completed
                    </p>

                    <p className="mt-1 font-bold text-emerald-950">
                      {formatDateTime(workOrder.completedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Completion note
                  </p>

                  <p className="mt-2 leading-7 text-emerald-950">
                    {workOrder.completionNote ||
                      "No completion note available."}
                  </p>
                </div>
              </div>
            )}

            {/* CLOSURE */}
            {workOrder.closedAt && (
              <div className="rounded-3xl border border-slate-200 bg-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Work order closed
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {formatDateTime(workOrder.closedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Closure note
                  </p>

                  <p className="mt-2 leading-7 text-slate-700">
                    {workOrder.closureNote || "No closure note available."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-violet-700"
            >
              Close
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default WorkOrderDetailsModal;
