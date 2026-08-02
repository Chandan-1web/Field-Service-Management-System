import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./hooks/useAuth";

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
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/customers"
            element={<PlaceholderPage title="Customers" />}
          />

          <Route path="/sites" element={<PlaceholderPage title="Sites" />} />

          <Route
            path="/work-orders"
            element={<PlaceholderPage title="Work Orders" />}
          />

          <Route
            path="/inventory"
            element={<PlaceholderPage title="Inventory" />}
          />

          <Route
            path="/reports"
            element={<PlaceholderPage title="Reports" />}
          />

          <Route
            path="/profile"
            element={<PlaceholderPage title="Profile" />}
          />

          <Route
            path="/my-jobs"
            element={<PlaceholderPage title="My Jobs" />}
          />

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

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
