import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  MapPin,
  Users,
} from "lucide-react";

const actions = [
  {
    key: "work-order",
    title: "Create Work Order",
    description: "Register a new service request",
    icon: ClipboardList,
    iconClass: "bg-violet-500/15 text-violet-300",
    hoverClass: "hover:border-violet-400/40 hover:bg-violet-500/10",
  },
  {
    key: "customer",
    title: "Add Customer",
    description: "Create a customer account",
    icon: Users,
    iconClass: "bg-sky-500/15 text-sky-300",
    hoverClass: "hover:border-sky-400/40 hover:bg-sky-500/10",
  },
  {
    key: "site",
    title: "Register Site",
    description: "Add a service location",
    icon: MapPin,
    iconClass: "bg-emerald-500/15 text-emerald-300",
    hoverClass: "hover:border-emerald-400/40 hover:bg-emerald-500/10",
  },
  {
    key: "report",
    title: "Generate Report",
    description: "Review SLA and performance",
    icon: BarChart3,
    iconClass: "bg-amber-500/15 text-amber-300",
    hoverClass: "hover:border-amber-400/40 hover:bg-amber-500/10",
  },
];

function QuickActions({
  onCreateWorkOrder,
  onAddCustomer,
  onRegisterSite,
  onGenerateReport,
}) {
  const clickHandlers = {
    "work-order": onCreateWorkOrder,
    customer: onAddCustomer,
    site: onRegisterSite,
    report: onGenerateReport,
  };

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-xl">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-300">
          Quick actions
        </p>

        <h2 className="mt-2 text-2xl font-black">Move faster</h2>

        <p className="mt-2 leading-7 text-slate-400">
          Jump directly into the most common management tasks.
        </p>

        <div className="mt-6 space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                type="button"
                key={action.key}
                onClick={clickHandlers[action.key]}
                className={`group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${action.hoverClass}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 ${action.iconClass}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div>
                    <p className="font-bold">{action.title}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {action.description}
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default QuickActions;
