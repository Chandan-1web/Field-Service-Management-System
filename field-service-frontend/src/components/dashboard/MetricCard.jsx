import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

function useAnimatedNumber(targetValue, duration = 700) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericTarget = Number(targetValue) || 0;
    const startValue = displayValue;
    const startTime = performance.now();

    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.round(startValue + (numericTarget - startValue) * easedProgress),
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return displayValue;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  progress = 0,
  progressClass = "bg-violet-500",
  accentClass = "from-violet-500/10",
  footerText = "Live operational total",
  onClick,
}) {
  const animatedValue = useAnimatedNumber(value);

  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/60"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentClass} to-transparent opacity-0 transition duration-300 group-hover:opacity-100`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>

            <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {animatedValue}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110 ${iconClass}`}
          >
            <Icon size={22} />
          </div>
        </div>

        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {footerText}
            </p>

            <span className="text-xs font-black text-slate-700">
              {safeProgress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressClass}`}
              style={{
                width: `${safeProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-violet-600 opacity-0 transition group-hover:opacity-100">
          View details
          <ArrowUpRight size={16} />
        </div>
      </div>
    </button>
  );
}

export default MetricCard;
