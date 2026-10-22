import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Academics",
  description: "Our Lower, Middle and Upper School curriculum, from kindergarten to Grade 12.",
};

const DIVISIONS = [
  { name: "Lower School", grades: "Kindergarten to Grade 5", points: ["Phonics-based reading and structured writing", "Mathematics built on number sense and problem solving", "Science, art, music and physical education every week", "Class sizes small enough for every child to be known"] },
  { name: "Middle School", grades: "Grades 6 to 8", points: ["Subject teachers with a dedicated advisor for each student", "Laboratory science and introductory Latin or modern languages", "Public speaking, debate and ensemble music", "Study-skills programme that prepares students for Upper School"] },
  { name: "Upper School", grades: "Grades 9 to 12", points: ["Seminar-style humanities and advanced mathematics and science", "Independent research project in the final two years", "Wide choice of electives in the arts and technology", "Dedicated college counselling from Grade 9"] },
];

const SUBJECTS = ["English and literature", "History and civics", "Mathematics", "Biology, chemistry and physics", "Computer science", "Latin, French and Spanish", "Visual art and design", "Music and theatre", "Physical education and health"];

export default function AcademicsPage() {
  return (
    <>
      <PageIntro title="Academics" lead="A demanding curriculum, taught by specialists, in classes small enough for real discussion." />
      <Section>
        <div className="space-y-10">
          {DIVISIONS.map((d) => (
            <article key={d.name} className="grid gap-6 border-t border-line pt-8 md:grid-cols-[1fr_2fr]">
              <div>
                <h2 className="text-3xl">{d.name}</h2>
                <p className="mt-1 font-medium text-gold-700">{d.grades}</p>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-lg text-muted marker:text-gold-700">
                {d.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </Section>
      <Section tone="linen">
        <h2 className="text-3xl">Subjects</h2>
        <ul className="mt-6 grid gap-x-8 gap-y-2 text-lg sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => <li key={s} className="border-b border-line py-2">{s}</li>)}
        </ul>
        <p className="mt-8"><Link href="/admissions" className="font-medium text-navy-800 underline underline-offset-4">How to apply</Link></p>
      </Section>
    </>
  );
}
