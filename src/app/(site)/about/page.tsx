import Link from "next/link";
import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { coverSrc } from "@/lib/media";
import { Photo } from "@/components/site/Photo";
import { PageIntro, Paragraphs, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "About the school",
  description: "Our history, our three guiding values and a message from the headmaster.",
};

const VALUES = [
  { latin: "Veritas", meaning: "Truth", text: "We teach students to ask hard questions, check their evidence and change their minds when the argument demands it." },
  { latin: "Virtus", meaning: "Character", text: "Courage, honesty and service are practised daily: in houses, on teams and in the community beyond the campus." },
  { latin: "Scientia", meaning: "Knowledge", text: "Deep subject knowledge, built through reading, experiment and conversation, is the foundation for everything else." },
];

export default async function AboutPage() {
  const s = await getSettings();
  const head = coverSrc(s.headMediaId, s.headImageUrl);
  return (
    <>
      <PageIntro title={`A school with roots in ${s.foundedYear}`} lead={`${s.schoolName} has educated students from kindergarten to Grade 12 since ${s.foundedYear}, combining a classical liberal arts tradition with modern science, the arts and athletics.`} />

      <Section>
        <h2 className="text-3xl sm:text-4xl">What we stand for</h2>
        <p className="mt-3 max-w-2xl text-lg text-muted">Our motto, <span lang="la" className="italic">{s.motto}</span>, names three commitments.</p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <li key={v.latin} className="border-t-4 border-gold-400 bg-white p-6">
              <h3 className="text-2xl"><span lang="la">{v.latin}</span> <span className="text-base font-normal text-muted">· {v.meaning}</span></h3>
              <p className="mt-3 text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="linen">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_1.5fr] md:gap-16">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded bg-white">
            {head && <Photo src={head} alt={`${s.headName}, ${s.headTitle}`} sizes="(min-width:768px) 30vw, 90vw" />}
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl">From the {s.headTitle.toLowerCase()}</h2>
            <Paragraphs text={s.headMessage} className="prose-school mt-4 text-muted" />
            <p className="mt-4 font-semibold">{s.headName}</p>
            <p className="text-sm text-muted">{s.headTitle}</p>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="text-3xl">Come and see for yourself</h2>
        <p className="mt-3 max-w-xl text-muted">The best way to understand the school is to spend a morning here.</p>
        <Link href="/admissions#visit" className="mt-6 inline-block rounded bg-navy-900 px-6 py-3 font-semibold text-white hover:bg-navy-800">Book a visit</Link>
      </Section>
    </>
  );
}
