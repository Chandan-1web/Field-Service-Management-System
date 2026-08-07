import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CustomersPage from "./pages/customers/CustomersPage";
import CustomerDetailsPage from "./pages/customers/CustomerDetailsPage";
import SitesPage from "./pages/sites/SitesPage";
import WorkOrdersPage from "./pages/workorders/WorkOrdersPage";
import MyJobsPage from "./pages/technician/MyJobsPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./hooks/useAuth";
import ProfilePage from "./pages/profile/ProfilePage";

function PlaceholderPage({ title }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
        Module
      </p>

      <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>

      <p className="mt-3 text-slate-500">
        This module will be connected to the Spring Boot backend in the upcoming
        steps.
      </p>
    </section>
  );
}

function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-400">
          Access denied
        </p>

        <h1 className="mt-3 text-4xl font-black">You are not authorized</h1>

        <p className="mt-4 text-slate-400">
          Your account does not have permission to open this page.
        </p>
      </div>
    </main>
  );
}

function App() {
  const { isAuthenticated, user } = useAuth();

  const getHomePath = () => {
    if (!isAuthenticated) {
      return "/login";
    }

    if (user?.role === "TECHNICIAN") {
      return "/my-jobs";
    }

    return "/dashboard";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getHomePath()} replace />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getHomePath()} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/customers" element={<CustomersPage />} />

          <Route
            path="/customers/:customerId"
            element={<CustomerDetailsPage />}
          />

          <Route path="/sites" element={<SitesPage />} />

          <Route path="/work-orders" element={<WorkOrdersPage />} />

          <Route path="/my-jobs" element={<MyJobsPage />} />

          <Route path="/inventory" element={<InventoryPage />} />

          <Route path="/reports" element={<ReportsPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/time-logs"
            element={<PlaceholderPage title="Time Logs" />}
          />

          <Route
            path="/parts-used"
            element={<PlaceholderPage title="Parts Used" />}
          />

          <Route
            path="/performance"
            element={<PlaceholderPage title="Performance" />}
          />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="*" element={<Navigate to={getHomePath()} replace />} />
    </Routes>
  );
}

export default App;
