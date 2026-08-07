import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Mail,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import CustomerFormModal from "../../components/customers/CustomerFormModal";

import {
  createCustomer,
  getCustomers,
  updateCustomer,
} from "../../services/customerService";

function CustomerSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-2xl bg-slate-100"
        />
      ))}
    </div>
  );
}

function CustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState("create");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = useCallback(async (showToast = false) => {
    try {
      setError("");

      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getCustomers();
      setCustomers(data);

      if (showToast) {
        toast.success("Customer list refreshed");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to load customers.";

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
      void fetchCustomers();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.contactEmail?.toLowerCase().includes(query)
      );
    });
  }, [customers, searchTerm]);

  const openCreateModal = () => {
    setSelectedCustomer(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleCustomerSubmit = async (customerData) => {
    try {
      setIsSubmitting(true);

      if (modalMode === "edit" && selectedCustomer) {
        const updatedCustomer = await updateCustomer(
          selectedCustomer.id,
          customerData,
        );

        setCustomers((current) =>
          current.map((customer) =>
            customer.id === updatedCustomer.id ? updatedCustomer : customer,
          ),
        );

        toast.success("Customer updated successfully");
      } else {
        const createdCustomer = await createCustomer(customerData);

        setCustomers((current) => [createdCustomer, ...current]);

        toast.success("Customer created successfully");
      }

      setIsModalOpen(false);
      setSelectedCustomer(null);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to save customer.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-sky-200">
              <Users size={16} />
              Customer workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Manage your customers
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Create customer accounts, maintain contact information and open
              their connected service locations.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-50"
          >
            <Plus size={18} />
            Add customer
          </button>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-sm text-slate-400">Total customers</p>

            <p className="mt-2 text-3xl font-black">{customers.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-sm text-slate-400">Search results</p>

            <p className="mt-2 text-3xl font-black text-sky-300">
              {filteredCustomers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-sm text-slate-400">Workspace status</p>

            <p className="mt-2 text-lg font-black text-emerald-300">
              Operational
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
              Customer directory
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Customer accounts
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100 sm:min-w-80">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name or email..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchCustomers(true)}
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

        {isLoading ? (
          <CustomerSkeleton />
        ) : error ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={25} />
            </div>

            <p className="mt-4 text-lg font-black text-slate-900">
              Customers could not be loaded
            </p>

            <p className="mt-2 text-slate-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchCustomers()}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
            >
              Try again
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Building2 size={29} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              {customers.length === 0
                ? "No customers created yet"
                : "No matching customers"}
            </h3>

            <p className="mx-auto mt-2 max-w-md leading-7 text-slate-500">
              {customers.length === 0
                ? "Create your first customer account to start registering sites and work orders."
                : "Try searching with another customer name or email address."}
            </p>

            {customers.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
              >
                <Plus size={18} />
                Add first customer
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="group grid gap-5 p-5 transition hover:bg-slate-50 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-violet-200">
                    {customer.name?.charAt(0).toUpperCase() || "C"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-950">
                      {customer.name}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Customer ID: #{customer.id}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Contact email
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                      {customer.contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => openEditModal(customer)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
                  >
                    View
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CustomerFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        customer={selectedCustomer}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleCustomerSubmit}
      />
    </div>
  );
}

export default CustomersPage;
