import {
  Activity,
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const managerMenu = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    label: "Sites",
    icon: MapPin,
    path: "/sites",
  },
  {
    label: "Work Orders",
    icon: ClipboardList,
    path: "/work-orders",
  },
  {
    label: "Inventory",
    icon: Boxes,
    path: "/inventory",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
  {
    label: "Profile",
    icon: UserRound,
    path: "/profile",
  },
];

const technicianMenu = [
  {
    label: "My Jobs",
    icon: Wrench,
    path: "/my-jobs",
  },
  {
    label: "Time Logs",
    icon: ClipboardList,
    path: "/time-logs",
  },
  {
    label: "Parts Used",
    icon: Boxes,
    path: "/parts-used",
  },
  {
    label: "Performance",
    icon: BarChart3,
    path: "/performance",
  },
  {
    label: "Profile",
    icon: UserRound,
    path: "/profile",
  },
];

function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const { user, logout } = useAuth();

  const menuItems = user?.role === "TECHNICIAN" ? technicianMenu : managerMenu;

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl transition-all duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-24" : "w-72"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-950/40">
              <Activity size={22} />
            </div>

            {!isCollapsed && (
              <div>
                <p className="font-black tracking-tight">KEYSTONE</p>
                <p className="text-xs text-slate-400">Field Service Platform</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="hidden rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:block"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        <div className="px-4 pt-5">
          {!isCollapsed && (
            <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Workspace
            </p>
          )}

          <nav className="mt-3 space-y-2">
            {menuItems.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={label}
                to={path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `group flex items-center rounded-2xl px-3 py-3 transition ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />

                {!isCollapsed && <span className="font-semibold">{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div
            className={`rounded-2xl border border-white/10 bg-white/[0.04] p-3 ${
              isCollapsed ? "text-center" : ""
            }`}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 font-bold text-white">
                {user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user?.role || "Unknown role"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={`mt-3 flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200 ${
                isCollapsed ? "justify-center" : "gap-2"
              }`}
            >
              <LogOut size={17} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
