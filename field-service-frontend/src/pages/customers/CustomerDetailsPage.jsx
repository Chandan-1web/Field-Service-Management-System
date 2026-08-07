import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Mail,
  MapPin,
  Plus,
  RefreshCcw,
  UserRound,
  Wrench,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import { getCustomerDetails } from "../../services/customerDetailsService";

import {
  formatDateTime,
  formatLabel,
  priorityStyles,
  statusStyles,
} from "../../utils/dashboardUtils";

function CustomerDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="h-[30rem] rounded-[2rem] bg-slate-200" />
        <div className="h-[30rem] rounded-[2rem] bg-slate-200" />
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

function CustomerDetailsPage() {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);

  const [sites, setSites] = useState([]);

  const [workOrders, setWorkOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const fetchDetails = useCallback(
    async (showToast = false) => {
      try {
        setError("");

        if (showToast) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const data = await getCustomerDetails(customerId);

        setCustomer(data.customer);
        setSites(data.sites);
        setWorkOrders(data.workOrders);

        if (showToast) {
          toast.success("Customer details refreshed");
        }
      } catch (requestError) {
        const message =
          requestError.response?.data?.message ||
          "Unable to load customer details.";

        setError(message);

        if (showToast) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchDetails();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchDetails]);

  const activeWorkOrders = useMemo(
    () =>
      workOrders.filter((workOrder) =>
        ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"].includes(
          workOrder.status,
        ),
      ).length,
    [workOrders],
  );

  const completedWorkOrders = useMemo(
    () =>
      workOrders.filter((workOrder) =>
        ["COMPLETED", "CLOSED"].includes(workOrder.status),
      ).length,
    [workOrders],
  );

  const inProgressWorkOrders = useMemo(
    () =>
      workOrders.filter((workOrder) => workOrder.status === "IN_PROGRESS")
        .length,
    [workOrders],
  );

  if (isLoading) {
    return <CustomerDetailsSkeleton />;
  }

  if (error || !customer) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Customer could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Back to customers
            </button>

            <button
              type="button"
              onClick={() => fetchDetails()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
            >
              <RefreshCcw size={18} />
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to customers
          </button>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-black shadow-lg shadow-violet-950/50">
                {customer.name?.charAt(0).toUpperCase() || "C"}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">
                  Customer profile
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  {customer.name}
                </h1>

                <div className="mt-3 flex items-center gap-2 text-slate-400">
                  <Mail size={17} />
                  {customer.contactEmail}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Customer ID: #{customer.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fetchDetails(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => navigate(`/sites?customerId=${customer.id}`)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                <Plus size={18} />
                Register site
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Registered Sites"
          value={sites.length}
          description="Service locations connected to this customer."
          icon={MapPin}
          iconClass="bg-sky-100 text-sky-700"
        />

        <StatCard
          title="Total Work Orders"
          value={workOrders.length}
          description="All service requests for this customer."
          icon={ClipboardList}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Active Work Orders"
          value={activeWorkOrders}
          description="Jobs currently requiring operational attention."
          icon={Wrench}
          iconClass="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Completed Jobs"
          value={completedWorkOrders}
          description="Work orders completed or formally closed."
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-700"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                Locations
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Customer sites
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/sites?customerId=${customer.id}`)}
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-800"
            >
              Manage sites
              <ArrowUpRight size={16} />
            </button>
          </div>

          {sites.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <MapPin size={25} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No sites registered
              </h3>

              <p className="mt-2 leading-7 text-slate-500">
                Register a service location for this customer.
              </p>

              <button
                type="button"
                onClick={() => navigate(`/sites?customerId=${customer.id}`)}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
              >
                <Plus size={18} />
                Register site
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {sites.map((site) => (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="group w-full rounded-3xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <MapPin size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{site.name}</p>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {site.address}
                      </p>

                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-sky-700">
                        Site ID: #{site.id}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                Service history
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Recent work orders
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/work-orders?customerId=${customer.id}`)}
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-800"
            >
              View all
              <ArrowUpRight size={16} />
            </button>
          </div>

          {workOrders.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <ClipboardList size={25} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No work orders found
              </h3>

              <p className="mt-2 leading-7 text-slate-500">
                New service requests for this customer will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {workOrders.map((workOrder) => (
                <button
                  type="button"
                  key={workOrder.id}
                  onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                  className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 md:grid-cols-[1.3fr_0.7fr_0.8fr]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black text-white">
                        {workOrder.code}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          priorityStyles[workOrder.priority] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatLabel(workOrder.priority)}
                      </span>
                    </div>

                    <p className="mt-3 font-black text-slate-950">
                      {workOrder.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {workOrder.siteName || "Unknown site"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[workOrder.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {formatLabel(workOrder.status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      SLA Due
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock3 size={15} />

                      {formatDateTime(workOrder.slaDueAt)}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <UserRound size={14} />

                      {workOrder.assignedToName || "Unassigned"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      {inProgressWorkOrders > 0 && (
        <section className="rounded-[2rem] border border-violet-200 bg-gradient-to-r from-violet-50 to-sky-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
              <Wrench size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Active service work
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                {inProgressWorkOrders} work{" "}
                {inProgressWorkOrders === 1 ? "order is" : "orders are"}{" "}
                currently in progress for this customer.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CustomerDetailsPage;
