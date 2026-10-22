import Link from "next/link";
import type { Metadata } from "next";
import { getPosts } from "@/lib/queries";
import { coverSrc } from "@/lib/media";
import { formatDate, isUpcoming } from "@/lib/format";
import { PageIntro, PostCard, Section } from "@/components/site/ui";

export const metadata: Metadata = { title: "News and events", description: "School news and upcoming events." };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const kind = type === "news" || type === "event" ? type : undefined;
  const posts = await getPosts({ kind });
  const upcoming = posts.filter((p) => p.kind === "event" && isUpcoming(p.eventDate)).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const rest = posts.filter((p) => !upcoming.includes(p));

  const tab = (value: string | undefined, label: string) => {
    const current = kind === value;
    return (
      <Link href={value ? `/news?type=${value}` : "/news"} aria-current={current ? "page" : undefined}
        className={`rounded-full px-4 py-2 text-sm font-medium ${current ? "bg-navy-900 text-white" : "bg-white text-ink ring-1 ring-line hover:bg-linen"}`}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <PageIntro title="News and events" lead="What is happening in classrooms, on stage and on the field." />
      <Section>
        <nav aria-label="Filter" className="flex gap-2">{tab(undefined, "All")}{tab("news", "News")}{tab("event", "Events")}</nav>

        {upcoming.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl">Upcoming events</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {upcoming.map((e) => (
                <li key={e.id} className="grid gap-1 py-5 md:grid-cols-[12rem_1fr]">
                  <p className="font-medium text-gold-700">{formatDate(e.eventDate, { weekday: "short", month: "long", day: "numeric" })}{e.eventTime && <span className="block text-sm text-muted">{e.eventTime}</span>}</p>
                  <div>
                    <h3 className="text-xl"><Link href={`/news/${e.slug}`} className="hover:underline">{e.title}</Link></h3>
                    <p className="mt-1 text-muted">{e.summary}</p>
                    {e.location && <p className="mt-1 text-sm text-muted">{e.location}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mt-14 text-3xl">{kind === "event" ? "Past events" : "Stories"}</h2>
        {rest.length === 0 ? (
          <p className="mt-4 text-muted">Nothing to show yet.</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <div key={p.id} className="relative">
                <PostCard href={`/news/${p.slug}`} title={p.title} summary={p.summary} meta={`${p.kind === "event" ? "Event" : "News"} · ${formatDate(p.eventDate)}`} image={coverSrc(p.coverMediaId, p.coverUrl)} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
