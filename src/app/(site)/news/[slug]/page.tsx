import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getPost, getSettings } from "@/lib/queries";
import { coverSrc } from "@/lib/media";
import { formatDate } from "@/lib/format";
import { Photo } from "@/components/site/Photo";
import { JsonLd } from "@/components/site/JsonLd";
import { Paragraphs, Section } from "@/components/site/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Not found" };
  const cover = coverSrc(post.coverMediaId, post.coverUrl);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: { title: post.title, description: post.summary, type: "article", images: cover ? [cover] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const s = await getSettings();
  const cover = coverSrc(post.coverMediaId, post.coverUrl);
  const site = process.env.SITE_URL || "http://localhost:3001";
  const isEvent = post.kind === "event";

  return (
    <>
      <JsonLd
        data={
          isEvent
            ? { "@context": "https://schema.org", "@type": "Event", name: post.title, description: post.summary, startDate: post.eventDate, location: post.location ? { "@type": "Place", name: post.location, address: s.address } : undefined, organizer: { "@type": "Organization", name: s.schoolName } }
            : { "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, datePublished: post.eventDate, author: post.author ? { "@type": "Person", name: post.author } : undefined, image: cover ? [cover.startsWith("/") ? site + cover : cover] : undefined, publisher: { "@type": "Organization", name: s.schoolName } }
        }
      />
      <article>
        <div className="bg-navy-900 text-white">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-gold-300">{isEvent ? "Event" : "News"} · {post.category}</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg text-white/85">{post.summary}</p>
          </div>
        </div>
        <Section>
          <div className="mx-auto max-w-3xl">
            {cover && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded bg-linen">
                <Photo src={cover} alt="" priority sizes="(min-width:768px) 48rem, 100vw" />
              </div>
            )}
            <dl className="mb-8 flex flex-wrap gap-x-8 gap-y-2 border-b border-line pb-6 text-muted">
              <div className="flex items-center gap-2"><dt className="sr-only">Date</dt><Calendar className="h-4 w-4" aria-hidden /><dd><time dateTime={post.eventDate}>{formatDate(post.eventDate, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</time></dd></div>
              {post.eventTime && <div className="flex items-center gap-2"><dt className="sr-only">Time</dt><Clock className="h-4 w-4" aria-hidden /><dd>{post.eventTime}</dd></div>}
              {post.location && <div className="flex items-center gap-2"><dt className="sr-only">Location</dt><MapPin className="h-4 w-4" aria-hidden /><dd>{post.location}</dd></div>}
            </dl>
            <Paragraphs text={post.body} className="prose-school" />
            {post.author && <p className="mt-8 text-muted">By {post.author}</p>}
            <p className="mt-10"><Link href="/news" className="font-medium text-navy-800 underline underline-offset-4">Back to news and events</Link></p>
          </div>
        </Section>
      </article>
    </>
  );
}
