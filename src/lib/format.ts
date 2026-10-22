export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", opts ?? { year: "numeric", month: "long", day: "numeric" });
}

export function isUpcoming(iso: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return iso >= today;
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "post"
  );
}

export const NEWS_CATEGORIES = ["Academics", "Admissions", "Arts & culture", "Athletics", "Community", "Announcements"];
export const MEDIA_CATEGORIES = ["Campus life", "Academics & STEM", "Arts & culture", "Athletics", "Commencement & traditions", "Community"];
export const ACTIVITY_CATEGORIES = ["Athletics", "Performing arts", "Academic societies", "Leadership & service"];
