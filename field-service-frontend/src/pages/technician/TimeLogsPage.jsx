import {
  Clock3,
  FileText,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Timer,
  Wrench,
  X,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  getMyTimeLogs,
  getMyTotalMinutes,
  logTimeForWorkOrder,
} from "../../services/timeLogService";

import { getMyWorkOrders } from "../../services/workOrderService";

// =====================================================
// HELPERS
// =====================================================

function formatMinutes(minutes) {
  const total = Number(minutes || 0);

  const hours = Math.floor(total / 60);
  const remainingMinutes = total % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMinutes} min`;
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

// =====================================================
// MAIN PAGE
// =====================================================

function TimeLogsPage() {
  const [logs, setLogs] = useState([]);

  const [jobs, setJobs] = useState([]);

  const [totalMinutes, setTotalMinutes] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [logModalOpen, setLogModalOpen] = useState(false);

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState("");

  const [minutes, setMinutes] = useState("");

  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const [logsData, totalData, jobsData] = await Promise.all([
        getMyTimeLogs(),
        getMyTotalMinutes(),
        getMyWorkOrders(),
      ]);

      setLogs(Array.isArray(logsData) ? logsData : []);

      setTotalMinutes(Number(totalData || 0));

      setJobs(Array.isArray(jobsData) ? jobsData : []);

      if (showToast) {
        toast.success("Time logs refreshed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load time logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadData]);

  // =====================================================
  // JOBS AVAILABLE FOR TIME LOGGING
  // =====================================================

  const availableJobs = useMemo(() => {
    return jobs.filter((job) => !["CLOSED", "CANCELLED"].includes(job.status));
  }, [jobs]);

  // =====================================================
  // FILTER LOGS
  // =====================================================

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return logs;
    }

    return logs.filter((log) => {
      return (
        log.workOrderCode?.toLowerCase().includes(query) ||
        log.note?.toLowerCase().includes(query) ||
        log.technicianName?.toLowerCase().includes(query)
      );
    });
  }, [logs, searchTerm]);

  // =====================================================
  // TODAY'S TIME
  // =====================================================

  const todayMinutes = useMemo(() => {
    const today = new Date().toDateString();

    return logs
      .filter((log) => {
        if (!log.loggedAt) {
          return false;
        }

        return new Date(log.loggedAt).toDateString() === today;
      })
      .reduce((sum, log) => sum + Number(log.minutes || 0), 0);
  }, [logs]);

  // =====================================================
  // UNIQUE JOBS
  // =====================================================

  const uniqueJobs = useMemo(() => {
    return new Set(logs.map((log) => log.workOrderId)).size;
  }, [logs]);

  // =====================================================
  // MODAL
  // =====================================================

  const openLogModal = () => {
    setSelectedWorkOrderId("");
    setMinutes("");
    setNote("");

    setLogModalOpen(true);
  };

  const closeLogModal = () => {
    if (submitting) {
      return;
    }

    setLogModalOpen(false);

    setSelectedWorkOrderId("");
    setMinutes("");
    setNote("");
  };

  // =====================================================
  // SUBMIT TIME LOG
  // =====================================================

  const handleSubmitTimeLog = async (event) => {
    event.preventDefault();

    if (!selectedWorkOrderId) {
      toast.error("Select a work order.");

      return;
    }

    const parsedMinutes = Number(minutes);

    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 1) {
      toast.error("Enter valid minutes greater than 0.");

      return;
    }

    if (parsedMinutes > 1440) {
      toast.error("A single time log cannot exceed 24 hours.");

      return;
    }

    try {
      setSubmitting(true);

      await logTimeForWorkOrder(selectedWorkOrderId, {
        minutes: parsedMinutes,

        note: note.trim() || null,
      });

      toast.success("Time logged successfully.");

      setLogModalOpen(false);

      setSelectedWorkOrderId("");
      setMinutes("");
      setNote("");

      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save time log.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={34} className="mx-auto animate-spin text-violet-600" />

          <p className="mt-3 font-semibold text-slate-500">
            Loading time logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
                <Clock3 size={16} />
                Technician workspace
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Time Logs
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Record the time spent on assigned work orders and review your
                complete work history.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={refreshing}
                onClick={() => loadData(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCcw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openLogModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                <Plus size={18} />
                Log Time
              </button>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Logged Time"
            value={formatMinutes(totalMinutes)}
            icon={Timer}
          />

          <StatCard
            title="Logged Today"
            value={formatMinutes(todayMinutes)}
            icon={Clock3}
          />

          <StatCard title="Jobs Worked On" value={uniqueJobs} icon={Wrench} />
        </section>

        {/* ================================================= */}
        {/* HISTORY */}
        {/* ================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                  Work history
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Logged time
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {logs.length} time log
                  {logs.length === 1 ? "" : "s"} found.
                </p>
              </div>

              <div className="flex min-w-[280px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search work order or note..."
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <Clock3 size={28} />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No time logs found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Use the Log Time button to record time spent on an assigned
                  job.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-bold text-slate-600">
                    <th className="px-6 py-4">Work Order</th>

                    <th className="px-6 py-4">Time Logged</th>

                    <th className="px-6 py-4">Note</th>

                    <th className="px-6 py-4">Logged At</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-900">
                          {log.workOrderCode}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-black text-violet-700">
                          {formatMinutes(log.minutes)}
                        </span>
                      </td>

                      <td className="max-w-md px-6 py-5 text-sm text-slate-600">
                        {log.note || "No note added"}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-500">
                        {formatDateTime(log.loggedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ===================================================== */}
      {/* LOG TIME MODAL */}
      {/* ===================================================== */}

      {logModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Technician time entry
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Log work time
                </h2>
              </div>

              <button
                type="button"
                onClick={closeLogModal}
                disabled={submitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmitTimeLog} className="space-y-5 p-6">
              {/* WORK ORDER */}

              <div>
                <label
                  htmlFor="time-work-order"
                  className="text-sm font-black text-slate-800"
                >
                  Work Order
                </label>

                <select
                  id="time-work-order"
                  value={selectedWorkOrderId}
                  onChange={(event) =>
                    setSelectedWorkOrderId(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Select assigned work order</option>

                  {availableJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.code} — {job.title} ({formatStatus(job.status)})
                    </option>
                  ))}
                </select>

                {availableJobs.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    You currently have no open assigned work orders available
                    for time logging.
                  </p>
                )}
              </div>

              {/* MINUTES */}

              <div>
                <label
                  htmlFor="time-minutes"
                  className="text-sm font-black text-slate-800"
                >
                  Minutes Worked
                </label>

                <div className="relative mt-2">
                  <Timer
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="time-minutes"
                    type="number"
                    min="1"
                    max="1440"
                    step="1"
                    value={minutes}
                    onChange={(event) => setMinutes(event.target.value)}
                    placeholder="Example: 60"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {minutes && Number(minutes) > 0 && (
                  <p className="mt-2 text-xs font-bold text-violet-600">
                    {formatMinutes(Number(minutes))}
                  </p>
                )}
              </div>

              {/* NOTE */}

              <div>
                <label
                  htmlFor="time-note"
                  className="text-sm font-black text-slate-800"
                >
                  Work Note{" "}
                  <span className="font-medium text-slate-400">(optional)</span>
                </label>

                <div className="relative mt-2">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    id="time-note"
                    rows={4}
                    maxLength={255}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Describe the work completed during this time..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <p className="mt-1 text-right text-xs text-slate-400">
                  {note.length}/255
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeLogModal}
                  disabled={submitting}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || availableJobs.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Clock3 size={18} />
                      Save Time Log
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ title, value, icon: Icon }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

export default TimeLogsPage;
