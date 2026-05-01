import { BookOpen } from "lucide-react";

export interface CoverData {
  cover_type?: "image" | "text" | null;
  cover_url?: string | null;
  cover_text_title?: string | null;
  cover_text_subtitle?: string | null;
  cover_bg_color?: string | null;
  cover_text_color?: string | null;
  cover_gradient?: string | null;
  title: string;
  author?: string | null;
}

export function EbookCover({
  ebook,
  className = "",
  rounded = "rounded-2xl",
}: {
  ebook: CoverData;
  className?: string;
  rounded?: string;
}) {
  const isText = ebook.cover_type === "text";
  const hasImage = !isText && ebook.cover_url;

  if (hasImage) {
    return (
      <img
        src={ebook.cover_url!}
        alt={ebook.title}
        loading="lazy"
        className={`h-full w-full object-cover ${rounded} ${className}`}
      />
    );
  }

  if (isText) {
    const bg = ebook.cover_gradient
      ? ebook.cover_gradient
      : ebook.cover_bg_color || "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)";
    const color = ebook.cover_text_color || "#f4d27a";
    return (
      <div
        className={`h-full w-full flex flex-col items-center justify-center p-6 text-center ${rounded} ${className}`}
        style={{ background: bg, color }}
      >
        <p
          className="font-serif text-2xl md:text-3xl leading-tight"
          style={{ color }}
        >
          {ebook.cover_text_title || ebook.title}
        </p>
        {ebook.cover_text_subtitle && (
          <p className="mt-3 text-xs uppercase tracking-widest opacity-80">
            {ebook.cover_text_subtitle}
          </p>
        )}
        {ebook.author && (
          <p className="mt-auto pt-4 text-[10px] uppercase tracking-widest opacity-60">
            {ebook.author}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted ${rounded} ${className}`}>
      <BookOpen className="h-16 w-16 text-muted-foreground/40" />
    </div>
  );
}
