import { useEffect, useMemo, useState } from "react";

import {
  Boxes,
  Loader2,
  PackageCheck,
  RefreshCcw,
  Search,
  Wrench,
} from "lucide-react";

import toast from "react-hot-toast";

import { getMyPartUsage } from "../../services/partUsageService";

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function PartsUsedPage() {
  const [usage, setUsage] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const data = await getMyPartUsage();

      setUsage(data);

      if (showToast) {
        toast.success("Part usage refreshed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load part usage.",
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
        const data = await getMyPartUsage();

        if (isMounted) {
          setUsage(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Unable to load part usage.",
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

  const filteredUsage = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return usage;
    }

    return usage.filter(
      (item) =>
        item.workOrderCode?.toLowerCase().includes(query) ||
        item.partName?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query),
    );
  }, [usage, searchTerm]);

  const totalQuantity = useMemo(() => {
    return usage.reduce((sum, item) => sum + Number(item.qtyUsed || 0), 0);
  }, [usage]);

  const uniqueParts = useMemo(() => {
    return new Set(usage.map((item) => item.partId)).size;
  }, [usage]);

  const uniqueJobs = useMemo(() => {
    return new Set(usage.map((item) => item.workOrderId)).size;
  }, [usage]);

  const totalCost = useMemo(() => {
    return usage.reduce(
      (sum, item) =>
        sum + Number(item.unitCost || 0) * Number(item.qtyUsed || 0),
      0,
    );
  }, [usage]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={34} className="mx-auto animate-spin text-violet-600" />

          <p className="mt-3 font-semibold text-slate-500">
            Loading part usage...
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
              <Boxes size={16} />
              Technician workspace
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Parts Used
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Review spare parts and inventory items used across your assigned
              jobs.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Usage Entries"
          value={usage.length}
          icon={PackageCheck}
        />

        <StatCard
          title="Total Quantity Used"
          value={totalQuantity}
          icon={Boxes}
        />

        <StatCard title="Different Parts" value={uniqueParts} icon={Wrench} />

        <StatCard
          title="Estimated Part Cost"
          value={formatCurrency(totalCost)}
          icon={PackageCheck}
        />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                Usage history
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Recorded parts
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {uniqueJobs} jobs contain recorded part usage.
              </p>
            </div>

            <div className="flex min-w-[280px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search job, part or SKU..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {filteredUsage.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Boxes size={28} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No part usage found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Parts recorded against your assigned jobs will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm font-bold text-slate-600">
                  <th className="px-6 py-4">Work Order</th>

                  <th className="px-6 py-4">Part</th>

                  <th className="px-6 py-4">SKU</th>

                  <th className="px-6 py-4">Quantity</th>

                  <th className="px-6 py-4">Unit Cost</th>

                  <th className="px-6 py-4">Used At</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsage.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-900">
                        {item.workOrderCode}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        {item.partName}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                        {item.sku}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-black text-violet-700">
                        {item.qtyUsed}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                      {formatCurrency(item.unitCost)}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-500">
                      {formatDateTime(item.usedAt)}
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

export default PartsUsedPage;
