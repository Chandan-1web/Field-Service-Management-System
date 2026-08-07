import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CirclePause,
  LoaderCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

const statusActionConfig = {
  ASSIGNED: {
    label: "Assign",
    description: "Move the work order into the assigned state.",
    icon: ShieldCheck,
    buttonClass: "from-sky-600 to-indigo-600 shadow-sky-200",
  },
  IN_PROGRESS: {
    label: "Start work",
    description: "Mark the job as actively being worked on.",
    icon: Play,
    buttonClass: "from-violet-600 to-indigo-600 shadow-violet-200",
  },
  ON_HOLD: {
    label: "Put on hold",
    description: "Pause the job temporarily and add a reason.",
    icon: CirclePause,
    buttonClass: "from-amber-500 to-orange-600 shadow-amber-200",
  },
  COMPLETED: {
    label: "Complete work",
    description: "Mark the service job as completed.",
    icon: CheckCircle2,
    buttonClass: "from-emerald-500 to-teal-600 shadow-emerald-200",
  },
  CLOSED: {
    label: "Close work order",
    description: "Formally close the completed work order.",
    icon: ShieldCheck,
    buttonClass: "from-slate-700 to-slate-950 shadow-slate-200",
  },
  CANCELLED: {
    label: "Cancel work order",
    description: "Cancel the work order permanently.",
    icon: XCircle,
    buttonClass: "from-red-500 to-rose-600 shadow-red-200",
  },
};

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatusTransitionModal({
  isOpen,
  workOrder,
  targetStatus,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const action = useMemo(
    () =>
      statusActionConfig[targetStatus] || {
        label: "Update status",
        description: "Change the work-order status.",
        icon: RotateCcw,
        buttonClass: "from-violet-600 to-indigo-600 shadow-violet-200",
      },
    [targetStatus],
  );

  if (!isOpen) {
    return null;
  }

  const Icon = action.icon;

  const noteRequired =
    targetStatus === "COMPLETED" || targetStatus === "CLOSED";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (noteRequired && !note.trim()) {
      setError(
        targetStatus === "COMPLETED"
          ? "Completion note is required"
          : "Closure note is required",
      );

      return;
    }

    await onSubmit({
      newStatus: targetStatus,
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close status modal"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Icon size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                  Status transition
                </p>

                <h2 className="mt-1 text-2xl font-black">{action.label}</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Work order
            </p>

            <p className="mt-2 font-black text-slate-950">
              {workOrder?.code} — {workOrder?.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {workOrder?.customerName} · {workOrder?.siteName}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
              {formatStatus(workOrder?.status)}
            </span>

            <ArrowRight size={19} className="text-violet-500" />

            <span className="rounded-full bg-violet-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
              {formatStatus(targetStatus)}
            </span>
          </div>

          <div>
            <label
              htmlFor="statusNote"
              className="text-sm font-bold text-slate-700"
            >
              {targetStatus === "COMPLETED"
                ? "Completion note"
                : targetStatus === "CLOSED"
                  ? "Closure note"
                  : "Status note"}
            </label>

            <div
              className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                error
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
              }`}
            >
              <textarea
                id="statusNote"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setError("");
                }}
                rows={4}
                placeholder={
                  targetStatus === "COMPLETED"
                    ? "Describe the completed work"
                    : targetStatus === "CLOSED"
                      ? "Add the final closure note"
                      : "Add an optional reason or update"
                }
                className="w-full resize-none bg-transparent py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>

            {error && (
              <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            )}

            {noteRequired && (
              <p className="mt-2 text-xs font-medium text-amber-600">
                This note is required by the backend before this transition can
                be completed.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              {action.description}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 ${action.buttonClass}`}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icon size={18} />
                  {action.label}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StatusTransitionModal;
