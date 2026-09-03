/**
 * Booklair brand mark — SVG, escala em qualquer tamanho e adapta-se ao tema.
 * Mesmo desenho do favicon (public/favicon.svg).
 */
export function BooklairMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Booklair"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="var(--card, #0E1116)" />
      <rect width="64" height="64" rx="14" fill="none" stroke="var(--border, transparent)" strokeWidth="1.5" />
      <rect x="12" y="12" width="7" height="40" rx="3.5" fill="var(--gold, #D9B45B)" />
      <rect x="24" y="16" width="7" height="36" rx="3.5" fill="var(--gold, #D9B45B)" opacity="0.6" />
      <rect x="36" y="12" width="7" height="40" rx="3.5" fill="var(--primary, #4C8DFF)" />
      <circle cx="51" cy="20" r="5" fill="var(--ember, #F0A03C)" />
    </svg>
  );
}
