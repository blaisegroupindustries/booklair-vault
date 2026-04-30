import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative h-9 w-9 rounded-lg bg-[image:var(--gradient-gold)] flex items-center justify-center shadow-[0_4px_20px_-4px_color-mix(in_oklab,var(--gold)_50%,transparent)] transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold-foreground" fill="currentColor">
          <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2H18a2 2 0 0 1 2 2v15.5a.5.5 0 0 1-.757.429L18 19.25l-1.243.679a.5.5 0 0 1-.514 0L15 19.25l-1.243.679a.5.5 0 0 1-.514 0L12 19.25l-1.243.679a.5.5 0 0 1-.514 0L9 19.25l-1.243.679a.5.5 0 0 1-.514 0L6 19.25l-1.243.679A.5.5 0 0 1 4 19.5V5a1.5 1.5 0 0 1 1-1.414V3.5Z" opacity=".95" />
        </svg>
      </div>
      <span className="font-serif text-xl tracking-tight">
        Book<span className="text-gold">lair</span>
      </span>
    </Link>
  );
}
