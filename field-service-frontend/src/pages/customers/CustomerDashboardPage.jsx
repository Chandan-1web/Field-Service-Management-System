import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

import { getMyCustomerRequests } from "../../services/customerWorkOrderService";
import { getMyCustomerSites } from "../../services/customerSiteService";

function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [requestsData, sitesData] = await Promise.all([
          getMyCustomerRequests(),
          getMyCustomerSites(),
        ]);

        if (isMounted) {
          setRequests(Array.isArray(requestsData) ? requestsData : []);
          setSites(Array.isArray(sitesData) ? sitesData : []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load customer dashboard.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // DASHBOARD COUNTS
  // =====================================================

  const activeRequests = useMemo(() => {
    return requests.filter((request) =>
      ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"].includes(request.status),
    );
  }, [requests]);

  const completedRequests = useMemo(() => {
    return requests.filter((request) =>
      ["COMPLETED", "CLOSED"].includes(request.status),
    );
  }, [requests]);

  // =====================================================
  // LATEST ACTIVE REQUEST
  // =====================================================

  const latestActiveRequest = useMemo(() => {
    if (activeRequests.length === 0) {
      return null;
    }

    return [...activeRequests].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })[0];
  }, [activeRequests]);

  // =====================================================
  // RECENT REQUESTS
  // =====================================================

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
      .slice(0, 3);
  }, [requests]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-violet-600" />

          <p className="mt-4 text-base font-semibold text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-9 lg:px-12 lg:py-14">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-base font-bold text-violet-200">
              <ShieldCheck size={18} />
              Customer Service Portal
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Hello, {user?.name || "Customer"} 👋
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
              Need help with your equipment? Request a service, track repairs
              and manage your service locations from one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/request-service")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-500"
              >
                <Plus size={20} />
                Request Service
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-requests")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Track My Requests
                <ArrowRight size={19} />
              </button>
            </div>
          </div>

          <div className="hidden h-48 w-48 shrink-0 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 lg:flex">
            <Wrench size={76} className="text-violet-300" />
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* SUMMARY CARDS */}
      {/* ===================================================== */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Requests"
          value={requests.length}
          description="All service requests"
          icon={ClipboardList}
        />

        <SummaryCard
          title="Active Requests"
          value={activeRequests.length}
          description="Currently being handled"
          icon={Clock3}
        />

        <SummaryCard
          title="Completed Services"
          value={completedRequests.length}
          description="Successfully completed"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Registered Sites"
          value={sites.length}
          description="Your service locations"
          icon={MapPin}
        />
      </section>

      {/* ===================================================== */}
      {/* ACTIVE REQUEST + QUICK ACTIONS */}
      {/* ===================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* ACTIVE REQUEST */}

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-violet-600">
                Active Service
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Your current service request
              </h2>
            </div>

            <Clock3 className="text-violet-600" size={28} />
          </div>

          {latestActiveRequest ? (
            <div className="mt-8 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-violet-700">
                      {latestActiveRequest.code}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                        latestActiveRequest.status,
                      )}`}
                    >
                      {formatLabel(latestActiveRequest.status)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${getPriorityStyle(
                        latestActiveRequest.priority,
                      )}`}
                    >
                      {formatLabel(latestActiveRequest.priority)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-slate-950">
                    {latestActiveRequest.title}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {latestActiveRequest.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                  <Wrench size={25} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoItem
                  icon={MapPin}
                  label="Site"
                  value={latestActiveRequest.siteName || "Not available"}
                />

                <InfoItem
                  icon={UserRound}
                  label="Technician"
                  value={
                    latestActiveRequest.assignedToName || "Not assigned yet"
                  }
                />

                <InfoItem
                  icon={Clock3}
                  label="Created"
                  value={formatDate(latestActiveRequest.createdAt)}
                />
              </div>

              <button
                type="button"
                onClick={() => navigate("/my-requests")}
                className="mt-6 inline-flex items-center gap-2 font-black text-violet-700 transition hover:gap-3"
              >
                Track Request
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="mt-8 flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
              <div className="max-w-lg text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Wrench size={29} />
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-900">
                  No active service request
                </h3>

                <p className="mt-3 text-base leading-7 text-slate-500">
                  You currently do not have any active service requests.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/request-service")}
                  className="mt-6 inline-flex items-center gap-2 text-base font-black text-violet-700 transition hover:gap-3"
                >
                  Request Service
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </article>

        {/* ===================================================== */}
        {/* QUICK ACTIONS */}
        {/* ===================================================== */}

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-violet-600">
            Quick Actions
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950">
            What do you need?
          </h2>

          <div className="mt-7 space-y-4">
            <QuickAction
              icon={Plus}
              title="Request Service"
              description="Report a new service problem"
              onClick={() => navigate("/request-service")}
            />

            <QuickAction
              icon={ClipboardList}
              title="My Requests"
              description="Track your existing requests"
              onClick={() => navigate("/my-requests")}
            />

            <QuickAction
              icon={MapPin}
              title="My Sites"
              description="Manage your service locations"
              onClick={() => navigate("/customer-sites")}
            />
          </div>
        </article>
      </section>

      {/* ===================================================== */}
      {/* RECENT REQUESTS */}
      {/* ===================================================== */}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-violet-600">
              Recent Activity
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Recent service requests
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/my-requests")}
            className="inline-flex items-center gap-2 text-base font-black text-violet-700 transition hover:gap-3"
          >
            View all requests
            <ArrowRight size={18} />
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="mt-7 flex min-h-40 items-center justify-center rounded-3xl bg-slate-50 p-7 text-center">
            <div>
              <ClipboardList size={32} className="mx-auto text-slate-400" />

              <p className="mt-4 text-lg font-bold text-slate-700">
                No recent service requests
              </p>

              <p className="mt-2 text-base text-slate-500">
                Your latest service activity will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {recentRequests.map((request) => (
              <RecentRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold text-slate-500">{title}</p>

          <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={25} />
        </div>
      </div>
    </article>
  );
}

// =====================================================
// QUICK ACTION
// =====================================================

function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-violet-200 hover:bg-violet-50"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-violet-600 group-hover:text-white">
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-black text-slate-900">{title}</p>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <ArrowRight
        size={19}
        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-700"
      />
    </button>
  );
}

// =====================================================
// RECENT REQUEST CARD
// =====================================================

function RecentRequestCard({ request }) {
  return (
    <article className="rounded-3xl border border-slate-200 p-5 transition hover:border-violet-200 hover:shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-violet-700">
              {request.code}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                request.status,
              )}`}
            >
              {formatLabel(request.status)}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black text-slate-950">
            {request.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-violet-600" />

              {request.siteName || "Site not available"}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} className="text-violet-600" />

              {formatDate(request.createdAt)}
            </span>
          </div>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-xs font-black ${getPriorityStyle(
            request.priority,
          )}`}
        >
          {formatLabel(request.priority)}
        </div>
      </div>
    </article>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
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

// =====================================================
// STATUS STYLE
// =====================================================

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

// =====================================================
// PRIORITY STYLE
// =====================================================

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

// =====================================================
// FORMAT LABEL
// =====================================================

function formatLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

// =====================================================
// FORMAT DATE
// =====================================================

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

export default CustomerDashboardPage;
