import { useState } from "react";
import { Building2, LoaderCircle, Mail, Save, X } from "lucide-react";

function CustomerFormContent({
  mode,
  customer,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    contactEmail: customer?.contactEmail || "",
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

    if (!formData.name.trim()) {
      errors.name = "Customer name is required";
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = "Enter a valid email address";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      contactEmail: formData.contactEmail.trim().toLowerCase(),
    });
  };

  const isEditMode = mode === "edit";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close customer modal"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-600/30 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Building2 size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                  Customer management
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {isEditMode ? "Edit customer" : "Add new customer"}
                </h2>
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
              htmlFor="customerName"
              className="text-sm font-bold text-slate-700"
            >
              Customer name
            </label>

            <div
              className={`mt-2 flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                fieldErrors.name
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
              }`}
            >
              <Building2 size={18} className="shrink-0 text-slate-400" />

              <input
                id="customerName"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: ABC Technologies Pvt Ltd"
                autoComplete="organization"
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
              htmlFor="customerEmail"
              className="text-sm font-bold text-slate-700"
            >
              Contact email
            </label>

            <div
              className={`mt-2 flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                fieldErrors.contactEmail
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
              }`}
            >
              <Mail size={18} className="shrink-0 text-slate-400" />

              <input
                id="customerEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@company.com"
                autoComplete="email"
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>

            {fieldErrors.contactEmail && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {fieldErrors.contactEmail}
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? "Update customer" : "Create customer"}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CustomerFormModal({
  isOpen,
  mode,
  customer,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <CustomerFormContent
      key={
        mode === "edit"
          ? `edit-${customer?.id ?? "customer"}`
          : "create-customer"
      }
      mode={mode}
      customer={customer}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default CustomerFormModal;
