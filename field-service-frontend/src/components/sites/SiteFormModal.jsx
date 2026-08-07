import { useMemo, useState } from "react";
import { Building2, LoaderCircle, MapPin, Save, X } from "lucide-react";

function SiteFormContent({
  customers,
  initialCustomerId,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const defaultCustomerId = useMemo(() => {
    if (initialCustomerId) {
      return String(initialCustomerId);
    }

    return customers.length === 1 ? String(customers[0].id) : "";
  }, [customers, initialCustomerId]);

  const [formData, setFormData] = useState({
    customerId: defaultCustomerId,
    name: "",
    address: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.customerId) {
      errors.customerId = "Select a customer";
    }

    if (!formData.name.trim()) {
      errors.name = "Site name is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Site address is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(Number(formData.customerId), {
      name: formData.name.trim(),
      address: formData.address.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close site modal"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-500/30 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                <MapPin size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                  Site management
                </p>

                <h2 className="mt-1 text-2xl font-black">Register new site</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="siteCustomer"
              className="text-sm font-bold text-slate-700"
            >
              Customer
            </label>

            <div
              className={`mt-2 flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                fieldErrors.customerId
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-100"
              }`}
            >
              <Building2 size={18} className="shrink-0 text-slate-400" />

              <select
                id="siteCustomer"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-950 outline-none"
              >
                <option value="">Select customer</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {fieldErrors.customerId && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {fieldErrors.customerId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="siteName"
              className="text-sm font-bold text-slate-700"
            >
              Site name
            </label>

            <div
              className={`mt-2 flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                fieldErrors.name
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-100"
              }`}
            >
              <MapPin size={18} className="shrink-0 text-slate-400" />

              <input
                id="siteName"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Bangalore Head Office"
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>

            {fieldErrors.name && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="siteAddress"
              className="text-sm font-bold text-slate-700"
            >
              Site address
            </label>

            <div
              className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                fieldErrors.address
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-100"
              }`}
            >
              <textarea
                id="siteAddress"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
                placeholder="Enter the complete service location address"
                className="w-full resize-none bg-transparent py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>

            {fieldErrors.address && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {fieldErrors.address}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Register site
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SiteFormModal({
  isOpen,
  customers,
  initialCustomerId,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <SiteFormContent
      key={`site-${initialCustomerId || "new"}`}
      customers={customers}
      initialCustomerId={initialCustomerId}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default SiteFormModal;
