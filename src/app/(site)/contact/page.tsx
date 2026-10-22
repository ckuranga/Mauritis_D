import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { InquiryForm } from "@/components/site/InquiryForm";
import { PageIntro, Section } from "@/components/site/ui";

export const metadata: Metadata = { title: "Contact", description: "Address, phone, email, office hours and a contact form." };

export default async function ContactPage() {
  const s = await getSettings();
  const directions = s.address ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(s.address)}` : null;
  return (
    <>
      <PageIntro title="Contact us" lead="Call, write or send a message. The office replies within two working days." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <address className="space-y-6 text-lg not-italic">
            {s.address && (
              <div className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
                <div><p className="font-semibold">Address</p><p className="text-muted">{s.address}</p>
                  {directions && <a href={directions} className="text-base font-medium text-navy-800 underline underline-offset-4" target="_blank" rel="noopener noreferrer">Find us on a map<span className="sr-only"> (opens in a new tab)</span></a>}
                </div></div>
            )}
            {s.phone && <div className="flex gap-3"><Phone className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden /><div><p className="font-semibold">Phone</p><a className="text-muted underline" href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a></div></div>}
            {s.email && <div className="flex gap-3"><Mail className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden /><div><p className="font-semibold">Email</p><a className="text-muted underline" href={`mailto:${s.email}`}>{s.email}</a></div></div>}
            {s.officeHours && <div className="flex gap-3"><Clock className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden /><div><p className="font-semibold">Office hours</p><p className="text-muted">{s.officeHours}</p></div></div>}
          </address>
          <div>
            <h2 className="mb-6 text-3xl">Send a message</h2>
            <InquiryForm kind="contact" topics={["General question", "Admissions", "Events and tickets", "Alumni", "Press"]} />
          </div>
        </div>
      </Section>
    </>
  );
}
