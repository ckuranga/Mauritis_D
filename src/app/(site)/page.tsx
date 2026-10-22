import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { getFeaturedMedia, getPosts, getSettings, getUpcomingEvents } from "@/lib/queries";
import { coverSrc, formatDuration, mediaSrc, mediaThumb } from "@/lib/media";
import { formatDate } from "@/lib/format";
import { Photo } from "@/components/site/Photo";
import { Gallery, type GalleryItem } from "@/components/site/Gallery";
import { Paragraphs, PostCard, Section } from "@/components/site/ui";

export async function generateMetadata() {
  const s = await getSettings();
  return { title: { absolute: `${s.schoolName} | ${s.heroTitle}` }, description: s.heroSubtitle };
}

const DIVISIONS = [
  { name: "Lower School", grades: "Kindergarten to Grade 5", text: "Reading, number sense and curiosity, taught in small classes by teachers who know every child." },
  { name: "Middle School", grades: "Grades 6 to 8", text: "A structured bridge: study skills, laboratory science, languages and first experiences of debate and ensemble music." },
  { name: "Upper School", grades: "Grades 9 to 12", text: "Seminar-style courses, independent research and college counselling from the first year." },
];

export default async function HomePage() {
  const [s, events, news, featured] = await Promise.all([
    getSettings(),
    getUpcomingEvents(3),
    getPosts({ kind: "news", limit: 3 }),
    getFeaturedMedia(5),
  ]);

  const hero = coverSrc(s.heroMediaId, s.heroImageUrl);
  const head = coverSrc(s.headMediaId, s.headImageUrl);
  const facts = [
    s.statRatio && { value: s.statRatio, label: "student–teacher ratio" },
    s.statClubs && { value: s.statClubs, label: "clubs and societies" },
    s.statMatriculation && { value: s.statMatriculation, label: "university placement" },
    s.statAthletics && { value: s.statAthletics, label: "athletics record" },
  ].filter(Boolean) as { value: string; label: string }[];

  const items: GalleryItem[] = featured.map((m) => ({
    id: m.id,
    kind: m.kind === "video" ? "video" : "image",
    src: mediaSrc(m),
    thumb: mediaThumb(m),
    title: m.title,
    alt: m.altText || m.title,
    caption: m.caption,
    meta: [m.eventName, formatDate(m.eventDate), m.location].filter(Boolean).join(" · "),
    duration: formatDuration(m.durationSeconds),
  }));

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-900 text-white">
        {hero && <Photo src={hero} alt="" priority sizes="100vw" className="-z-10 object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-950/20" />
        <div className="mx-auto flex min-h-[34rem] max-w-6xl flex-col justify-center px-4 py-20 sm:min-h-[40rem] sm:px-6">
          <h1 className="max-w-3xl text-[2.6rem] leading-[1.05] sm:text-6xl">{s.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">{s.heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/admissions#visit" className="rounded bg-gold-400 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-300">Book a visit</Link>
            <Link href="/academics" className="rounded border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10">Explore academics</Link>
          </div>
        </div>
      </section>

      {facts.length > 0 && (
        <div className="border-b border-line bg-linen">
          <dl className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-10 gap-y-4 px-4 py-6 sm:px-6">
            {facts.map((f) => (
              <div key={f.label} className="flex items-baseline gap-3">
                <dd className="font-serif text-3xl font-semibold text-navy-900">{f.value}</dd>
                <dt className="text-sm text-muted">{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      )}

      {events.length > 0 && (
        <Section tone="paper" className="!pb-0">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl">Coming up</h2>
            <Link href="/news?type=event" className="font-medium text-navy-800 underline underline-offset-4">All events</Link>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {events.map((e) => (
              <li key={e.id} className="rounded border border-line bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-medium text-gold-700"><Calendar className="h-4 w-4" aria-hidden />{formatDate(e.eventDate, { weekday: "long", month: "long", day: "numeric" })}{e.eventTime && `, ${e.eventTime}`}</p>
                <h3 className="mt-2 text-xl"><Link href={`/news/${e.slug}`} className="hover:underline">{e.title}</Link></h3>
                {e.location && <p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin className="h-4 w-4" aria-hidden />{e.location}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded bg-linen">
            {head && <Photo src={head} alt={`${s.headName}, ${s.headTitle}`} sizes="(min-width:768px) 30vw, 80vw" />}
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl">A message from the {s.headTitle.toLowerCase()}</h2>
            <blockquote className="mt-6 border-l-4 border-gold-400 pl-5 font-serif text-2xl leading-snug text-navy-900">{s.headQuote}</blockquote>
            <Paragraphs text={s.headMessage.split(/\n{2,}/)[0]} className="mt-6 max-w-xl text-lg leading-relaxed text-muted" />
            <p className="mt-6 font-semibold">{s.headName}</p>
            <p className="text-sm text-muted">{s.headTitle}</p>
            <Link href="/about" className="mt-5 inline-block font-medium text-navy-800 underline underline-offset-4">About the school</Link>
          </div>
        </div>
      </Section>

      <Section tone="linen">
        <h2 className="text-3xl sm:text-4xl">Three divisions, one standard</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {DIVISIONS.map((d) => (
            <li key={d.name} className="border-t-4 border-navy-900 bg-white p-6">
              <h3 className="text-2xl">{d.name}</h3>
              <p className="mt-1 text-sm font-medium text-gold-700">{d.grades}</p>
              <p className="mt-3 text-muted">{d.text}</p>
            </li>
          ))}
        </ul>
        <Link href="/academics" className="mt-8 inline-block font-medium text-navy-800 underline underline-offset-4">See the full curriculum</Link>
      </Section>

      {items.length > 0 && (
        <Section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl">Campus life in photos and film</h2>
            <Link href="/gallery" className="shrink-0 font-medium text-navy-800 underline underline-offset-4">Open the gallery</Link>
          </div>
          <div className="mt-8">
            <Gallery items={items} columns="grid-cols-2 md:grid-cols-3" />
          </div>
        </Section>
      )}

      {news.length > 0 && (
        <Section tone="linen">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl">Latest news</h2>
            <Link href="/news?type=news" className="font-medium text-navy-800 underline underline-offset-4">All news</Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {news.map((n) => (
              <div key={n.id} className="relative">
                <PostCard href={`/news/${n.slug}`} title={n.title} summary={n.summary} meta={formatDate(n.eventDate)} image={coverSrc(n.coverMediaId, n.coverUrl)} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section tone="navy">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl">See the school on a normal school day</h2>
            <p className="mt-3 text-white/85">Visits are with a member of the admissions team and include a classroom visit and time for your questions.</p>
          </div>
          <Link href="/admissions#visit" className="rounded bg-gold-400 px-7 py-3.5 font-semibold text-navy-950 hover:bg-gold-300">Book a visit</Link>
        </div>
      </Section>
    </>
  );
}
