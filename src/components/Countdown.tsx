import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function Countdown({
  to,
  className = "",
  compact = false,
  label,
}: {
  to: string | Date;
  className?: string;
  compact?: boolean;
  label?: string;
}) {
  const target = typeof to === "string" ? new Date(to) : to;
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target.getTime()]); // eslint-disable-line

  if (!t) return null;

  if (compact) {
    return (
      <span className={`tabular-nums font-mono ${className}`}>
        {t.d > 0 ? `${t.d}d ` : ""}
        {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:{String(t.s).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>}
      <div className="flex gap-2">
        {[
          ["Dias", t.d],
          ["Horas", t.h],
          ["Min", t.m],
          ["Seg", t.s],
        ].map(([l, v]) => (
          <div key={l} className="surface-card rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="font-serif text-2xl text-gold tabular-nums">{String(v).padStart(2, "0")}</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
