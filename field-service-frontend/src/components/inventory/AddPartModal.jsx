import { useState } from "react";
import { PackagePlus, X } from "lucide-react";

function AddPartModal({ isOpen, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unitCost: "",
    stockQty: "",
  });

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      unitCost: Number(formData.unitCost),
      stockQty: Number(formData.stockQty),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-950 px-8 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
              <PackagePlus size={28} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                Inventory
              </p>

              <h2 className="mt-1 text-3xl font-black">Add New Part</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Part Name
            </label>

            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="AC Capacitor"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              SKU
            </label>

            <input
              required
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="CAP-001"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Unit Cost
              </label>

              <input
                required
                min="0"
                step="0.01"
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
                placeholder="450"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Stock Quantity
              </label>

              <input
                required
                min="0"
                type="number"
                name="stockQty"
                value={formData.stockQty}
                onChange={handleChange}
                placeholder="20"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-3 font-bold text-white"
            >
              {isSaving ? "Creating..." : "Create Part"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPartModal;
