import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ClipboardList,
  MapPin,
  Package,
  RefreshCcw,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AnalyticsCharts from "../../components/dashboard/AnalyticsCharts";
import DashboardHero from "../../components/dashboard/DashboardHero";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import MetricCard from "../../components/dashboard/MetricCard";
import OverduePanel from "../../components/dashboard/OverduePanel";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentWorkOrders from "../../components/dashboard/RecentWorkOrders";
import StatusDistribution from "../../components/dashboard/StatusDistribution";
import TechnicianLeaderboard from "../../components/dashboard/TechnicianLeaderboard";

import { useAuth } from "../../hooks/useAuth";
import { getDashboardData } from "../../services/dashboardService";

import {
  calculateActiveWorkOrders,
  calculateCompletionRate,
  calculateSlaHealth,
  chartColours,
  getGreeting,
  getWorkspaceName,
  statusConfig,
} from "../../utils/dashboardUtils";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);

  const [overdueWorkOrders, setOverdueWorkOrders] = useState([]);

  const [recentWorkOrders, setRecentWorkOrders] = useState([]);

  const [technicianPerformance, setTechnicianPerformance] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchDashboardData = useCallback(async (showRefreshToast = false) => {
    try {
      setError("");

      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getDashboardData();

      setSummary(data.summary);

      setOverdueWorkOrders(data.overdueWorkOrders);

      setRecentWorkOrders(data.recentWorkOrders);

      setTechnicianPerformance(data.technicianPerformance);

      setLastSyncTime(new Date());

      if (showRefreshToast) {
        toast.success("Dashboard data refreshed");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to load dashboard data.";

      setError(message);

      if (showRefreshToast) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    const clockTimerId = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => {
      window.clearInterval(clockTimerId);
    };
  }, []);

  const totalActiveWorkOrders = useMemo(
    () => calculateActiveWorkOrders(summary),
    [summary],
  );

  const completionRate = useMemo(
    () => calculateCompletionRate(summary),
    [summary],
  );

  const slaHealth = useMemo(
    () => calculateSlaHealth(totalActiveWorkOrders, overdueWorkOrders.length),
    [totalActiveWorkOrders, overdueWorkOrders.length],
  );

  const statusChartData = useMemo(
    () =>
      statusConfig
        .map(({ key, label, colourKey }) => ({
          name: label,
          value: summary?.[key] || 0,
          colour: chartColours[colourKey] || "#94a3b8",
        }))
        .filter((item) => item.value > 0),
    [summary],
  );

  const activeCompletedData = useMemo(
    () => [
      {
        name: "Active",
        total: totalActiveWorkOrders,
      },
      {
        name: "Completed",
        total: summary?.completedWorkOrders || 0,
      },
      {
        name: "Closed",
        total: summary?.closedWorkOrders || 0,
      },
      {
        name: "Overdue",
        total: overdueWorkOrders.length,
      },
    ],
    [summary, totalActiveWorkOrders, overdueWorkOrders.length],
  );

  const slaChartData = useMemo(
    () => [
      {
        name: "SLA Health",
        value: slaHealth,
        fill:
          slaHealth >= 80 ? "#10b981" : slaHealth >= 50 ? "#f59e0b" : "#ef4444",
      },
    ],
    [slaHealth],
  );

  const totalWorkOrderProgress = summary?.totalWorkOrders ? 100 : 0;

  const customerCoverage = summary?.totalCustomers
    ? Math.min(
        Math.round(((summary.totalSites || 0) / summary.totalCustomers) * 50),
        100,
      )
    : 0;

  const siteCoverage = summary?.totalWorkOrders
    ? Math.min(
        Math.round(((summary.totalSites || 0) / summary.totalWorkOrders) * 100),
        100,
      )
    : 0;

  const inventoryAvailability = summary?.totalParts ? 100 : 0;

  const greeting = getGreeting(currentDateTime);

  const workspaceName = getWorkspaceName(user?.role);

  const formattedDate = currentDateTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentDateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedLastSync = lastSyncTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error && !summary) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-red-100/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Dashboard could not be loaded
          </h1>

          <p className="mt-3 leading-7 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => fetchDashboardData()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-700"
          >
            <RefreshCcw size={18} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <DashboardHero
        user={user}
        greeting={greeting}
        workspaceName={workspaceName}
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        formattedLastSync={formattedLastSync}
        overdueCount={overdueWorkOrders.length}
        totalActiveWorkOrders={totalActiveWorkOrders}
        completionRate={completionRate}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchDashboardData(true)}
        onViewWorkOrders={() => navigate("/work-orders")}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Work Orders"
          value={summary?.totalWorkOrders || 0}
          description="All service requests currently recorded."
          icon={ClipboardList}
          iconClass="bg-violet-100 text-violet-700"
          progress={totalWorkOrderProgress}
          progressClass="bg-gradient-to-r from-violet-500 to-indigo-600"
          accentClass="from-violet-500/10"
          footerText="Platform activity"
          onClick={() => navigate("/work-orders")}
        />

        <MetricCard
          title="Customers"
          value={summary?.totalCustomers || 0}
          description="Customer organisations managed in the platform."
          icon={Users}
          iconClass="bg-sky-100 text-sky-700"
          progress={customerCoverage}
          progressClass="bg-gradient-to-r from-sky-500 to-cyan-500"
          accentClass="from-sky-500/10"
          footerText="Site coverage"
          onClick={() => navigate("/customers")}
        />

        <MetricCard
          title="Sites"
          value={summary?.totalSites || 0}
          description="Service locations connected to customers."
          icon={MapPin}
          iconClass="bg-emerald-100 text-emerald-700"
          progress={siteCoverage}
          progressClass="bg-gradient-to-r from-emerald-500 to-teal-500"
          accentClass="from-emerald-500/10"
          footerText="Work-order coverage"
          onClick={() => navigate("/sites")}
        />

        <MetricCard
          title="Inventory Parts"
          value={summary?.totalParts || 0}
          description="Parts currently available for field work."
          icon={Package}
          iconClass="bg-amber-100 text-amber-700"
          progress={inventoryAvailability}
          progressClass="bg-gradient-to-r from-amber-500 to-orange-500"
          accentClass="from-amber-500/10"
          footerText="Inventory availability"
          onClick={() => navigate("/inventory")}
        />
      </section>

      <AnalyticsCharts
        statusChartData={statusChartData}
        activeCompletedData={activeCompletedData}
        slaChartData={slaChartData}
        slaHealth={slaHealth}
        totalActiveWorkOrders={totalActiveWorkOrders}
        overdueCount={overdueWorkOrders.length}
      />

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <StatusDistribution
          summary={summary}
          statusConfig={statusConfig}
          onViewWorkOrders={() => navigate("/work-orders")}
        />

        <OverduePanel
          overdueWorkOrders={overdueWorkOrders}
          onViewReports={() => navigate("/reports")}
          onViewWorkOrder={(id) => navigate(`/work-orders/${id}`)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <RecentWorkOrders
          recentWorkOrders={recentWorkOrders}
          onViewAll={() => navigate("/work-orders")}
          onViewWorkOrder={(id) => navigate(`/work-orders/${id}`)}
        />

        <QuickActions
          onCreateWorkOrder={() => navigate("/work-orders")}
          onAddCustomer={() => navigate("/customers")}
          onRegisterSite={() => navigate("/sites")}
          onGenerateReport={() => navigate("/reports")}
        />
      </section>

      <section>
        <TechnicianLeaderboard
          technicians={technicianPerformance}
          onViewReports={() => navigate("/reports")}
        />
      </section>
    </div>
  );
}

export default DashboardPage;
