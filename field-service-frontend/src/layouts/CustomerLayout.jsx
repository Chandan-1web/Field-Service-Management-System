import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../hooks/useAuth";

function CustomerLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Home",
      path: "/customer-dashboard",
      icon: Home,
    },
    {
      label: "Request Service",
      path: "/request-service",
      icon: PlusCircle,
    },
    {
      label: "My Requests",
      path: "/my-requests",
      icon: ClipboardList,
    },
    {
      label: "My Sites",
      path: "/customer-sites",
      icon: MapPin,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  const getInitial = () => {
    if (!user?.name) {
      return "C";
    }

    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================================================= */}
      {/* TOP NAVBAR */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LOGO */}
          <button
            type="button"
            onClick={() => navigate("/customer-dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <Wrench size={21} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-lg font-black leading-none tracking-tight text-slate-950">
                KEYSTONE
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Customer Service Portal
              </p>
            </div>
          </button>

          {/* ================================================= */}
          {/* DESKTOP NAVIGATION */}
          {/* ================================================= */}

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  <Icon size={17} />

                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="flex items-center gap-2">
            {/* NOTIFICATION */}

            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* PROFILE */}

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50 sm:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 font-black text-white">
                {getInitial()}
              </div>

              <div className="max-w-[140px] text-left">
                <p className="truncate text-sm font-black text-slate-900">
                  {user?.name || "Customer"}
                </p>

                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Customer
                </p>
              </div>
            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 lg:flex"
              title="Logout"
            >
              <LogOut size={18} />
            </button>

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* MOBILE NAVIGATION */}
        {/* ================================================= */}

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="mx-auto max-w-[1600px] space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-600 hover:bg-slate-50",
                      ].join(" ")
                    }
                  >
                    <Icon size={18} />

                    {item.label}
                  </NavLink>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <User size={18} />
                Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================================================= */}
      {/* PAGE CONTENT */}
      {/* ================================================= */}

      <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
