import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function AnalyticsCharts({
  statusChartData,
  activeCompletedData,
  slaChartData,
  slaHealth,
  totalActiveWorkOrders,
  overdueCount,
}) {
  const withinSlaCount = Math.max(totalActiveWorkOrders - overdueCount, 0);

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      {/* STATUS DONUT CHART */}
      <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
              Analytics
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              Work orders by status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current operational distribution
            </p>
          </div>

          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <BarChart3 size={20} />
          </div>
        </div>

        <div className="mt-5 h-72">
          {statusChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No status data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={4}
                  stroke="none"
                  animationDuration={900}
                >
                  {statusChartData.map((item) => (
                    <Cell key={item.name} fill={item.colour} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [`${value} work orders`, name]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statusChartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.colour,
                  }}
                />

                <span className="truncate text-xs font-semibold text-slate-600">
                  {item.name}
                </span>
              </div>

              <span className="text-sm font-black text-slate-950">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </article>

      {/* WORKLOAD BAR CHART */}
      <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
            Operations
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Workload comparison
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Active, completed and overdue workload
          </p>
        </div>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeCompletedData}
              margin={{
                top: 10,
                right: 5,
                left: -25,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(99, 102, 241, 0.06)",
                }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                }}
              />

              <Bar
                dataKey="total"
                radius={[10, 10, 0, 0]}
                fill="#6366f1"
                maxBarSize={48}
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* SLA HEALTH */}
      <article className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">
            SLA performance
          </p>

          <h2 className="mt-2 text-xl font-black">Service health</h2>

          <p className="mt-1 text-sm text-slate-400">
            Percentage of active work currently within SLA
          </p>

          <div className="relative mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={slaChartData}
              >
                <RadialBar
                  dataKey="value"
                  background={{
                    fill: "#1e293b",
                  }}
                  cornerRadius={20}
                  animationDuration={900}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-black">{slaHealth}%</p>

              <p className="mt-2 text-sm font-semibold text-slate-400">
                SLA health
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs text-slate-400">Within SLA</p>

              <p className="mt-2 text-2xl font-black text-emerald-300">
                {withinSlaCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs text-slate-400">Overdue</p>

              <p className="mt-2 text-2xl font-black text-amber-300">
                {overdueCount}
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

export default AnalyticsCharts;
