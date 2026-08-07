import { useMemo, useState } from "react";
import { Boxes, PackagePlus, X } from "lucide-react";

function RestockPartModal({ isOpen, part, onClose, onSave, isSaving }) {
  const [quantityToAdd, setQuantityToAdd] = useState("");

  const currentStock = Number(part?.stockQty || 0);

  const newStock = useMemo(() => {
    const addedQuantity = Number(quantityToAdd || 0);

    return currentStock + addedQuantity;
  }, [currentStock, quantityToAdd]);

  if (!isOpen || !part) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const addedQuantity = Number(quantityToAdd);

    if (!Number.isInteger(addedQuantity) || addedQuantity <= 0) {
      return;
    }

    onSave({
      name: part.name,
      sku: part.sku,
      unitCost: part.unitCost,
      stockQty: newStock,
    });
  }

  function handleClose() {
    if (isSaving) {
      return;
    }

    setQuantityToAdd("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close restock modal"
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
      />

      <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
        {/* HEADER */}
        <header className="bg-slate-950 px-6 py-4 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600">
                <PackagePlus size={21} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
                  Inventory
                </p>

                <h2 className="mt-0.5 text-xl font-black">Restock Part</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* PART */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Part
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-950">
              {part.name}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              SKU: {part.sku}
            </p>
          </div>

          {/* STOCK */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-400">
                <Boxes size={14} />
                Current Stock
              </div>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {currentStock}
              </p>

              <p className="text-xs text-slate-500">units available</p>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-violet-500">
                <PackagePlus size={14} />
                New Stock
              </div>

              <p className="mt-2 text-2xl font-black text-violet-700">
                {newStock}
              </p>

              <p className="text-xs text-violet-600">units after restock</p>
            </div>
          </div>

          {/* QUANTITY */}
          <div>
            <label
              htmlFor="quantityToAdd"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Quantity to Add
            </label>

            <input
              id="quantityToAdd"
              type="number"
              min="1"
              step="1"
              required
              value={quantityToAdd}
              onChange={(event) => setQuantityToAdd(event.target.value)}
              placeholder="Example: 10"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* CALCULATION */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <strong>{currentStock}</strong>
            {" + "}
            <strong>{Number(quantityToAdd || 0)}</strong>
            {" = "}
            <strong>{newStock}</strong> units
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving || !quantityToAdd || Number(quantityToAdd) <= 0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PackagePlus size={17} />

              {isSaving ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RestockPartModal;
