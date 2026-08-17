import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  MapPin,
  Play,
  RefreshCcw,
  UserRound,
  Wrench,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import StatusTransitionModal from "../../components/work-orders/StatusTransitionModal";
import WorkOrderDetailsModal from "../../components/work-orders/WorkOrderDetailsModal";

import {
  getMyWorkOrders,
  transitionWorkOrderStatus,
} from "../../services/workOrderService";

import {
  formatDateTime,
  formatLabel,
  priorityStyles,
  statusStyles,
} from "../../utils/dashboardUtils";

const ACTIVE_STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"];

function isOverdue(workOrder) {
  if (!workOrder?.slaDueAt || !ACTIVE_STATUSES.includes(workOrder.status)) {
    return false;
  }

  return new Date(workOrder.slaDueAt).getTime() < Date.now();
}

function StatCard({ title, value, description, icon: Icon, iconClass }) {
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

function MyJobsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-56 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="h-96 rounded-[2rem] bg-slate-200" />
    </div>
  );
}

function MyJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const notificationHandledRef = useRef(null);

  const workOrderIdFromUrl = searchParams.get("workOrderId") || "";

  const [jobs, setJobs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const [targetStatus, setTargetStatus] = useState("");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = useCallback(async (showToast = false) => {
    try {
      setError("");

      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getMyWorkOrders();

      setJobs(data);

      if (showToast) {
        toast.success("Assigned jobs refreshed");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to load assigned jobs.";

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
      void fetchJobs();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchJobs]);

  // =====================================================
  // OPEN JOB FROM NOTIFICATION
  // =====================================================

  useEffect(() => {
    notificationHandledRef.current = null;
  }, [workOrderIdFromUrl]);

  useEffect(() => {
    if (!workOrderIdFromUrl || isLoading) {
      return;
    }

    if (notificationHandledRef.current === workOrderIdFromUrl) {
      return;
    }

    const matchedJob = jobs.find(
      (job) => String(job.id) === String(workOrderIdFromUrl),
    );

    if (!matchedJob) {
      return;
    }

    const timerId = window.setTimeout(() => {
      notificationHandledRef.current = workOrderIdFromUrl;

      setSelectedWorkOrder(matchedJob);
      setIsDetailsModalOpen(true);

      const nextParams = new URLSearchParams(searchParams);

      nextParams.delete("workOrderId");

      setSearchParams(nextParams, {
        replace: true,
      });
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isLoading, jobs, searchParams, setSearchParams, workOrderIdFromUrl]);

  const assignedCount = useMemo(
    () => jobs.filter((job) => job.status === "ASSIGNED").length,
    [jobs],
  );

  const inProgressCount = useMemo(
    () => jobs.filter((job) => job.status === "IN_PROGRESS").length,
    [jobs],
  );

  const completedCount = useMemo(
    () =>
      jobs.filter((job) => ["COMPLETED", "CLOSED"].includes(job.status)).length,
    [jobs],
  );

  const overdueCount = useMemo(() => jobs.filter(isOverdue).length, [jobs]);

  const openStatusModal = (workOrder, newStatus) => {
    setSelectedWorkOrder(workOrder);
    setTargetStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsStatusModalOpen(false);
    setSelectedWorkOrder(null);
    setTargetStatus("");
  };

  const openDetailsModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleStatusTransition = async (transitionData) => {
    if (!selectedWorkOrder) {
      return;
    }

    try {
      setIsSubmitting(true);

      await transitionWorkOrderStatus(selectedWorkOrder.id, transitionData);

      setIsStatusModalOpen(false);
      setSelectedWorkOrder(null);
      setTargetStatus("");

      toast.success("Job status updated successfully");

      await fetchJobs();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to update job status.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActions = (job) => {
    switch (job.status) {
      case "ASSIGNED":
        return [
          {
            label: "Start work",
            icon: Play,
            status: "IN_PROGRESS",
          },
        ];

      case "IN_PROGRESS":
        return [
          {
            label: "Put on hold",
            icon: CalendarClock,
            status: "ON_HOLD",
          },
          {
            label: "Complete work",
            icon: CheckCircle2,
            status: "COMPLETED",
          },
        ];

      case "ON_HOLD":
        return [
          {
            label: "Resume work",
            icon: Play,
            status: "IN_PROGRESS",
          },
        ];

      default:
        return [];
    }
  };

  if (isLoading) {
    return <MyJobsSkeleton />;
  }

  if (error && jobs.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Assigned jobs could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchJobs()}
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
              <Wrench size={16} />
              Technician workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              My assigned jobs
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Review your assigned work, start jobs, pause work when required
              and complete service requests after resolving them.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchJobs(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh jobs
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Assigned Jobs"
          value={assignedCount}
          description="Jobs waiting for you to start."
          icon={ClipboardList}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="In Progress"
          value={inProgressCount}
          description="Service jobs you are currently working on."
          icon={Wrench}
          iconClass="bg-sky-100 text-sky-700"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          description="Jobs you have completed or that were closed."
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Overdue"
          value={overdueCount}
          description="Assigned active jobs that crossed their SLA."
          icon={CalendarClock}
          iconClass="bg-red-100 text-red-700"
        />
      </section>

      {/* JOB LIST */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Field operations
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            My work orders
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Only work orders assigned to your technician account are displayed
            here.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Wrench size={28} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              No jobs assigned
            </h3>

            <p className="mx-auto mt-2 max-w-md leading-7 text-slate-500">
              When a manager or dispatcher assigns a work order to you, it will
              appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const actions = getActions(job);

              return (
                <article
                  key={job.id}
                  className="grid gap-5 p-6 transition hover:bg-slate-50 xl:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_1.2fr]"
                >
                  {/* WORK ORDER */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black text-white">
                        {job.code}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          priorityStyles[job.priority] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatLabel(job.priority)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-black text-slate-950">
                      {job.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {job.description || "No description provided."}
                    </p>
                  </div>

                  {/* CUSTOMER */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {job.customerName}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={15} />
                      {job.siteName}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[job.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {formatLabel(job.status)}
                    </span>

                    {isOverdue(job) && (
                      <p className="mt-2 text-xs font-black text-red-600">
                        SLA overdue
                      </p>
                    )}
                  </div>

                  {/* SLA */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      SLA Due
                    </p>

                    <div className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-700">
                      <CalendarClock size={15} className="mt-0.5 shrink-0" />

                      {formatDateTime(job.slaDueAt)}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <UserRound size={14} />

                      {job.assignedToName || "Technician"}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDetailsModal(job)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Eye size={16} />
                      View details
                    </button>

                    {actions.map((action) => {
                      const Icon = action.icon;

                      return (
                        <button
                          type="button"
                          key={action.status}
                          onClick={() => openStatusModal(job, action.status)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                        >
                          <Icon size={16} />

                          {action.label}
                        </button>
                      );
                    })}

                    {actions.length === 0 && (
                      <div className="rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-bold text-slate-500">
                        No action required
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* STATUS MODAL */}
      <StatusTransitionModal
        isOpen={isStatusModalOpen}
        workOrder={selectedWorkOrder}
        targetStatus={targetStatus}
        isSubmitting={isSubmitting}
        onClose={closeStatusModal}
        onSubmit={handleStatusTransition}
      />

      {/* DETAILS MODAL */}
      <WorkOrderDetailsModal
        isOpen={isDetailsModalOpen}
        workOrder={selectedWorkOrder}
        onClose={closeDetailsModal}
      />
    </div>
  );
}

export default MyJobsPage;
