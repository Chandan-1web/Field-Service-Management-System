import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  CirclePause,
  ClipboardList,
  Clock3,
  Package,
  RefreshCcw,
  UsersRound,
  MapPinned,
  XCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import { getDashboardSummary } from "../../services/reportService";

function ReportStatCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>

          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function ReportsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-60 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="h-96 rounded-[2rem] bg-slate-200" />
    </div>
  );
}

function ReportsPage() {
  const [summary, setSummary] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const fetchSummary = useCallback(async (showToast = false) => {
    try {
      setError("");

      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getDashboardSummary();

      setSummary(data);

      if (showToast) {
        toast.success("Reports refreshed");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to load reports.";

      setError(message);

      if (showToast) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchSummary();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchSummary]);

  const activeWorkOrders = useMemo(() => {
    if (!summary) {
      return 0;
    }

    return (
      Number(summary.newWorkOrders || 0) +
      Number(summary.assignedWorkOrders || 0) +
      Number(summary.inProgressWorkOrders || 0) +
      Number(summary.onHoldWorkOrders || 0)
    );
  }, [summary]);

  const completedAndClosed = useMemo(() => {
    if (!summary) {
      return 0;
    }

    return (
      Number(summary.completedWorkOrders || 0) +
      Number(summary.closedWorkOrders || 0)
    );
  }, [summary]);

  const completionRate = useMemo(() => {
    if (!summary?.totalWorkOrders) {
      return 0;
    }

    return Math.round((completedAndClosed / summary.totalWorkOrders) * 100);
  }, [completedAndClosed, summary]);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  if (!summary || error) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Reports could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchSummary()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
          >
            <RefreshCcw size={18} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
              <BriefcaseBusiness size={16} />
              Management reports
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Operational reports
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Review work-order performance, service activity and business
              totals from the Field Service Management System.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchSummary(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh reports
          </button>
        </div>
      </section>

      {/* MAIN KPI CARDS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          title="Total Work Orders"
          value={summary.totalWorkOrders}
          description="All service jobs recorded in the system."
          icon={ClipboardList}
          iconClass="bg-violet-100 text-violet-700"
        />

        <ReportStatCard
          title="Active Work Orders"
          value={activeWorkOrders}
          description="New, assigned, in-progress and on-hold jobs."
          icon={Clock3}
          iconClass="bg-sky-100 text-sky-700"
        />

        <ReportStatCard
          title="Completed / Closed"
          value={completedAndClosed}
          description="Jobs successfully completed or formally closed."
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-700"
        />

        <ReportStatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Percentage of total work orders completed or closed."
          icon={CheckCircle2}
          iconClass="bg-teal-100 text-teal-700"
        />
      </section>

      {/* WORK ORDER STATUS REPORT */}
      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Work order status
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Status distribution
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Current number of work orders in every lifecycle stage.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportStatCard
            title="New"
            value={summary.newWorkOrders}
            description="Work orders waiting for assignment."
            icon={ClipboardList}
            iconClass="bg-sky-100 text-sky-700"
          />

          <ReportStatCard
            title="Assigned"
            value={summary.assignedWorkOrders}
            description="Jobs currently assigned to technicians."
            icon={UsersRound}
            iconClass="bg-violet-100 text-violet-700"
          />

          <ReportStatCard
            title="In Progress"
            value={summary.inProgressWorkOrders}
            description="Jobs currently being worked on."
            icon={Clock3}
            iconClass="bg-blue-100 text-blue-700"
          />

          <ReportStatCard
            title="On Hold"
            value={summary.onHoldWorkOrders}
            description="Jobs temporarily paused."
            icon={CirclePause}
            iconClass="bg-amber-100 text-amber-700"
          />

          <ReportStatCard
            title="Completed"
            value={summary.completedWorkOrders}
            description="Technician work completed."
            icon={CheckCircle2}
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <ReportStatCard
            title="Closed"
            value={summary.closedWorkOrders}
            description="Manager-approved completed work orders."
            icon={CheckCircle2}
            iconClass="bg-slate-200 text-slate-700"
          />

          <ReportStatCard
            title="Cancelled"
            value={summary.cancelledWorkOrders}
            description="Work orders cancelled before completion."
            icon={XCircle}
            iconClass="bg-red-100 text-red-700"
          />
        </div>
      </section>

      {/* BUSINESS SUMMARY */}
      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Business overview
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            System totals
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            High-level totals from customer, site and inventory modules.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ReportStatCard
            title="Customers"
            value={summary.totalCustomers}
            description="Registered service customers."
            icon={UsersRound}
            iconClass="bg-violet-100 text-violet-700"
          />

          <ReportStatCard
            title="Sites"
            value={summary.totalSites}
            description="Customer service locations."
            icon={MapPinned}
            iconClass="bg-sky-100 text-sky-700"
          />

          <ReportStatCard
            title="Inventory Parts"
            value={summary.totalParts}
            description="Different spare parts stored in inventory."
            icon={Package}
            iconClass="bg-emerald-100 text-emerald-700"
          />
        </div>
      </section>
    </div>
  );
}

export default ReportsPage;
