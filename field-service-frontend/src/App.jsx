import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";

import DashboardPage from "./pages/dashboard/DashboardPage";

import CustomersPage from "./pages/customers/CustomersPage";
import CustomerDetailsPage from "./pages/customers/CustomerDetailsPage";

import SitesPage from "./pages/sites/SitesPage";

import WorkOrdersPage from "./pages/workorders/WorkOrdersPage";

import MyJobsPage from "./pages/technician/MyJobsPage";
import TimeLogsPage from "./pages/technician/TimeLogsPage";
import PartsUsedPage from "./pages/technician/PartsUsedPage";
import PerformancePage from "./pages/technician/PerformancePage";

import InventoryPage from "./pages/inventory/InventoryPage";

import ReportsPage from "./pages/reports/ReportsPage";

import ProfilePage from "./pages/profile/ProfilePage";

import UserManagementPage from "./pages/usermanagement/UserManagementPage";

import CustomerDashboardPage from "./pages/customers/CustomerDashboardPage";

import ProtectedRoute from "./routes/ProtectedRoute";

import AppLayout from "./layouts/AppLayout";
import CustomerLayout from "./layouts/CustomerLayout";

import { useAuth } from "./hooks/useAuth";

/*
 * Displayed when a logged-in user tries
 * to access another role's protected page.
 */
function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400">
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

  /*
   * Decide where each role should go
   * after login.
   */
  const getHomePath = () => {
    if (!isAuthenticated) {
      return "/login";
    }

    switch (user?.role) {
      case "MANAGER":
        return "/dashboard";

      case "DISPATCHER":
        return "/dashboard";

      case "TECHNICIAN":
        return "/my-jobs";

      case "CUSTOMER":
        return "/customer-dashboard";

      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* ===================================================== */}
      {/* ROOT */}
      {/* ===================================================== */}

      <Route path="/" element={<Navigate to={getHomePath()} replace />} />

      {/* ===================================================== */}
      {/* LOGIN */}
      {/* ===================================================== */}

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

      {/* ===================================================== */}
      {/* MANAGER + DISPATCHER */}
      {/* ===================================================== */}

      <Route
        element={<ProtectedRoute allowedRoles={["MANAGER", "DISPATCHER"]} />}
      >
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/customers" element={<CustomersPage />} />

          <Route
            path="/customers/:customerId"
            element={<CustomerDetailsPage />}
          />

          <Route path="/sites" element={<SitesPage />} />

          <Route path="/work-orders" element={<WorkOrdersPage />} />

          <Route path="/inventory" element={<InventoryPage />} />
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* MANAGER ONLY */}
      {/* ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/reports" element={<ReportsPage />} />

          <Route path="/user-management" element={<UserManagementPage />} />
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* TECHNICIAN ONLY */}
      {/* ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/my-jobs" element={<MyJobsPage />} />

          <Route path="/time-logs" element={<TimeLogsPage />} />

          <Route path="/parts-used" element={<PartsUsedPage />} />

          <Route path="/performance" element={<PerformancePage />} />
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* CUSTOMER ONLY */}
      {/* ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route element={<CustomerLayout />}>
          <Route
            path="/customer-dashboard"
            element={<CustomerDashboardPage />}
          />

          {/*
           * We will add these pages next:
           *
           * /request-service
           * /my-requests
           * /customer-sites
           * /service-history
           */}
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* PROFILE - ALL AUTHENTICATED USERS */}
      {/* ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* UNAUTHORIZED */}
      {/* ===================================================== */}

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ===================================================== */}
      {/* UNKNOWN ROUTES */}
      {/* ===================================================== */}

      <Route path="*" element={<Navigate to={getHomePath()} replace />} />
    </Routes>
  );
}

export default App;
