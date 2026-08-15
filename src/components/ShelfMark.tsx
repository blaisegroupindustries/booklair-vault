/**
 * ShelfMark — Booklair's visual signature.
 * A CSS-only catalogue shelf: coloured spines with call numbers,
 * drawn like a library index card. No stock photography, no generic 3D.
 */
const SPINES = [
  { w: 30, h: 88, label: "BL·001", tone: "gold" },
  { w: 18, h: 74, label: "PT", tone: "line" },
  { w: 40, h: 100, label: "BL·014", tone: "ink" },
  { w: 16, h: 66, label: "EN", tone: "line" },
  { w: 26, h: 82, label: "BL·027", tone: "ember" },
  { w: 34, h: 94, label: "BL·033", tone: "gold" },
  { w: 14, h: 60, label: "·", tone: "line" },
  { w: 28, h: 78, label: "BL·041", tone: "ink" },
] as const;

const toneStyle: Record<string, React.CSSProperties> = {
  gold: { background: "var(--gold)", color: "var(--gold-foreground)" },
  ink: {
    background: "color-mix(in oklab, var(--foreground) 88%, transparent)",
    color: "var(--background)",
  },
  ember: { background: "var(--ember)", color: "var(--background)" },
  line: {
    background: "var(--surface)",
    color: "var(--muted-foreground)",
    border: "1px solid color-mix(in oklab, var(--foreground) 32%, transparent)",
  },
};


export function ShelfMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative select-none ${className}`} aria-hidden="true">
      <div className="flex items-end justify-center gap-1.5 md:gap-2">
        {SPINES.map((s, i) => (
          <div
            key={i}
            className="rounded-[3px] flex items-end justify-center pb-2 transition-transform duration-500 hover:-translate-y-2"
            style={{
              ...toneStyle[s.tone],
              width: `${s.w}px`,
              height: `${s.h}%`,
              minHeight: `${s.h * 1.7}px`,
            }}
          >
            <span
              className="font-mono text-[8px] tracking-[0.18em] rotate-180"
              style={{ writingMode: "vertical-rl" }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      {/* shelf rule */}
      <div className="mt-2 h-px w-full" style={{ background: "var(--foreground)", opacity: 0.85 }} />
      <div className="mt-1 h-px w-[92%] mx-auto" style={{ background: "var(--rule)" }} />
    </div>
  );
}
