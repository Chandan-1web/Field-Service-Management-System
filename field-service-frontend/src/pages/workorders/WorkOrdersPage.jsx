import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Filter,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

import AssignTechnicianModal from "../../components/work-orders/AssignTechnicianModal";
import CreateWorkOrderModal from "../../components/work-orders/CreateWorkOrderModal";
import StatusTransitionModal from "../../components/work-orders/StatusTransitionModal";

import { getCustomers } from "../../services/customerService";
import { getSites } from "../../services/siteService";
import { getTechnicianWorkloads } from "../../services/userService";
import {
  assignTechnician,
  createWorkOrder,
  searchWorkOrders,
  transitionWorkOrderStatus,
} from "../../services/workOrderService";

import {
  formatDateTime,
  formatLabel,
  priorityStyles,
  statusStyles,
} from "../../utils/dashboardUtils";

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  "",
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
];

const PRIORITY_OPTIONS = ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

const activeStatuses = ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"];

function isWorkOrderOverdue(workOrder) {
  if (!workOrder?.slaDueAt || !activeStatuses.includes(workOrder.status)) {
    return false;
  }

  return new Date(workOrder.slaDueAt).getTime() < Date.now();
}

function WorkOrdersSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
        <div className="h-24 border-b border-slate-200 bg-slate-100" />

        <div className="space-y-4 p-6">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
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

function WorkOrdersPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { user } = useAuth();

  const isManager = user?.role === "MANAGER";

  const isDispatcher = user?.role === "DISPATCHER";

  const customerIdFromUrl = searchParams.get("customerId") || "";

  const siteIdFromUrl = searchParams.get("siteId") || "";

  const [workOrders, setWorkOrders] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [sites, setSites] = useState([]);

  const [technicians, setTechnicians] = useState([]);

  const [searchInput, setSearchInput] = useState("");

  const [appliedKeyword, setAppliedKeyword] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedPriority, setSelectedPriority] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] =
    useState(customerIdFromUrl);

  const [selectedSiteId, setSelectedSiteId] = useState(siteIdFromUrl);

  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");

  const [pageNumber, setPageNumber] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [totalElements, setTotalElements] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const [targetStatus, setTargetStatus] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSiteOptions = useMemo(() => {
    if (!selectedCustomerId) {
      return sites;
    }

    return sites.filter(
      (site) => String(site.customerId) === String(selectedCustomerId),
    );
  }, [sites, selectedCustomerId]);

  const fetchSupportingData = useCallback(async () => {
    try {
      const [customersData, sitesData, technicianWorkloadData] =
        await Promise.all([
          getCustomers(),
          getSites(),
          getTechnicianWorkloads(),
        ]);

      setCustomers(customersData);

      setSites(sitesData);

      setTechnicians(technicianWorkloadData);
    } catch (requestError) {
      console.error("Unable to load supporting work-order data:", requestError);

      throw requestError;
    }
  }, []);
  const fetchWorkOrders = useCallback(
    async (showToast = false) => {
      try {
        setError("");

        if (showToast) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const result = await searchWorkOrders({
          keyword: appliedKeyword,

          status: selectedStatus,

          priority: selectedPriority,

          customerId: selectedCustomerId,

          siteId: selectedSiteId,

          technicianId: selectedTechnicianId,

          page: pageNumber,

          size: PAGE_SIZE,

          sortBy: "createdAt",

          sortDirection: "desc",
        });

        setWorkOrders(result.content || []);

        setTotalPages(result.totalPages || 0);

        setTotalElements(result.totalElements || 0);

        if (showToast) {
          toast.success("Work orders refreshed");
        }
      } catch (requestError) {
        const message =
          requestError.response?.data?.message || "Unable to load work orders.";

        setError(message);

        if (showToast) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);

        setIsRefreshing(false);
      }
    },
    [
      appliedKeyword,
      selectedStatus,
      selectedPriority,
      selectedCustomerId,
      selectedSiteId,
      selectedTechnicianId,
      pageNumber,
    ],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void Promise.all([fetchSupportingData(), fetchWorkOrders()]);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchSupportingData, fetchWorkOrders]);

  const activeCount = useMemo(
    () =>
      workOrders.filter((workOrder) =>
        activeStatuses.includes(workOrder.status),
      ).length,
    [workOrders],
  );

  const overdueCount = useMemo(
    () => workOrders.filter(isWorkOrderOverdue).length,
    [workOrders],
  );

  const completedCount = useMemo(
    () =>
      workOrders.filter((workOrder) =>
        ["COMPLETED", "CLOSED"].includes(workOrder.status),
      ).length,
    [workOrders],
  );

  const unassignedCount = useMemo(
    () =>
      workOrders.filter(
        (workOrder) =>
          !workOrder.assignedToName &&
          !["CLOSED", "CANCELLED"].includes(workOrder.status),
      ).length,
    [workOrders],
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setPageNumber(0);

    setAppliedKeyword(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setAppliedKeyword("");
    setSelectedStatus("");
    setSelectedPriority("");
    setSelectedCustomerId("");
    setSelectedSiteId("");
    setSelectedTechnicianId("");
    setPageNumber(0);
  };

  const handleCustomerFilterChange = (event) => {
    setSelectedCustomerId(event.target.value);

    setSelectedSiteId("");

    setPageNumber(0);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsCreateModalOpen(false);
  };

  const openAssignModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);

    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsAssignModalOpen(false);

    setSelectedWorkOrder(null);
  };

  const openStatusModal = (workOrder, nextStatus) => {
    setSelectedWorkOrder(workOrder);

    setTargetStatus(nextStatus);

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

  const handleCreateWorkOrder = async (workOrderData) => {
    try {
      setIsSubmitting(true);

      await createWorkOrder(workOrderData);

      setIsCreateModalOpen(false);

      setPageNumber(0);

      toast.success("Work order created successfully");

      await fetchWorkOrders();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to create work order.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTechnician = async (assignmentData) => {
    if (!selectedWorkOrder) {
      return;
    }

    try {
      setIsSubmitting(true);

      await assignTechnician(selectedWorkOrder.id, assignmentData);

      setIsAssignModalOpen(false);

      setSelectedWorkOrder(null);

      toast.success(
        selectedWorkOrder.assignedToName
          ? "Technician reassigned successfully"
          : "Technician assigned successfully",
      );

      await fetchWorkOrders();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to assign technician.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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

      toast.success("Work-order status updated");

      await fetchWorkOrders();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to update work-order status.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableActions = (workOrder) => {
    /*
     * MANAGER
     */
    if (isManager) {
      switch (workOrder.status) {
        case "NEW":
          return [
            {
              key: "assign",
              label: "Assign technician",
              action: () => openAssignModal(workOrder),
            },
            {
              key: "cancel",
              label: "Cancel",
              action: () => openStatusModal(workOrder, "CANCELLED"),
            },
          ];

        case "ASSIGNED":
          return [
            {
              key: "start",
              label: "Start work",
              action: () => openStatusModal(workOrder, "IN_PROGRESS"),
            },
            {
              key: "reassign",
              label: "Reassign",
              action: () => openAssignModal(workOrder),
            },
            {
              key: "cancel",
              label: "Cancel",
              action: () => openStatusModal(workOrder, "CANCELLED"),
            },
          ];

        case "IN_PROGRESS":
          return [
            {
              key: "hold",
              label: "Put on hold",
              action: () => openStatusModal(workOrder, "ON_HOLD"),
            },
          ];

        case "ON_HOLD":
          return [
            {
              key: "resume",
              label: "Resume",
              action: () => openStatusModal(workOrder, "IN_PROGRESS"),
            },
          ];

        case "COMPLETED":
          return [
            {
              key: "close",
              label: "Close",
              action: () => openStatusModal(workOrder, "CLOSED"),
            },
          ];

        default:
          return [];
      }
    }

    /*
     * DISPATCHER
     *
     * Dispatcher handles dispatching,
     * assignment and cancellation.
     *
     * Dispatcher does NOT start,
     * complete or close technician jobs.
     */
    if (isDispatcher) {
      switch (workOrder.status) {
        case "NEW":
          return [
            {
              key: "assign",
              label: "Assign technician",
              action: () => openAssignModal(workOrder),
            },
            {
              key: "cancel",
              label: "Cancel",
              action: () => openStatusModal(workOrder, "CANCELLED"),
            },
          ];

        case "ASSIGNED":
          return [
            {
              key: "reassign",
              label: "Reassign",
              action: () => openAssignModal(workOrder),
            },
            {
              key: "cancel",
              label: "Cancel",
              action: () => openStatusModal(workOrder, "CANCELLED"),
            },
          ];

        default:
          return [];
      }
    }

    return [];
  };

  if (isLoading) {
    return <WorkOrdersSkeleton />;
  }

  if (error && workOrders.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Work orders could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchWorkOrders()}
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
              <ClipboardList size={16} />

              {isDispatcher ? "Dispatcher workspace" : "Work-order workspace"}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {isDispatcher
                ? "Dispatch field operations"
                : "Manage field operations"}
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              {isDispatcher
                ? "Create service jobs, assign or reassign technicians, monitor SLA deadlines and coordinate field operations."
                : "Create service jobs, assign technicians, monitor SLA deadlines and manage the full work-order lifecycle."}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-50"
          >
            <Plus size={18} />
            Create work order
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Results"
          value={totalElements}
          description="Work orders matching the selected filters."
          icon={ClipboardList}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Active on Page"
          value={activeCount}
          description="New, assigned, active or paused jobs."
          icon={Wrench}
          iconClass="bg-sky-100 text-sky-700"
        />

        <StatCard
          title="Overdue on Page"
          value={overdueCount}
          description="Active jobs that have crossed the SLA due time."
          icon={CalendarClock}
          iconClass="bg-red-100 text-red-700"
        />

        <StatCard
          title="Unassigned on Page"
          value={unassignedCount}
          description="Open jobs that do not yet have a technician."
          icon={UserRound}
          iconClass="bg-amber-100 text-amber-700"
        />
      </section>

      {/* WORK ORDERS */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                Operations directory
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Work orders
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {completedCount} completed or closed work orders are visible on
                this page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
              >
                <Filter size={18} />
                Clear filters
              </button>

              <button
                type="button"
                onClick={() => fetchWorkOrders(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* FILTER FORM */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 grid gap-3 xl:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))_auto]"
          >
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search code, title or description..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);

                  setPageNumber(0);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status ? formatLabel(status) : "All statuses"}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(event) => {
                  setSelectedPriority(event.target.value);

                  setPageNumber(0);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority || "all"} value={priority}>
                    {priority ? formatLabel(priority) : "All priorities"}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCustomerId}
                onChange={handleCustomerFilterChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                <option value="">All customers</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(event) => {
                  setSelectedSiteId(event.target.value);

                  setPageNumber(0);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                <option value="">All sites</option>

                {filteredSiteOptions.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={selectedTechnicianId}
                onChange={(event) => {
                  setSelectedTechnicianId(event.target.value);

                  setPageNumber(0);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                <option value="">All technicians</option>

                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name}
                    {" — "}
                    {technician.activeJobs} active
                    {technician.activeJobs === 1 ? " job" : " jobs"}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm font-bold text-slate-600">
                <th className="px-6 py-4">Work Order</th>

                <th className="px-6 py-4">Customer</th>

                <th className="px-6 py-4">Technician</th>

                <th className="px-6 py-4">Priority</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4">SLA</th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {workOrders.map((workOrder) => (
                <tr
                  key={workOrder.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-900">
                      {workOrder.code}
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {workOrder.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(workOrder.createdAt)}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">
                      {workOrder.customerName}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={13} />

                      {workOrder.siteName}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {workOrder.assignedToName ? (
                      <span className="font-semibold text-slate-900">
                        {workOrder.assignedToName}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        priorityStyles[workOrder.priority]
                      }`}
                    >
                      {formatLabel(workOrder.priority)}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[workOrder.status]
                      }`}
                    >
                      {formatLabel(workOrder.status)}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">
                        {formatDateTime(workOrder.slaDueAt)}
                      </p>

                      {isWorkOrderOverdue(workOrder) && (
                        <p className="mt-1 font-bold text-red-600">Overdue</p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                      >
                        View
                      </button>

                      {getAvailableActions(workOrder).map((action) => (
                        <button
                          type="button"
                          key={action.key}
                          onClick={action.action}
                          className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-slate-200 p-5">
          <button
            type="button"
            disabled={pageNumber === 0}
            onClick={() => setPageNumber((page) => Math.max(page - 1, 0))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <span className="text-sm font-semibold text-slate-600">
            Page {pageNumber + 1} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            disabled={pageNumber >= totalPages - 1}
            onClick={() => setPageNumber((page) => page + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold disabled:opacity-50"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* MODALS */}
      <CreateWorkOrderModal
        isOpen={isCreateModalOpen}
        customers={customers}
        sites={sites}
        isSubmitting={isSubmitting}
        onClose={closeCreateModal}
        onSubmit={handleCreateWorkOrder}
      />

      <AssignTechnicianModal
        isOpen={isAssignModalOpen}
        workOrder={selectedWorkOrder}
        technicians={technicians}
        isSubmitting={isSubmitting}
        onClose={closeAssignModal}
        onSubmit={handleAssignTechnician}
      />

      <StatusTransitionModal
        isOpen={isStatusModalOpen}
        workOrder={selectedWorkOrder}
        targetStatus={targetStatus}
        isSubmitting={isSubmitting}
        onClose={closeStatusModal}
        onSubmit={handleStatusTransition}
      />
    </div>
  );
}

export default WorkOrdersPage;
