import { useEffect, useMemo, useRef, useState } from "react";

import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import WorkOrderDetailsModal from "../../components/work-orders/WorkOrderDetailsModal";

import { getMyCustomerRequests } from "../../services/customerWorkOrderService";

function MyRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const notificationHandledRef = useRef(null);

  const workOrderIdFromUrl = searchParams.get("workOrderId") || "";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadRequests = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const data = await getMyCustomerRequests();

      setRequests(Array.isArray(data) ? data : []);

      if (showToast) {
        toast.success("Requests refreshed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load your service requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      try {
        const data = await getMyCustomerRequests();

        if (isMounted) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load your service requests.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // OPEN REQUEST FROM NOTIFICATION
  // =====================================================

  useEffect(() => {
    notificationHandledRef.current = null;
  }, [workOrderIdFromUrl]);

  useEffect(() => {
    if (!workOrderIdFromUrl || loading) {
      return;
    }

    if (notificationHandledRef.current === workOrderIdFromUrl) {
      return;
    }

    const matchedRequest = requests.find(
      (request) => String(request.id) === String(workOrderIdFromUrl),
    );

    if (!matchedRequest) {
      return;
    }

    const timerId = window.setTimeout(() => {
      notificationHandledRef.current = workOrderIdFromUrl;

      setSelectedRequest(matchedRequest);
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
  }, [loading, requests, searchParams, setSearchParams, workOrderIdFromUrl]);

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequest(null);
  };
  const filteredRequests = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return requests;
    }

    return requests.filter((request) => {
      return [
        request.code,
        request.title,
        request.description,
        request.status,
        request.priority,
        request.siteName,
        request.assignedToName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [requests, searchTerm]);

  const activeCount = requests.filter((request) =>
    ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"].includes(request.status),
  ).length;

  const completedCount = requests.filter((request) =>
    ["COMPLETED", "CLOSED"].includes(request.status),
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={38} className="mx-auto animate-spin text-violet-600" />

          <p className="mt-3 text-base font-semibold text-slate-500">
            Loading your requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-violet-200">
              <ClipboardList size={17} />
              Service Requests
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              My Requests
            </h1>

            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-300">
              Track your submitted service requests, technician assignment,
              priority and current status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadRequests(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 font-black text-white transition hover:bg-violet-500 disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Requests"
          value={requests.length}
          icon={ClipboardList}
        />

        <SummaryCard
          title="Active Requests"
          value={activeCount}
          icon={Clock3}
        />

        <SummaryCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
        />
      </section>

      {/* REQUEST LIST */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              Request History
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Your service requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {requests.length} request
              {requests.length === 1 ? "" : "s"} found.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search request, site or status..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="mt-7 flex min-h-72 items-center justify-center rounded-3xl bg-slate-50 p-8">
            <div className="max-w-md text-center">
              <ClipboardList size={34} className="mx-auto text-slate-400" />

              <h3 className="mt-4 text-xl font-black text-slate-900">
                No service requests found
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your submitted service requests will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onView={() => openDetailsModal(request)}
              />
            ))}
          </div>
        )}
      </section>

      <WorkOrderDetailsModal
        isOpen={isDetailsModalOpen}
        workOrder={selectedRequest}
        onClose={closeDetailsModal}
      />
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function RequestCard({ request, onView }) {
  const statusStyle = getStatusStyle(request.status);

  const priorityStyle = getPriorityStyle(request.priority);

  return (
    <article className="rounded-3xl border border-slate-200 p-5 transition hover:border-violet-200 hover:shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-violet-700">
              {request.code}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle}`}
            >
              {formatLabel(request.status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${priorityStyle}`}
            >
              {formatLabel(request.priority)}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-black text-slate-950">
            {request.title}
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {request.description || "No description provided."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              icon={MapPin}
              label="Site"
              value={request.siteName || "Not available"}
            />

            <InfoItem
              icon={UserRound}
              label="Technician"
              value={request.assignedToName || "Not assigned yet"}
            />

            <InfoItem
              icon={Clock3}
              label="Created"
              value={formatDate(request.createdAt)}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <Wrench size={25} />
          </div>

          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-black text-violet-700 transition hover:bg-violet-50"
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <Icon size={18} className="mt-0.5 shrink-0 text-violet-600" />

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700";

    case "ASSIGNED":
      return "bg-violet-50 text-violet-700";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700";

    case "ON_HOLD":
      return "bg-orange-50 text-orange-700";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";

    case "CLOSED":
      return "bg-slate-100 text-slate-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPriorityStyle(priority) {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-50 text-red-700";

    case "HIGH":
      return "bg-orange-50 text-orange-700";

    case "MEDIUM":
      return "bg-amber-50 text-amber-700";

    case "LOW":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default MyRequestsPage;
