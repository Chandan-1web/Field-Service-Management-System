import { useEffect, useMemo, useState } from "react";

import {
  Clock3,
  Loader2,
  RefreshCcw,
  Search,
  Timer,
  Wrench,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getMyTimeLogs,
  getMyTotalMinutes,
} from "../../services/timeLogService";

function formatMinutes(minutes) {
  const total = Number(minutes || 0);

  const hours = Math.floor(total / 60);
  const remainingMinutes = total % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function TimeLogsPage() {
  const [logs, setLogs] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const [logsData, totalData] = await Promise.all([
        getMyTimeLogs(),
        getMyTotalMinutes(),
      ]);

      setLogs(logsData);
      setTotalMinutes(totalData);

      if (showToast) {
        toast.success("Time logs refreshed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load time logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const [logsData, totalData] = await Promise.all([
          getMyTimeLogs(),
          getMyTotalMinutes(),
        ]);

        if (isMounted) {
          setLogs(logsData);
          setTotalMinutes(totalData);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Unable to load time logs.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const uniqueJobs = useMemo(() => {
    return new Set(logs.map((log) => log.workOrderId)).size;
  }, [logs]);

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
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
              <Clock3 size={16} />
              Technician workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Time Logs
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Review the time you have logged across your assigned work orders.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadData(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-violet-50 disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

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
                {logs.length} time log entries found.
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
                Time logged from your assigned jobs will appear here.
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
  );
}

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
