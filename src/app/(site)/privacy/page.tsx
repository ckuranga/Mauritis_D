import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { PageIntro, Section } from "@/components/site/ui";

export const metadata: Metadata = { title: "Privacy policy", description: "How the school handles personal information collected through this website." };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <>
      <PageIntro title="Privacy policy" />
      <Section>
        <div className="prose-school text-muted">
          <p>This page explains what information {s.schoolName} collects through this website and how it is used. Have this text reviewed by the school’s legal adviser before launch.</p>
          <h2 className="text-ink">What we collect</h2>
          <p>When you use the contact or admissions form we collect the name, email address, optional phone number, and message you provide, plus the grade level and preferred visit date on the admissions form.</p>
          <h2 className="text-ink">How we use it</h2>
          <p>We use these details only to reply to your enquiry and to arrange visits. Enquiries are visible only to authorised school staff.</p>
          <h2 className="text-ink">Cookies and tracking</h2>
          <p>This website does not use advertising or analytics cookies and does not load third-party trackers. A sign-in cookie is set only for school staff who manage the site.</p>
          <h2 className="text-ink">Your choices</h2>
          <p>You may ask to see, correct or delete the information you sent us at any time by contacting {s.email ? <a className="underline" href={`mailto:${s.email}`}>{s.email}</a> : "the school office"}.</p>
        </div>
      </Section>
    </>
  );
}
