import {
  Bell,
  CheckCheck,
  Clock3,
  Menu,
  RefreshCcw,
  Search,
  UserRound,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { getMyProfile } from "../../services/profileService";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

const BACKEND_ORIGIN = "http://localhost:8081";

// =====================================================
// MANAGER / DISPATCHER SEARCH ITEMS
// =====================================================

const managerSearchItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    keywords: ["dashboard", "home", "overview"],
  },
  {
    label: "Customers",
    path: "/customers",
    keywords: ["customer", "customers", "client", "clients"],
  },
  {
    label: "Sites",
    path: "/sites",
    keywords: ["site", "sites", "location", "locations"],
  },
  {
    label: "Work Orders",
    path: "/work-orders",
    keywords: [
      "work order",
      "work orders",
      "workorder",
      "workorders",
      "job",
      "jobs",
      "service job",
    ],
  },
  {
    label: "Inventory",
    path: "/inventory",
    keywords: ["inventory", "part", "parts", "stock", "spare parts"],
  },
  {
    label: "Reports",
    path: "/reports",
    keywords: ["report", "reports", "analytics", "statistics"],
  },
  {
    label: "User Management",
    path: "/user-management",
    keywords: [
      "user management",
      "users",
      "manage users",
      "manage user",
      "user",
      "user accounts",
      "accounts",
      "technicians",
      "technician",
      "dispatchers",
      "dispatcher",
      "customer accounts",
      "employee accounts",
    ],
  },
  {
    label: "Profile",
    path: "/profile",
    keywords: ["profile", "account", "my profile"],
  },
];

// =====================================================
// TECHNICIAN SEARCH ITEMS
// =====================================================

const technicianSearchItems = [
  {
    label: "My Jobs",
    path: "/my-jobs",
    keywords: ["my jobs", "jobs", "job", "work", "assigned jobs"],
  },
  {
    label: "Time Logs",
    path: "/time-logs",
    keywords: ["time logs", "time log", "time", "hours", "work hours"],
  },
  {
    label: "Parts Used",
    path: "/parts-used",
    keywords: ["parts used", "part used", "parts", "inventory"],
  },
  {
    label: "Performance",
    path: "/performance",
    keywords: ["performance", "analytics", "statistics", "productivity"],
  },
  {
    label: "Profile",
    path: "/profile",
    keywords: ["profile", "account", "my profile"],
  },
];

// =====================================================
// NOTIFICATION TIME
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

function Topbar({ openMobileSidebar }) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const notificationRef = useRef(null);

  // =====================================================
  // STATE
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [profile, setProfile] = useState(null);

  const [photoError, setPhotoError] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [notificationsRefreshing, setNotificationsRefreshing] = useState(false);

  const searchItems =
    user?.role === "TECHNICIAN" ? technicianSearchItems : managerSearchItems;

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        if (isMounted) {
          setProfile(data);
          setPhotoError(false);
        }
      } catch {
        // Authentication user used as fallback.
      }
    };

    const timerId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    const handleProfileUpdated = () => {
      void loadProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      isMounted = false;

      window.clearTimeout(timerId);

      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadNotificationCount();

      setUnreadCount(Number(data?.count || 0));
    } catch {
      // Notification failure must not break UI.
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
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
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
  // PROFILE PHOTO
  // =====================================================

  const profilePhotoUrl = (() => {
    if (!profile?.profilePhoto) {
      return "";
    }

    if (
      profile.profilePhoto.startsWith("http://") ||
      profile.profilePhoto.startsWith("https://")
    ) {
      return profile.profilePhoto;
    }

    return `${BACKEND_ORIGIN}${profile.profilePhoto}`;
  })();

  const displayName = profile?.name || user?.name || "User";

  const displayRole = profile?.role || user?.role || "Unknown role";

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      toast.error("Enter a module name to search.");

      return;
    }

    const exactMatch = searchItems.find((item) => {
      const label = item.label.toLowerCase();

      return (
        label === query ||
        item.keywords.some((keyword) => keyword.toLowerCase() === query)
      );
    });

    const partialMatch = searchItems.find((item) => {
      const label = item.label.toLowerCase();

      return (
        label.includes(query) ||
        query.includes(label) ||
        item.keywords.some((keyword) => {
          const normalizedKeyword = keyword.toLowerCase();

          return (
            normalizedKeyword.includes(query) ||
            query.includes(normalizedKeyword)
          );
        })
      );
    });

    const matchedItem = exactMatch || partialMatch;

    if (!matchedItem) {
      toast.error(`No module found for "${searchTerm}".`);

      return;
    }

    navigate(matchedItem.path);

    setSearchTerm("");

    toast.success(`Opening ${matchedItem.label}`);
  };

  // =====================================================
  // PROFILE
  // =====================================================

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // =====================================================
  // OPEN / CLOSE NOTIFICATION PANEL
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
      // MARK AS READ
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
      // NO RELATED WORK ORDER
      // ---------------------------------------------

      if (!notification.workOrderId) {
        return;
      }

      // ---------------------------------------------
      // ROLE
      // ---------------------------------------------

      const role = String(user?.role || "")
        .replace(/^ROLE_/, "")
        .trim()
        .toUpperCase();

      // ---------------------------------------------
      // TECHNICIAN
      // ---------------------------------------------

      if (role === "TECHNICIAN") {
        navigate(`/my-jobs?workOrderId=${notification.workOrderId}`);

        return;
      }

      // ---------------------------------------------
      // MANAGER / DISPATCHER
      // ---------------------------------------------

      if (role === "MANAGER" || role === "DISPATCHER") {
        navigate(`/work-orders?workOrderId=${notification.workOrderId}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to open notification.",
      );
    }
  };

  // =====================================================
  // MARK ALL READ
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="flex items-center gap-3">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="Open sidebar"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="hidden min-w-[18rem] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100 md:flex"
          >
            <Search size={18} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search modules..."
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="rounded-lg px-2 py-1 text-xs font-bold text-violet-600 transition hover:bg-violet-50"
            >
              Go
            </button>
          </form>
        </div>

        {/* ================================================= */}
        {/* RIGHT */}
        {/* ================================================= */}

        <div className="flex items-center gap-3">
          {/* ================================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================================= */}

          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={handleNotificationToggle}
              aria-label="Notifications"
              className={`relative rounded-xl border bg-white p-2.5 shadow-sm transition ${
                notificationOpen
                  ? "border-violet-400 text-violet-700 ring-4 ring-violet-100"
                  : "border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <>
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />

                  <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* ================================================= */}
            {/* DROPDOWN */}
            {/* ================================================= */}

            {notificationOpen && (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[100] w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60 sm:w-[26rem]">
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

                    {/* MARK ALL READ */}

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
                          Workflow updates will appear here.
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

                {/* FOOTER */}

                <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                  <p className="text-center text-xs text-slate-400">
                    Notifications are refreshed automatically every 30 seconds.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* PROFILE */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
              {profilePhotoUrl && !photoError ? (
                <img
                  src={profilePhotoUrl}
                  alt={displayName}
                  onError={() => setPhotoError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={20} />
              )}
            </div>

            <div className="hidden sm:block">
              <p className="max-w-40 truncate text-sm font-bold text-slate-900">
                {displayName}
              </p>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {displayRole}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
