import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPlus,
  Loader2,
  MapPin,
  Send,
  Wrench,
} from "lucide-react";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { getMyCustomerSites } from "../../services/customerSiteService";
import { createCustomerWorkOrder } from "../../services/customerWorkOrderService";

function RequestServicePage() {
  const navigate = useNavigate();

  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    siteId: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadSites = async () => {
      try {
        const data = await getMyCustomerSites();

        if (isMounted) {
          setSites(data);

          if (data.length === 1) {
            setFormData((current) => ({
              ...current,
              siteId: String(data[0].id),
            }));
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load service locations.",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSites(false);
        }
      }
    };

    void loadSites();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter the service issue.");
      return;
    }

    if (!formData.siteId) {
      toast.error("Please select a service location.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await createCustomerWorkOrder({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        siteId: Number(formData.siteId),
      });

      toast.success(
        `Service request ${response.code || ""} created successfully.`,
      );

      navigate("/my-requests");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to create service request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-violet-200">
            <Wrench size={17} />
            New Service Request
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Request Service
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-300">
            Tell us what problem you are facing. Our dispatcher will review the
            request and assign the right technician.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <ClipboardPlus size={23} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Service Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide enough information so we can understand the issue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* SITE */}
            <div>
              <label
                htmlFor="siteId"
                className="text-base font-bold text-slate-700"
              >
                Service Location
              </label>

              {loadingSites ? (
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Loading your sites...
                </div>
              ) : sites.length === 0 ? (
                <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="font-black text-amber-900">
                        No service location found
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        Add a site before creating a service request.
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/customer-sites")}
                        className="mt-3 font-black text-amber-900 underline"
                      >
                        Add Site
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  id="siteId"
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Select service location</option>

                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} — {site.address}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* TITLE */}
            <div>
              <label
                htmlFor="title"
                className="text-base font-bold text-slate-700"
              >
                What is the problem?
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Refrigerator not cooling"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label
                htmlFor="description"
                className="text-base font-bold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe when the problem started, what you observed, and any other useful details."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* PRIORITY */}
            <div>
              <label
                htmlFor="priority"
                className="text-base font-bold text-slate-700"
              >
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                <option value="LOW">Low — Minor inconvenience</option>

                <option value="MEDIUM">Medium — Needs attention</option>

                <option value="HIGH">High — Major service issue</option>

                <option value="CRITICAL">Critical — Urgent problem</option>
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/customer-dashboard")}
                disabled={submitting}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || loadingSites || sites.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 py-3.5 text-base font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={19} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </article>

        {/* INFORMATION */}
        <aside className="space-y-5">
          <article className="rounded-[2rem] border border-violet-100 bg-violet-50 p-6">
            <CheckCircle2 size={26} className="text-violet-700" />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              What happens next?
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-black text-slate-900">1.</span> Your
                request is created with status <strong>NEW</strong>.
              </p>

              <p>
                <span className="font-black text-slate-900">2.</span> Our
                dispatcher reviews the issue.
              </p>

              <p>
                <span className="font-black text-slate-900">3.</span> An
                appropriate technician is assigned.
              </p>

              <p>
                <span className="font-black text-slate-900">4.</span> You can
                track progress from My Requests.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <MapPin size={24} className="text-violet-700" />

            <h3 className="mt-4 text-lg font-black text-slate-950">
              Service locations
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You currently have {sites.length} registered{" "}
              {sites.length === 1 ? "site" : "sites"}.
            </p>

            <button
              type="button"
              onClick={() => navigate("/customer-sites")}
              className="mt-4 font-black text-violet-700"
            >
              Manage Sites →
            </button>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default RequestServicePage;
