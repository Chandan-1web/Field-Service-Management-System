function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-56 rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-52 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-96 rounded-3xl bg-slate-200" />
        <div className="h-96 rounded-3xl bg-slate-200" />
        <div className="h-96 rounded-3xl bg-slate-200" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-96 rounded-3xl bg-slate-200" />
        <div className="h-96 rounded-3xl bg-slate-200" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-[30rem] rounded-3xl bg-slate-200" />
        <div className="h-[30rem] rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
