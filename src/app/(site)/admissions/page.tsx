import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { InquiryForm } from "@/components/site/InquiryForm";
import { PageIntro, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Admissions",
  description: "How to apply, tuition and financial aid, and how to book a visit.",
};

const STEPS = [
  { title: "Visit the school", text: "Tour the campus, sit in on a class and meet the admissions team." },
  { title: "Submit your application", text: "Complete the application form and send recent school reports." },
  { title: "Student assessment and interview", text: "A friendly, age-appropriate meeting so we can get to know your child." },
  { title: "Decision", text: "We write to families with a decision and, where relevant, a financial aid offer." },
];

const FAQ = [
  { q: "Can we visit outside the open house dates?", a: "Yes. Private visits are available on weekday mornings and Saturdays. Use the form below to ask for a date." },
  { q: "Do you offer boarding?", a: "Yes, boarding is available in the Upper School. Boarding tuition is listed above." },
  { q: "Is financial aid available?", a: "Yes. Families apply for aid at the same time as the application, and the admissions office can explain the process." },
];

export default async function AdmissionsPage() {
  const s = await getSettings();
  const fees = [
    s.tuitionDay && { label: "Day tuition", value: s.tuitionDay },
    s.tuitionBoarding && { label: "Boarding tuition", value: s.tuitionBoarding },
    s.admissionsDeadline && { label: "Application deadline", value: s.admissionsDeadline },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <PageIntro title="Admissions" lead="We welcome applications from curious, kind and hard-working students from kindergarten to Grade 12." />

      <Section>
        <h2 className="text-3xl">How to apply</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {STEPS.map((st, i) => (
            <li key={st.title} className="border-t-4 border-navy-900 pt-4">
              <p className="font-serif text-2xl text-gold-700" aria-hidden>{i + 1}</p>
              <h3 className="mt-1 text-xl">{st.title}</h3>
              <p className="mt-2 text-muted">{st.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {fees.length > 0 && (
        <Section tone="linen">
          <h2 className="text-3xl">Fees and dates</h2>
          <dl className="mt-6 grid gap-6 md:grid-cols-3">
            {fees.map((f) => (
              <div key={f.label} className="rounded border border-line bg-white p-5">
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className="mt-1 font-serif text-2xl">{f.value}</dd>
              </div>
            ))}
          </dl>
          {s.financialAid && <p className="mt-6 max-w-2xl text-lg text-muted">{s.financialAid}</p>}
        </Section>
      )}

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div id="visit" className="scroll-mt-28">
            <h2 className="text-3xl">Book a visit or ask a question</h2>
            <p className="mb-8 mt-3 max-w-xl text-muted">Tell us a little about your child and we will reply within two working days.</p>
            <InquiryForm
              kind="admissions"
              topics={["Book a campus visit", "Ask about admissions", "Ask about boarding", "Ask about financial aid"]}
              grades={["Kindergarten to Grade 5", "Grades 6 to 8", "Grade 9", "Grades 10 to 12"]}
            />
          </div>
          <div>
            <h2 className="text-2xl">Common questions</h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="cursor-pointer list-none font-medium marker:hidden after:float-right after:text-xl after:leading-none after:content-['+'] group-open:after:content-['–']">{f.q}</summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
            {s.admissionsEmail && <p className="mt-6 text-muted">Prefer email? Write to <a className="font-medium text-navy-800 underline" href={`mailto:${s.admissionsEmail}`}>{s.admissionsEmail}</a>.</p>}
          </div>
        </div>
      </Section>
    </>
  );
}
