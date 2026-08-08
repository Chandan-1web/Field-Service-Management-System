import { useState } from "react";

import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  RefreshCcw,
  Send,
  UserRound,
  X,
} from "lucide-react";

function getAvailabilityDetails(status) {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "BUSY":
      return {
        label: "Busy",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "HEAVILY_LOADED":
      return {
        label: "Heavily Loaded",
        className: "border-red-200 bg-red-50 text-red-700",
      };

    default:
      return {
        label: "Unknown",
        className: "border-slate-200 bg-slate-50 text-slate-600",
      };
  }
}

function AssignTechnicianModal({
  isOpen,
  workOrder,
  technicians = [],
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [technicianId, setTechnicianId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const isReassignment = Boolean(workOrder?.assignedToName);

  if (!isOpen) {
    return null;
  }

  const selectedTechnician = technicians.find(
    (technician) => String(technician.id) === String(technicianId),
  );

  const selectedAvailability = selectedTechnician
    ? getAvailabilityDetails(selectedTechnician.availabilityStatus)
    : null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!technicianId) {
      setError("Select a technician");
      return;
    }

    try {
      await onSubmit({
        technicianId: Number(technicianId),
        note: note.trim(),
      });

      setTechnicianId("");
      setNote("");
      setError("");
    } catch {
      // Parent component handles API error/toast.
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setTechnicianId("");
    setNote("");
    setError("");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/25 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                {isReassignment ? (
                  <RefreshCcw size={23} />
                ) : (
                  <UserRound size={23} />
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                  {isReassignment
                    ? "Technician reassignment"
                    : "Technician assignment"}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {isReassignment ? "Reassign technician" : "Assign technician"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* WORK ORDER INFORMATION */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Work order
            </p>

            <p className="mt-2 font-black text-slate-950">
              {workOrder?.code || "Work Order"}
              {" — "}
              {workOrder?.title || "Service Request"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {workOrder?.customerName || "Customer"}
              {" · "}
              {workOrder?.siteName || "Site"}
            </p>

            {isReassignment && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Currently assigned to
                </p>

                <p className="mt-1 text-sm font-black text-amber-900">
                  {workOrder?.assignedToName}
                </p>
              </div>
            )}
          </div>

          {/* TECHNICIAN SELECTION */}
          <div>
            <label
              htmlFor="technicianId"
              className="text-sm font-bold text-slate-700"
            >
              {isReassignment ? "New Technician" : "Technician"}
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
                <option value="">
                  {isReassignment
                    ? "Select new technician"
                    : "Select technician"}
                </option>

                {technicians.map((technician) => {
                  const availability = getAvailabilityDetails(
                    technician.availabilityStatus,
                  );

                  const activeJobs = technician.activeJobs ?? 0;

                  return (
                    <option key={technician.id} value={technician.id}>
                      {technician.name}
                      {" — "}
                      {activeJobs} active {activeJobs === 1 ? "job" : "jobs"}
                      {" — "}
                      {availability.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {error && (
              <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            )}

            {technicians.length === 0 && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                No technicians are currently available.
              </p>
            )}
          </div>

          {/* SELECTED TECHNICIAN WORKLOAD */}
          {selectedTechnician && selectedAvailability && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      {selectedTechnician.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedTechnician.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-black ${selectedAvailability.className}`}
                >
                  {selectedAvailability.label}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <BriefcaseBusiness size={16} />

                    <span className="text-xs font-bold uppercase tracking-wide">
                      Active Jobs
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-black text-slate-950">
                    {selectedTechnician.activeJobs ?? 0}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CheckCircle2 size={16} />

                    <span className="text-xs font-bold uppercase tracking-wide">
                      Workload
                    </span>
                  </div>

                  <p className="mt-2 font-black text-slate-950">
                    {selectedAvailability.label}
                  </p>
                </div>
              </div>

              {selectedTechnician.availabilityStatus === "HEAVILY_LOADED" && (
                <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />

                  <p className="text-sm font-semibold leading-6">
                    This technician already has a heavy workload. Consider
                    assigning this job to another available technician.
                  </p>
                </div>
              )}

              {selectedTechnician.availabilityStatus === "BUSY" && (
                <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />

                  <p className="text-sm font-semibold leading-6">
                    This technician is currently busy. You can still assign the
                    work order if required.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENT NOTE */}
          <div>
            <label
              htmlFor="assignmentNote"
              className="text-sm font-bold text-slate-700"
            >
              {isReassignment ? "Reassignment note" : "Assignment note"}
            </label>

            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
              <textarea
                id="assignmentNote"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder={
                  isReassignment
                    ? "Add reason or instructions for reassignment"
                    : "Add instructions for the technician"
                }
                className="w-full resize-none bg-transparent py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* INFORMATION */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm leading-6 text-sky-800">
              {isReassignment ? (
                <>
                  The selected technician will replace{" "}
                  <span className="font-black">
                    {workOrder?.assignedToName}
                  </span>
                  . The newly assigned technician will receive this work order.
                </>
              ) : (
                <>
                  Assigning a technician to a{" "}
                  <span className="font-black">NEW</span> work order will
                  automatically change its status to{" "}
                  <span className="font-black">ASSIGNED</span>.
                </>
              )}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || technicians.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />

                  {isReassignment ? "Reassigning..." : "Assigning..."}
                </>
              ) : (
                <>
                  {isReassignment ? (
                    <RefreshCcw size={18} />
                  ) : (
                    <Send size={18} />
                  )}

                  {isReassignment ? "Reassign technician" : "Assign technician"}
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
