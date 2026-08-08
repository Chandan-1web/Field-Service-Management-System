import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl sm:px-9 lg:px-12 lg:py-12">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-violet-200">
              <ShieldCheck size={16} />
              Customer Service Portal
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Hello, {user?.name || "Customer"} 👋
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Need help with your equipment? Request a service, track repairs
              and manage your service locations from one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/request-service")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 font-black text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
              >
                <Plus size={19} />
                Request Service
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-requests")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                Track My Requests
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="hidden h-44 w-44 shrink-0 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 lg:flex">
            <Wrench size={70} className="text-violet-300" />
          </div>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Requests"
          value="0"
          description="All service requests"
          icon={ClipboardList}
        />

        <SummaryCard
          title="Active Requests"
          value="0"
          description="Currently being handled"
          icon={Clock3}
        />

        <SummaryCard
          title="Completed Services"
          value="0"
          description="Successfully completed"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Registered Sites"
          value="0"
          description="Your service locations"
          icon={MapPin}
        />
      </section>

      {/* ACTIVE REQUEST */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                Active Service
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Your current service request
              </h2>
            </div>

            <Clock3 className="text-violet-600" size={24} />
          </div>

          <div className="mt-8 flex min-h-52 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Wrench size={25} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No active service request
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                When you request a service, you will be able to track its status
                and assigned technician here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/request-service")}
                className="mt-5 inline-flex items-center gap-2 font-black text-violet-700"
              >
                Request Service
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </article>

        {/* QUICK ACTIONS */}
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
            Quick Actions
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            What do you need?
          </h2>

          <div className="mt-6 space-y-3">
            <QuickAction
              icon={Plus}
              title="Request Service"
              description="Report a new service problem"
              onClick={() => navigate("/request-service")}
            />

            <QuickAction
              icon={ClipboardList}
              title="My Requests"
              description="Track your existing requests"
              onClick={() => navigate("/my-requests")}
            />

            <QuickAction
              icon={MapPin}
              title="My Sites"
              description="Manage your service locations"
              onClick={() => navigate("/customer-sites")}
            />
          </div>
        </article>
      </section>

      {/* RECENT REQUESTS */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              Recent Activity
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Recent service requests
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/my-requests")}
            className="inline-flex items-center gap-2 text-sm font-black text-violet-700"
          >
            View all requests
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="mt-6 flex min-h-36 items-center justify-center rounded-3xl bg-slate-50 p-6 text-center">
          <div>
            <ClipboardList size={28} className="mx-auto text-slate-400" />

            <p className="mt-3 font-bold text-slate-700">
              No recent service requests
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your latest service activity will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>

          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-violet-600 group-hover:text-white">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black text-slate-900">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <ArrowRight
        size={18}
        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-700"
      />
    </button>
  );
}

export default CustomerDashboardPage;
