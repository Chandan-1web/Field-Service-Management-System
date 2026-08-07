import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  Package,
  PackagePlus,
  RefreshCcw,
  Search,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import AddPartModal from "../../components/inventory/AddPartModal";
import RestockPartModal from "../../components/inventory/RestockPartModal";

import {
  createPart,
  getAllParts,
  updatePart,
} from "../../services/partService";

const LOW_STOCK_LIMIT = 5;

function InventoryStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
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

function InventorySkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-60 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="h-96 rounded-[2rem] bg-slate-200" />
    </div>
  );
}

function InventoryPage() {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const [selectedPart, setSelectedPart] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const fetchParts = useCallback(async (showToast = false) => {
    try {
      setError("");

      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getAllParts();

      setParts(Array.isArray(data) ? data : []);

      if (showToast) {
        toast.success("Inventory refreshed");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to load inventory.";

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
      void fetchParts();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchParts]);

  const handleCreatePart = async (partData) => {
    try {
      setIsSaving(true);

      await createPart(partData);

      setIsAddModalOpen(false);

      toast.success("Part created successfully");

      await fetchParts();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Unable to create part.";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const openRestockModal = (part) => {
    setSelectedPart(part);
    setIsRestockModalOpen(true);
  };

  const closeRestockModal = () => {
    if (isSaving) {
      return;
    }

    setIsRestockModalOpen(false);
    setSelectedPart(null);
  };

  const handleRestock = async (updatedPart) => {
    if (!selectedPart) {
      return;
    }

    try {
      setIsSaving(true);

      await updatePart(selectedPart.id, updatedPart);

      setIsRestockModalOpen(false);
      setSelectedPart(null);

      toast.success("Stock updated successfully");

      await fetchParts();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Unable to update stock.";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredParts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return parts;
    }

    return parts.filter((part) => {
      const name = part.name?.toLowerCase() || "";

      const sku = part.sku?.toLowerCase() || "";

      return name.includes(keyword) || sku.includes(keyword);
    });
  }, [parts, searchTerm]);

  const totalStock = useMemo(
    () => parts.reduce((sum, part) => sum + Number(part.stockQty || 0), 0),
    [parts],
  );

  const lowStockCount = useMemo(
    () =>
      parts.filter((part) => Number(part.stockQty) <= LOW_STOCK_LIMIT).length,
    [parts],
  );

  const totalInventoryValue = useMemo(
    () =>
      parts.reduce(
        (sum, part) =>
          sum + Number(part.unitCost || 0) * Number(part.stockQty || 0),
        0,
      ),
    [parts],
  );

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  if (isLoading) {
    return <InventorySkeleton />;
  }

  if (error && parts.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Inventory could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchParts()}
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
    <>
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-200">
                <Boxes size={16} />
                Inventory workspace
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Manage spare parts
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Track available stock, monitor low inventory and manage spare
                parts used by field technicians.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fetchParts(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCcw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Refresh inventory
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-violet-50"
              >
                <PackagePlus size={18} />
                Add part
              </button>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InventoryStatCard
            title="Total Parts"
            value={parts.length}
            description="Different spare parts registered in inventory."
            icon={Package}
            iconClass="bg-violet-100 text-violet-700"
          />

          <InventoryStatCard
            title="Units In Stock"
            value={totalStock}
            description="Combined quantity currently available."
            icon={Boxes}
            iconClass="bg-sky-100 text-sky-700"
          />

          <InventoryStatCard
            title="Low Stock"
            value={lowStockCount}
            description={`Parts with ${LOW_STOCK_LIMIT} units or fewer remaining.`}
            icon={AlertTriangle}
            iconClass="bg-red-100 text-red-700"
          />

          <InventoryStatCard
            title="Inventory Value"
            value={formatMoney(totalInventoryValue)}
            description="Estimated value of currently available stock."
            icon={IndianRupee}
            iconClass="bg-emerald-100 text-emerald-700"
          />
        </section>

        {/* INVENTORY DIRECTORY */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                  Inventory directory
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Spare parts
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Review available inventory, pricing and current stock levels.
                </p>
              </div>

              <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 lg:max-w-md">
                <Search size={18} className="text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search part name or SKU..."
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {filteredParts.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="mx-auto text-violet-500" />

              <h3 className="mt-4 text-xl font-black">No parts found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-4">Part</th>

                    <th className="px-6 py-4">SKU</th>

                    <th className="px-6 py-4">Unit Cost</th>

                    <th className="px-6 py-4">Stock</th>

                    <th className="px-6 py-4">Status</th>

                    <th className="px-6 py-4">Stock Value</th>

                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParts.map((part) => {
                    const quantity = Number(part.stockQty || 0);

                    const isOutOfStock = quantity === 0;

                    const isLowStock =
                      quantity > 0 && quantity <= LOW_STOCK_LIMIT;

                    const stockValue = Number(part.unitCost || 0) * quantity;

                    return (
                      <tr
                        key={part.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-6 py-5 font-black">{part.name}</td>

                        <td className="px-6 py-5">{part.sku}</td>

                        <td className="px-6 py-5">
                          {formatMoney(part.unitCost)}
                        </td>

                        <td className="px-6 py-5 font-black">{quantity}</td>

                        <td className="px-6 py-5">
                          {isOutOfStock ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                              Low stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                              In stock
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 font-bold">
                          {formatMoney(stockValue)}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => openRestockModal(part)}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                          >
                            <PackagePlus size={16} />
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AddPartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreatePart}
        isSaving={isSaving}
      />

      <RestockPartModal
        isOpen={isRestockModalOpen}
        part={selectedPart}
        onClose={closeRestockModal}
        onSave={handleRestock}
        isSaving={isSaving}
      />
    </>
  );
}

export default InventoryPage;
