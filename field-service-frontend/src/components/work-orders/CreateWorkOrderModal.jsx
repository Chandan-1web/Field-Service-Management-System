import { useMemo, useState } from "react";

import {
  AlertCircle,
  ClipboardList,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

function CreateWorkOrderForm({
  customers,
  sites,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    customerId: "",
    siteId: "",
  });

  const [errors, setErrors] = useState({});

  const filteredSites = useMemo(() => {
    if (!formData.customerId) {
      return [];
    }

    return sites.filter(
      (site) => String(site.customerId) === String(formData.customerId),
    );
  }, [sites, formData.customerId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      if (name === "customerId") {
        return {
          ...current,
          customerId: value,
          siteId: "",
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });

    setErrors((current) => ({
      ...current,
      [name]: "",
      ...(name === "customerId"
        ? {
            siteId: "",
          }
        : {}),
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!formData.title.trim()) {
      validationErrors.title = "Title is required";
    }

    if (!formData.customerId) {
      validationErrors.customerId = "Select a customer";
    }

    if (!formData.siteId) {
      validationErrors.siteId = "Select a site";
    }

    if (!formData.priority) {
      validationErrors.priority = "Select priority";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      customerId: Number(formData.customerId),
      siteId: Number(formData.siteId),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close create work order modal"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <section className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <header className="relative shrink-0 overflow-hidden bg-slate-950 px-6 py-5 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <ClipboardList size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                  Work orders
                </p>

                <h2 className="mt-1 text-2xl font-black">Create work order</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label
                htmlFor="workOrderTitle"
                className="text-sm font-bold text-slate-700"
              >
                Work order title
              </label>

              <div
                className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                  errors.title
                    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
                }`}
              >
                <input
                  id="workOrderTitle"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Printer not working"
                  autoFocus
                  className="w-full bg-transparent py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>

              {errors.title && (
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
                  <AlertCircle size={15} />
                  {errors.title}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="workOrderDescription"
                className="text-sm font-bold text-slate-700"
              >
                Description
              </label>

              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                <textarea
                  id="workOrderDescription"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Explain the customer issue or required service work"
                  className="w-full resize-none bg-transparent py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Add enough details so the technician can understand the issue.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="workOrderCustomer"
                  className="text-sm font-bold text-slate-700"
                >
                  Customer
                </label>

                <div
                  className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                    errors.customerId
                      ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                      : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
                  }`}
                >
                  <select
                    id="workOrderCustomer"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className="w-full bg-transparent py-3.5 text-sm text-slate-950 outline-none"
                  >
                    <option value="">Select customer</option>

                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {errors.customerId && (
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle size={15} />
                    {errors.customerId}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="workOrderSite"
                  className="text-sm font-bold text-slate-700"
                >
                  Site
                </label>

                <div
                  className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                    errors.siteId
                      ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                      : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
                  }`}
                >
                  <select
                    id="workOrderSite"
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleChange}
                    disabled={!formData.customerId}
                    className="w-full bg-transparent py-3.5 text-sm text-slate-950 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <option value="">
                      {!formData.customerId
                        ? "Select customer first"
                        : filteredSites.length === 0
                          ? "No sites available"
                          : "Select site"}
                    </option>

                    {filteredSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                {errors.siteId && (
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle size={15} />
                    {errors.siteId}
                  </div>
                )}

                {formData.customerId && filteredSites.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    This customer does not have any registered sites.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="workOrderPriority"
                className="text-sm font-bold text-slate-700"
              >
                Priority
              </label>

              <div
                className={`mt-2 rounded-2xl border bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 ${
                  errors.priority
                    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
                }`}
              >
                <select
                  id="workOrderPriority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3.5 text-sm text-slate-950 outline-none"
                >
                  <option value="LOW">Low — SLA due in 7 days</option>

                  <option value="MEDIUM">Medium — SLA due in 3 days</option>

                  <option value="HIGH">High — SLA due in 24 hours</option>

                  <option value="CRITICAL">
                    Critical — SLA due in 4 hours
                  </option>
                </select>
              </div>

              {errors.priority && (
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
                  <AlertCircle size={15} />
                  {errors.priority}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <p className="text-sm font-bold text-violet-900">
                What happens after creation?
              </p>

              <p className="mt-2 text-sm leading-6 text-violet-700">
                The work order will be created with status{" "}
                <span className="font-black">NEW</span>. Its SLA due time will
                be calculated automatically from the selected priority.
              </p>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create work order
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

function CreateWorkOrderModal({
  isOpen,
  customers,
  sites,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <CreateWorkOrderForm
      key="create-work-order"
      customers={customers}
      sites={sites}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default CreateWorkOrderModal;
