import { useState } from "react";
import { LoaderCircle, Send, UserRound, X } from "lucide-react";

function AssignTechnicianModal({
  isOpen,
  workOrder,
  technicians,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [technicianId, setTechnicianId] = useState("");

  const [note, setNote] = useState("");

  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!technicianId) {
      setError("Select a technician");
      return;
    }

    await onSubmit({
      technicianId: Number(technicianId),
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close assignment modal"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/25 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                <UserRound size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                  Technician assignment
                </p>

                <h2 className="mt-1 text-2xl font-black">Assign technician</h2>
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

          <div>
            <label
              htmlFor="technicianId"
              className="text-sm font-bold text-slate-700"
            >
              Technician
            </label>

            <div
              className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                error
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-100"
              }`}
            >
              <select
                id="technicianId"
                value={technicianId}
                onChange={(event) => {
                  setTechnicianId(event.target.value);
                  setError("");
                }}
                className="w-full bg-transparent py-3.5 text-sm text-slate-950 outline-none"
              >
                <option value="">Select technician</option>

                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} — {technician.email}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="assignmentNote"
              className="text-sm font-bold text-slate-700"
            >
              Assignment note
            </label>

            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
              <textarea
                id="assignmentNote"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Add instructions for the technician"
                className="w-full resize-none bg-transparent py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm leading-6 text-sky-800">
              Assigning a technician to a{" "}
              <span className="font-black">NEW</span> work order will
              automatically change its status to{" "}
              <span className="font-black">ASSIGNED</span>. The technician will
              also receive an email.
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Assign technician
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AssignTechnicianModal;
