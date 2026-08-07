import { Bell, Menu, Search, UserRound } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { getMyProfile } from "../../services/profileService";

const BACKEND_ORIGIN = "http://localhost:8081";

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
    label: "Profile",
    path: "/profile",
    keywords: ["profile", "account", "my profile"],
  },
];

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

function Topbar({ openMobileSidebar }) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const [profile, setProfile] = useState(null);

  const [photoError, setPhotoError] = useState(false);

  const searchItems =
    user?.role === "TECHNICIAN" ? technicianSearchItems : managerSearchItems;

  /*
   * Load complete user profile.
   * This allows the Topbar to get:
   * - profile photo
   * - updated name
   * - updated email
   * etc.
   */
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
        /*
         * Do not show an error toast here.
         * Topbar can still use the
         * authentication user as fallback.
         */
      }
    };

    void loadProfile();

    /*
     * ProfilePage can dispatch this
     * event whenever profile information
     * or profile photo changes.
     */
    const handleProfileUpdated = () => {
      void loadProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      isMounted = false;

      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

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
        item.keywords.some(
          (keyword) =>
            keyword.toLowerCase().includes(query) ||
            query.includes(keyword.toLowerCase()),
        )
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

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-3">
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="Open sidebar"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* GLOBAL SEARCH */}
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

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATIONS */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* USER PROFILE */}
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md"
          >
            {/* PROFILE PHOTO */}
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

            {/* NAME + ROLE */}
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
