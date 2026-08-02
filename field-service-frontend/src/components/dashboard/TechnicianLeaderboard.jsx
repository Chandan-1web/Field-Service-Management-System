import {
  Award,
  CheckCircle2,
  Clock3,
  Trophy,
  UserRound,
  Wrench,
} from "lucide-react";

function getRankDetails(index) {
  if (index === 0) {
    return {
      label: "1",
      containerClass:
        "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950",
      borderClass: "border-amber-200",
      glowClass: "shadow-amber-100",
    };
  }

  if (index === 1) {
    return {
      label: "2",
      containerClass:
        "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
      borderClass: "border-slate-200",
      glowClass: "shadow-slate-100",
    };
  }

  if (index === 2) {
    return {
      label: "3",
      containerClass:
        "bg-gradient-to-br from-orange-300 to-amber-600 text-orange-950",
      borderClass: "border-orange-200",
      glowClass: "shadow-orange-100",
    };
  }

  return {
    label: String(index + 1),
    containerClass: "bg-slate-100 text-slate-700",
    borderClass: "border-slate-200",
    glowClass: "shadow-slate-100",
  };
}

function getPerformanceColour(percentage) {
  if (percentage >= 80) {
    return {
      text: "text-emerald-700",
      bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
      background: "bg-emerald-50",
    };
  }

  if (percentage >= 50) {
    return {
      text: "text-amber-700",
      bar: "bg-gradient-to-r from-amber-400 to-orange-500",
      background: "bg-amber-50",
    };
  }

  return {
    text: "text-red-700",
    bar: "bg-gradient-to-r from-red-400 to-rose-500",
    background: "bg-red-50",
  };
}

function TechnicianLeaderboard({
  technicians,
  isLoading = false,
  onViewReports,
}) {
  const rankedTechnicians = [...technicians].sort(
    (first, second) =>
      second.completionPercentage - first.completionPercentage ||
      second.completedWorkOrders - first.completedWorkOrders ||
      second.totalHoursLogged - first.totalHoursLogged,
  );

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            <Trophy size={17} />
            Team performance
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Technician leaderboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Ranked using completion percentage, completed work and logged hours.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewReports}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
        >
          <Award size={17} />
          Performance reports
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      ) : rankedTechnicians.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <UserRound size={26} />
          </div>

          <p className="mt-4 font-bold text-slate-800">
            No technician performance available
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Performance data will appear after technicians are assigned work
            orders.
          </p>
        </div>
      ) : (
        <div className="space-y-4 p-6">
          {rankedTechnicians.map((technician, index) => {
            const rank = getRankDetails(index);

            const performance = getPerformanceColour(
              technician.completionPercentage,
            );

            const progress = Math.min(
              Math.max(Number(technician.completionPercentage) || 0, 0),
              100,
            );

            return (
              <div
                key={technician.technicianId}
                className={`group rounded-3xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${rank.borderClass} ${rank.glowClass}`}
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-black shadow-md ${rank.containerClass}`}
                    >
                      {rank.label}
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 font-black text-white shadow-lg shadow-violet-200">
                      {technician.technicianName?.charAt(0).toUpperCase() ||
                        "T"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-slate-950">
                        {technician.technicianName}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {technician.technicianEmail}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-fit rounded-2xl px-4 py-3 ${performance.background}`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Completion
                    </p>

                    <p
                      className={`mt-1 text-2xl font-black ${performance.text}`}
                    >
                      {Math.round(technician.completionPercentage || 0)}%
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${performance.bar}`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Wrench size={15} />

                      <p className="text-xs font-bold uppercase tracking-wide">
                        Assigned
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-black text-slate-950">
                      {technician.totalAssignedWorkOrders}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-violet-50 p-3">
                    <div className="flex items-center gap-2 text-violet-600">
                      <Clock3 size={15} />

                      <p className="text-xs font-bold uppercase tracking-wide">
                        In progress
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-black text-violet-950">
                      {technician.inProgressWorkOrders}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={15} />

                      <p className="text-xs font-bold uppercase tracking-wide">
                        Completed
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-black text-emerald-950">
                      {technician.completedWorkOrders +
                        technician.closedWorkOrders}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-sky-50 p-3">
                    <div className="flex items-center gap-2 text-sky-600">
                      <Clock3 size={15} />

                      <p className="text-xs font-bold uppercase tracking-wide">
                        Hours logged
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-black text-sky-950">
                      {Number(technician.totalHoursLogged || 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default TechnicianLeaderboard;
