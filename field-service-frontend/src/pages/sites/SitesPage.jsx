import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Filter,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import SiteFormModal from "../../components/sites/SiteFormModal";

import { getCustomers } from "../../services/customerService";

import { createSite, getSites } from "../../services/siteService";

function SitesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 rounded-[2rem] bg-slate-200" />
        ))}
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

function SitesPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const initialCustomerId = searchParams.get("customerId") || "";

  const [sites, setSites] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] =
    useState(initialCustomerId);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const fetchSitesPageData = useCallback(async (showToast = false) => {
    try {
      setError("");

      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [sitesData, customersData] = await Promise.all([
        getSites(),
        getCustomers(),
      ]);

      setSites(sitesData);
      setCustomers(customersData);

      if (showToast) {
        toast.success("Sites workspace refreshed");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to load sites.";

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
      void fetchSitesPageData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchSitesPageData]);

  const filteredSites = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sites.filter((site) => {
      const matchesCustomer =
        !selectedCustomerId ||
        String(site.customerId) === String(selectedCustomerId);

      const matchesSearch =
        !query ||
        site.name?.toLowerCase().includes(query) ||
        site.address?.toLowerCase().includes(query) ||
        site.customerName?.toLowerCase().includes(query);

      return matchesCustomer && matchesSearch;
    });
  }, [sites, searchTerm, selectedCustomerId]);

  const customerWithMostSites = useMemo(() => {
    if (sites.length === 0) {
      return null;
    }

    const countByCustomer = sites.reduce((accumulator, site) => {
      const key = String(site.customerId);

      accumulator[key] = (accumulator[key] || 0) + 1;

      return accumulator;
    }, {});

    const topCustomerId = Object.keys(countByCustomer).sort(
      (first, second) => countByCustomer[second] - countByCustomer[first],
    )[0];

    return customers.find(
      (customer) => String(customer.id) === String(topCustomerId),
    );
  }, [sites, customers]);

  const openSiteModal = () => {
    setIsModalOpen(true);
  };

  const closeSiteModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
  };

  const handleCreateSite = async (customerId, siteData) => {
    try {
      setIsSubmitting(true);

      const createdSite = await createSite(customerId, siteData);

      setSites((current) => [createdSite, ...current]);

      setIsModalOpen(false);

      toast.success("Site registered successfully");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to register site.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <SitesSkeleton />;
  }

  if (error && sites.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Sites could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchSitesPageData()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-sky-700"
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
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-sky-200">
              <MapPin size={16} />
              Site workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Manage service locations
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Register customer locations, review addresses and open the related
              customer or work-order workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={openSiteModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-50"
          >
            <Plus size={18} />
            Register site
          </button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sites"
          value={sites.length}
          description="All registered service locations."
          icon={MapPin}
          iconClass="bg-sky-100 text-sky-700"
        />

        <StatCard
          title="Customers Covered"
          value={new Set(sites.map((site) => site.customerId)).size}
          description="Customers with at least one registered site."
          icon={Building2}
          iconClass="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Filtered Results"
          value={filteredSites.length}
          description="Sites matching the current search and filter."
          icon={Filter}
          iconClass="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Top Customer"
          value={customerWithMostSites?.name ? customerWithMostSites.name : "—"}
          description="Customer currently having the most sites."
          icon={Building2}
          iconClass="bg-amber-100 text-amber-700"
        />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
              Site directory
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Registered service locations
            </h2>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100 lg:min-w-80">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search site, address or customer..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100 lg:min-w-64">
              <Filter size={18} className="shrink-0 text-slate-400" />

              <select
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="">All customers</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => fetchSitesPageData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <MapPin size={29} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              {sites.length === 0
                ? "No sites registered yet"
                : "No matching sites"}
            </h3>

            <p className="mx-auto mt-2 max-w-md leading-7 text-slate-500">
              {sites.length === 0
                ? "Register your first service location to connect customers with field operations."
                : "Try changing the search term or customer filter."}
            </p>

            {sites.length === 0 && (
              <button
                type="button"
                onClick={openSiteModal}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-bold text-white transition hover:bg-sky-700"
              >
                <Plus size={18} />
                Register first site
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/60"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-100 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-200">
                      <MapPin size={21} />
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      Site #{site.id}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-950">
                    {site.name}
                  </h3>

                  <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-500">
                    <MapPin size={16} className="mt-1 shrink-0 text-sky-600" />
                    <span>{site.address}</span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <Building2 size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800">
                          {site.customerName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Customer #{site.customerId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${site.customerId}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      Customer
                      <ArrowUpRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/work-orders?siteId=${site.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                      Work orders
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <SiteFormModal
        isOpen={isModalOpen}
        customers={customers}
        initialCustomerId={selectedCustomerId || initialCustomerId}
        isSubmitting={isSubmitting}
        onClose={closeSiteModal}
        onSubmit={handleCreateSite}
      />
    </div>
  );
}

export default SitesPage;
