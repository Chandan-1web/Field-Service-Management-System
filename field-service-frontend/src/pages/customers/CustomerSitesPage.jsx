import { useEffect, useState } from "react";

import { Building2, Loader2, MapPin, Plus, RefreshCcw, X } from "lucide-react";

import toast from "react-hot-toast";

import {
  createMyCustomerSite,
  getMyCustomerSites,
} from "../../services/customerSiteService";

function CustomerSitesPage() {
  const [sites, setSites] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [showAddSite, setShowAddSite] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const loadSites = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }

      const data = await getMyCustomerSites();

      setSites(data);

      if (showToast) {
        toast.success("Sites refreshed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load your sites.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialSites = async () => {
      try {
        const data = await getMyCustomerSites();

        if (isMounted) {
          setSites(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Unable to load your sites.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialSites();

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

    if (!formData.name.trim()) {
      toast.error("Site name is required.");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Site address is required.");
      return;
    }

    try {
      setSubmitting(true);

      const createdSite = await createMyCustomerSite({
        name: formData.name.trim(),
        address: formData.address.trim(),
      });

      setSites((current) => [...current, createdSite]);

      setFormData({
        name: "",
        address: "",
      });

      setShowAddSite(false);

      toast.success("Site added successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add site.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="mx-auto animate-spin text-violet-600" />

          <p className="mt-3 text-base font-semibold text-slate-500">
            Loading your sites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-violet-200">
              <MapPin size={17} />
              Service Locations
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              My Sites
            </h1>

            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-300">
              Manage the locations where you may request field service.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSite(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 text-base font-black text-white shadow-lg transition hover:bg-violet-500"
          >
            <Plus size={20} />
            Add Site
          </button>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-slate-500">
              Registered Sites
            </p>

            <p className="mt-2 text-4xl font-black text-slate-950">
              {sites.length}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Locations linked to your customer account
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadSites(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* SITES */}
      {sites.length === 0 ? (
        <section className="flex min-h-80 items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <MapPin size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No sites added yet
            </h2>

            <p className="mt-3 text-base leading-7 text-slate-500">
              Add your home, office, branch or other service location before
              requesting a repair.
            </p>

            <button
              type="button"
              onClick={() => setShowAddSite(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 font-black text-white"
            >
              <Plus size={19} />
              Add Your First Site
            </button>
          </div>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <article
              key={site.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <Building2 size={25} />
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-700">
                  Active
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                {site.name}
              </h2>

              <div className="mt-4 flex items-start gap-3 text-slate-500">
                <MapPin size={19} className="mt-0.5 shrink-0 text-violet-600" />

                <p className="text-base leading-7">
                  {site.address || "No address added"}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ADD SITE MODAL */}
      {showAddSite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-950 p-6 text-white">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-300">
                  Service Location
                </p>

                <h2 className="mt-2 text-2xl font-black">Add Site</h2>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowAddSite(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="siteName"
                  className="text-base font-bold text-slate-700"
                >
                  Site Name
                </label>

                <input
                  id="siteName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: My Home"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="siteAddress"
                  className="text-base font-bold text-slate-700"
                >
                  Address
                </label>

                <textarea
                  id="siteAddress"
                  name="address"
                  rows={4}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete service address"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAddSite(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-black text-white disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Site
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default CustomerSitesPage;
