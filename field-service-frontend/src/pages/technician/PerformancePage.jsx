import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  Timer,
  TrendingUp,
  Wrench,
} from "lucide-react";

import toast from "react-hot-toast";

import { getMyPerformance } from "../../services/technicianPerformanceService";

function PerformancePage() {
  const [performance, setPerformance] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const loadPerformance = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const data = await getMyPerformance();

      setPerformance(data);

      if (showToast) {
        toast.success("Performance refreshed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load performance.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const data = await getMyPerformance();

        if (isMounted) {
          setPerformance(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Unable to load performance.",
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

  const finishedJobs = useMemo(() => {
    if (!performance) {
      return 0;
    }

    return (
      Number(performance.completedWorkOrders || 0) +
      Number(performance.closedWorkOrders || 0)
    );
  }, [performance]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={34} className="mx-auto animate-spin text-violet-600" />

          <p className="mt-3 font-semibold text-slate-500">
            Loading performance...
          </p>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <BarChart3 size={32} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-black text-slate-900">
            Performance unavailable
          </h2>

          <p className="mt-2 text-slate-500">
            Unable to load technician performance data.
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
              <TrendingUp size={16} />
              Technician workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Performance
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Track your assigned jobs, completed work and logged service hours.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadPerformance(true)}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Assigned Jobs"
          value={performance.totalAssignedWorkOrders}
          icon={Wrench}
        />

        <StatCard
          title="Finished Jobs"
          value={finishedJobs}
          icon={CheckCircle2}
        />

        <StatCard
          title="In Progress"
          value={performance.inProgressWorkOrders}
          icon={Clock3}
        />

        <StatCard
          title="Total Hours"
          value={`${performance.totalHoursLogged} hrs`}
          icon={Timer}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Completion
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Job completion rate
          </h2>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <p className="text-5xl font-black text-slate-950">
                {performance.completionPercentage}%
              </p>

              <p className="text-sm font-semibold text-slate-500">
                {finishedJobs} of {performance.totalAssignedWorkOrders} jobs
                finished
              </p>
            </div>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                style={{
                  width: `${Math.min(
                    Number(performance.completionPercentage || 0),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SmallMetric
              title="Completed"
              value={performance.completedWorkOrders}
            />

            <SmallMetric title="Closed" value={performance.closedWorkOrders} />
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Work hours
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Logged service time
          </h2>

          <div className="mt-8 flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Timer size={28} />
            </div>

            <div>
              <p className="text-4xl font-black text-slate-950">
                {performance.totalHoursLogged}
              </p>

              <p className="mt-1 font-semibold text-slate-500">
                total hours logged
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Total minutes
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
              {performance.totalMinutesLogged} min
            </p>
          </div>
        </article>
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

          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function SmallMetric({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{title}</p>

      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

export default PerformancePage;
