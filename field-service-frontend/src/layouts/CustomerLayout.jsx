import {
  Bell,
  CheckCheck,
  ClipboardList,
  Clock3,
  Home,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  RefreshCcw,
  User,
  Wrench,
  X,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

// =====================================================
// NOTIFICATION TIME FORMATTER
// =====================================================

function formatNotificationTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CustomerLayout() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const notificationRef = useRef(null);

  // =====================================================
  // STATE
  // =====================================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [notificationsRefreshing, setNotificationsRefreshing] = useState(false);

  // =====================================================
  // CUSTOMER NAVIGATION
  // =====================================================

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
    {
      label: "Profile",
      path: "/customer-profile",
      icon: User,
    },
  ];

  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadNotificationCount();

      setUnreadCount(Number(data?.count || 0));
    } catch {
      /*
       * Notification errors should not
       * break the customer workspace.
       */
    }
  }, []);

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = useCallback(
    async (showLoading = true, showRefresh = false) => {
      try {
        if (showLoading) {
          setNotificationsLoading(true);
        }

        if (showRefresh) {
          setNotificationsRefreshing(true);
        }

        const data = await getMyNotifications();

        const safeNotifications = Array.isArray(data) ? data : [];

        setNotifications(safeNotifications);

        const unread = safeNotifications.filter(
          (notification) => !notification.read,
        ).length;

        setUnreadCount(unread);
      } catch (error) {
        if (showLoading || showRefresh) {
          toast.error(
            error.response?.data?.message || "Unable to load notifications.",
          );
        }
      } finally {
        setNotificationsLoading(false);

        setNotificationsRefreshing(false);
      }
    },
    [],
  );

  // =====================================================
  // NOTIFICATION POLLING
  // =====================================================

  useEffect(() => {
    const initialTimerId = window.setTimeout(() => {
      void loadUnreadCount();
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => {
      window.clearTimeout(initialTimerId);

      window.clearInterval(intervalId);
    };
  }, [loadUnreadCount]);

  // =====================================================
  // CLOSE NOTIFICATION PANEL OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // INITIAL
  // =====================================================

  const getInitial = () => {
    if (!user?.name) {
      return "C";
    }

    return user.name.charAt(0).toUpperCase();
  };

  // =====================================================
  // TOGGLE NOTIFICATION PANEL
  // =====================================================

  const handleNotificationToggle = async () => {
    const nextState = !notificationOpen;

    setNotificationOpen(nextState);

    if (nextState) {
      await loadNotifications();
    }
  };

  // =====================================================
  // CLICK NOTIFICATION
  // =====================================================

  const handleNotificationClick = async (notification) => {
    try {
      // ---------------------------------------------
      // MARK UNREAD NOTIFICATION AS READ
      // ---------------------------------------------

      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read: true,
                }
              : item,
          ),
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      }

      // ---------------------------------------------
      // CLOSE DROPDOWN
      // ---------------------------------------------

      setNotificationOpen(false);

      // ---------------------------------------------
      // OPEN RELATED CUSTOMER REQUEST
      // ---------------------------------------------

      if (notification.workOrderId) {
        navigate(`/my-requests?workOrderId=${notification.workOrderId}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to open notification.",
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read: true,
        })),
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to mark notifications as read.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================== */}
      {/* TOP NAVBAR */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-violet-900/40 bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 shadow-lg">
        <div className="mx-auto flex h-[82px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => navigate("/customer-dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-950/40">
              <Wrench size={22} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xl font-black leading-none tracking-tight text-white">
                KEYSTONE
              </p>

              <p className="mt-1.5 text-sm font-medium text-violet-200">
                Customer Service Portal
              </p>
            </div>
          </button>

          {/* ================================================= */}
          {/* DESKTOP NAVIGATION */}
          {/* ================================================= */}

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-xl px-4 py-3 text-base font-bold transition",
                      isActive
                        ? "bg-white text-violet-700 shadow-md"
                        : "text-slate-200 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />

                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="flex items-center gap-2">
            {/* ================================================= */}
            {/* NOTIFICATIONS */}
            {/* ================================================= */}

            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-slate-100 transition ${
                  notificationOpen
                    ? "border-violet-300 bg-white/20 text-white ring-4 ring-violet-400/20"
                    : "border-white/10 bg-white/10 hover:bg-white/20 hover:text-white"
                }`}
                aria-label="Notifications"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <>
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />

                    <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* ================================================= */}
              {/* DROPDOWN */}
              {/* ================================================= */}

              {notificationOpen && (
                <div className="absolute right-0 top-[calc(100%+0.8rem)] z-[100] w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/30 sm:w-[26rem]">
                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <h3 className="text-base font-black text-slate-950">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${
                              unreadCount === 1 ? "" : "s"
                            }`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* REFRESH */}

                      <button
                        type="button"
                        onClick={() => loadNotifications(false, true)}
                        disabled={notificationsRefreshing}
                        title="Refresh notifications"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-700 disabled:opacity-50"
                      >
                        <RefreshCcw
                          size={17}
                          className={
                            notificationsRefreshing ? "animate-spin" : ""
                          }
                        />
                      </button>

                      {/* MARK ALL */}

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          title="Mark all as read"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-700"
                        >
                          <CheckCheck size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* LIST */}
                  {/* ================================================= */}

                  <div className="max-h-[28rem] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex min-h-48 items-center justify-center">
                        <div className="text-center">
                          <RefreshCcw
                            size={24}
                            className="mx-auto animate-spin text-violet-600"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-500">
                            Loading notifications...
                          </p>
                        </div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex min-h-52 items-center justify-center px-6">
                        <div className="text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                            <Bell size={21} />
                          </div>

                          <p className="mt-4 font-black text-slate-900">
                            No notifications yet
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Service updates will appear here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`relative block w-full border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 ${
                            notification.read
                              ? "bg-white hover:bg-slate-50"
                              : "bg-violet-50/70 hover:bg-violet-50"
                          }`}
                        >
                          {!notification.read && (
                            <span className="absolute left-2 top-5 h-2 w-2 rounded-full bg-violet-600" />
                          )}

                          <div className="pl-2">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className={`text-sm ${
                                  notification.read
                                    ? "font-bold text-slate-800"
                                    : "font-black text-slate-950"
                                }`}
                              >
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
                                  New
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-sm leading-5 text-slate-500">
                              {notification.message}
                            </p>

                            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                              <Clock3 size={13} />

                              {formatNotificationTime(notification.createdAt)}
                            </div>

                            {notification.workOrderCode && (
                              <p className="mt-2 text-xs font-bold text-violet-600">
                                Open {notification.workOrderCode} →
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* ================================================= */}
                  {/* FOOTER */}
                  {/* ================================================= */}

                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                    <p className="text-center text-xs text-slate-400">
                      Notifications are refreshed automatically every 30
                      seconds.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* PROFILE CARD */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => navigate("/customer-profile")}
              className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 transition hover:bg-white/20 sm:flex"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-base font-black text-white">
                {getInitial()}
              </div>

              <div className="max-w-[150px] text-left">
                <p className="truncate text-base font-black text-white">
                  {user?.name || "Customer"}
                </p>

                <p className="text-xs font-bold uppercase tracking-wide text-violet-200">
                  Customer
                </p>
              </div>
            </button>

            {/* ================================================= */}
            {/* LOGOUT */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-300 lg:flex"
              title="Logout"
            >
              <LogOut size={19} />
            </button>

            {/* ================================================= */}
            {/* MOBILE MENU */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
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
          <div className="border-t border-white/10 bg-slate-950 px-4 py-4 lg:hidden">
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
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold transition",
                        isActive
                          ? "bg-white text-violet-700"
                          : "text-slate-200 hover:bg-white/10 hover:text-white",
                      ].join(" ")
                    }
                  >
                    <Icon size={19} />

                    {item.label}
                  </NavLink>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-red-300 transition hover:bg-red-500/10"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================== */}
      {/* PAGE CONTENT */}
      {/* ===================================================== */}

      <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
