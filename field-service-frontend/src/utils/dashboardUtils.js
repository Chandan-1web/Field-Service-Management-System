export const chartColours = {
  NEW: "#0ea5e9",
  ASSIGNED: "#6366f1",
  IN_PROGRESS: "#8b5cf6",
  ON_HOLD: "#f59e0b",
  COMPLETED: "#10b981",
  CLOSED: "#64748b",
  CANCELLED: "#ef4444",
};

export const priorityStyles = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
};

export const statusStyles = {
  NEW: "bg-sky-100 text-sky-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const statusConfig = [
  {
    key: "newWorkOrders",
    label: "New",
    colourKey: "NEW",
    badgeClass: "bg-sky-500/10 text-sky-700",
    barClass: "bg-sky-500",
  },
  {
    key: "assignedWorkOrders",
    label: "Assigned",
    colourKey: "ASSIGNED",
    badgeClass: "bg-indigo-500/10 text-indigo-700",
    barClass: "bg-indigo-500",
  },
  {
    key: "inProgressWorkOrders",
    label: "In Progress",
    colourKey: "IN_PROGRESS",
    badgeClass: "bg-violet-500/10 text-violet-700",
    barClass: "bg-violet-500",
  },
  {
    key: "onHoldWorkOrders",
    label: "On Hold",
    colourKey: "ON_HOLD",
    badgeClass: "bg-amber-500/10 text-amber-700",
    barClass: "bg-amber-500",
  },
  {
    key: "completedWorkOrders",
    label: "Completed",
    colourKey: "COMPLETED",
    badgeClass: "bg-emerald-500/10 text-emerald-700",
    barClass: "bg-emerald-500",
  },
  {
    key: "closedWorkOrders",
    label: "Closed",
    colourKey: "CLOSED",
    badgeClass: "bg-slate-500/10 text-slate-700",
    barClass: "bg-slate-500",
  },
  {
    key: "cancelledWorkOrders",
    label: "Cancelled",
    colourKey: "CANCELLED",
    badgeClass: "bg-red-500/10 text-red-700",
    barClass: "bg-red-500",
  },
];

export function formatLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDateTime(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  if (hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

export function getWorkspaceName(role) {
  if (role === "MANAGER") {
    return "Manager Workspace";
  }

  if (role === "DISPATCHER") {
    return "Dispatcher Workspace";
  }

  if (role === "TECHNICIAN") {
    return "Technician Workspace";
  }

  return `${role || "User"} Workspace`;
}

export function calculateCompletionRate(summary) {
  if (!summary?.totalWorkOrders) {
    return 0;
  }

  const completed =
    (summary.completedWorkOrders || 0) + (summary.closedWorkOrders || 0);

  return Math.round((completed / summary.totalWorkOrders) * 100);
}

export function calculateActiveWorkOrders(summary) {
  if (!summary) {
    return 0;
  }

  return (
    (summary.newWorkOrders || 0) +
    (summary.assignedWorkOrders || 0) +
    (summary.inProgressWorkOrders || 0) +
    (summary.onHoldWorkOrders || 0)
  );
}

export function calculateSlaHealth(totalActiveWorkOrders, overdueCount) {
  if (totalActiveWorkOrders === 0) {
    return 100;
  }

  const healthyCount = Math.max(totalActiveWorkOrders - overdueCount, 0);

  return Math.round((healthyCount / totalActiveWorkOrders) * 100);
}
