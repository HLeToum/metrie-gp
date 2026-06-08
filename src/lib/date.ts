// Date helpers for the blog (and anywhere else).

/** Human-readable French date, e.g. "9 juin 2026". */
export function formatDate(date: Date | string, locale = 'fr-FR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Machine-readable ISO date (YYYY-MM-DD) for <time datetime> and schema.org. */
export function isoDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/** Rough reading time in minutes from raw text (~200 words/min). */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
