import {
  Boxes,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  getMyPartUsage,
  usePartForWorkOrder as recordPartUsage,
} from "../../services/partUsageService";

import { getAllParts } from "../../services/partService";

import { getMyWorkOrders } from "../../services/workOrderService";

// =====================================================
// HELPERS
// =====================================================

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

// =====================================================
// MAIN PAGE
// =====================================================

function PartsUsedPage() {
  const [usage, setUsage] = useState([]);

  const [jobs, setJobs] = useState([]);

  const [parts, setParts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [recordModalOpen, setRecordModalOpen] = useState(false);

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState("");

  const [selectedPartId, setSelectedPartId] = useState("");

  const [quantity, setQuantity] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // LOAD PAGE DATA
  // =====================================================

  const loadData = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const [usageData, jobsData, partsData] = await Promise.all([
        getMyPartUsage(),
        getMyWorkOrders(),
        getAllParts(),
      ]);

      setUsage(Array.isArray(usageData) ? usageData : []);

      setJobs(Array.isArray(jobsData) ? jobsData : []);

      setParts(Array.isArray(partsData) ? partsData : []);

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
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadData]);

  // =====================================================
  // AVAILABLE JOBS
  // =====================================================

  const availableJobs = useMemo(() => {
    return jobs.filter((job) => !["CLOSED", "CANCELLED"].includes(job.status));
  }, [jobs]);

  // =====================================================
  // AVAILABLE PARTS
  // =====================================================

  const availableParts = useMemo(() => {
    return parts.filter((part) => Number(part.stockQty || 0) > 0);
  }, [parts]);

  // =====================================================
  // SELECTED PART
  // =====================================================

  const selectedPart = useMemo(() => {
    if (!selectedPartId) {
      return null;
    }

    return (
      parts.find((part) => String(part.id) === String(selectedPartId)) || null
    );
  }, [parts, selectedPartId]);

  // =====================================================
  // SEARCH FILTER
  // =====================================================

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

  // =====================================================
  // STATS
  // =====================================================

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

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openRecordModal = () => {
    setSelectedWorkOrderId("");
    setSelectedPartId("");
    setQuantity("");

    setRecordModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeRecordModal = () => {
    if (submitting) {
      return;
    }

    setRecordModalOpen(false);

    setSelectedWorkOrderId("");
    setSelectedPartId("");
    setQuantity("");
  };

  // =====================================================
  // SAVE PART USAGE
  // =====================================================

  const handleRecordPartUsage = async (event) => {
    event.preventDefault();

    if (!selectedWorkOrderId) {
      toast.error("Select a work order.");

      return;
    }

    if (!selectedPartId) {
      toast.error("Select an inventory part.");

      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      toast.error("Enter a valid quantity.");

      return;
    }

    if (!selectedPart) {
      toast.error("Selected part could not be found.");

      return;
    }

    const availableStock = Number(selectedPart.stockQty || 0);

    if (parsedQuantity > availableStock) {
      toast.error(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available in stock.`,
      );

      return;
    }

    try {
      setSubmitting(true);

      await recordPartUsage(selectedWorkOrderId, {
        partId: Number(selectedPartId),

        qtyUsed: parsedQuantity,
      });

      toast.success("Part usage recorded successfully.");

      setRecordModalOpen(false);

      setSelectedWorkOrderId("");
      setSelectedPartId("");
      setQuantity("");

      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to record part usage.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

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
    <>
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
                <Boxes size={16} />
                Technician workspace
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Parts Used
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Record spare parts used on assigned work orders and review your
                complete part usage history.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={refreshing}
                onClick={() => loadData(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCcw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openRecordModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                <Plus size={18} />
                Record Part Usage
              </button>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* HISTORY */}
        {/* ================================================= */}

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
                  {uniqueJobs} job
                  {uniqueJobs === 1 ? "" : "s"} contain recorded part usage.
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
                  Use Record Part Usage to record inventory items used on your
                  assigned jobs.
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

                    <th className="px-6 py-4">Remaining Stock</th>

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

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-xl px-3 py-2 text-sm font-black ${
                            Number(item.remainingStock || 0) <= 5
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.remainingStock}
                        </span>
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

      {/* ===================================================== */}
      {/* RECORD PART USAGE MODAL */}
      {/* ===================================================== */}

      {recordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Technician inventory
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Record Part Usage
                </h2>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={closeRecordModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleRecordPartUsage} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="part-work-order"
                  className="text-sm font-black text-slate-800"
                >
                  Work Order
                </label>

                <select
                  id="part-work-order"
                  value={selectedWorkOrderId}
                  onChange={(event) =>
                    setSelectedWorkOrderId(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Select assigned work order</option>

                  {availableJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.code} — {job.title} ({formatStatus(job.status)})
                    </option>
                  ))}
                </select>

                {availableJobs.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    You currently have no open assigned work orders.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="inventory-part"
                  className="text-sm font-black text-slate-800"
                >
                  Inventory Part
                </label>

                <select
                  id="inventory-part"
                  value={selectedPartId}
                  onChange={(event) => {
                    setSelectedPartId(event.target.value);

                    setQuantity("");
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Select inventory part</option>

                  {availableParts.map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.name} — {part.sku} — Stock: {part.stockQty}
                    </option>
                  ))}
                </select>

                {availableParts.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    No inventory parts currently have available stock.
                  </p>
                )}
              </div>

              {selectedPart && (
                <div className="grid gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      SKU
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedPart.sku}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Available Stock
                    </p>

                    <p className="mt-1 text-sm font-black text-violet-700">
                      {selectedPart.stockQty}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Unit Cost
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {formatCurrency(selectedPart.unitCost)}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="part-quantity"
                  className="text-sm font-black text-slate-800"
                >
                  Quantity Used
                </label>

                <input
                  id="part-quantity"
                  type="number"
                  min="1"
                  max={
                    selectedPart
                      ? Number(selectedPart.stockQty || 1)
                      : undefined
                  }
                  step="1"
                  value={quantity}
                  disabled={!selectedPart}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Example: 2"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {selectedPart && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Maximum available:{" "}
                    <span className="font-black text-violet-700">
                      {selectedPart.stockQty}
                    </span>
                  </p>
                )}
              </div>

              {selectedPart && Number(quantity) > 0 && (
                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Estimated usage cost
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    {formatCurrency(
                      Number(selectedPart.unitCost || 0) *
                        Number(quantity || 0),
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRecordModal}
                  disabled={submitting}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    availableJobs.length === 0 ||
                    availableParts.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PackageCheck size={18} />
                      Save Part Usage
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================
// STAT CARD
// =====================================================

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
