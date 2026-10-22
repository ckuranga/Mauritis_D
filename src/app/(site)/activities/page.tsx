import type { Metadata } from "next";
import { Clock, MapPin, Users } from "lucide-react";
import { getActivities } from "@/lib/queries";
import { coverSrc } from "@/lib/media";
import { Photo } from "@/components/site/Photo";
import { PageIntro, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Activities",
  description: "Sports teams, performing arts, academic societies and service programmes.",
};

export default async function ActivitiesPage() {
  const list = await getActivities();
  const groups = new Map<string, typeof list>();
  for (const a of list) groups.set(a.category, [...(groups.get(a.category) ?? []), a]);

  return (
    <>
      <PageIntro title="Activities" lead="Learning continues after the bell: teams, ensembles, societies and service." />
      <Section>
        {list.length === 0 && <p className="text-lg text-muted">Activities will be listed here soon.</p>}
        <div className="space-y-16">
          {[...groups.entries()].map(([category, items]) => (
            <div key={category}>
              <h2 className="text-3xl">{category}</h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-2">
                {items.map((a) => {
                  const img = coverSrc(a.coverMediaId, a.imageUrl);
                  return (
                    <li key={a.id} className="flex flex-col overflow-hidden rounded border border-line bg-white sm:flex-row">
                      <div className="relative aspect-[16/10] bg-linen sm:aspect-auto sm:w-2/5 sm:shrink-0">
                        {img && <Photo src={img} alt="" sizes="(min-width:640px) 20vw, 100vw" />}
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl">{a.name}</h3>
                        <p className="mt-2 text-muted">{a.description}</p>
                        <ul className="mt-3 space-y-1 text-sm text-muted">
                          {a.schedule && <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{a.schedule}</li>}
                          {a.location && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{a.location}</li>}
                          {a.memberCount && <li className="flex gap-2"><Users className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{a.memberCount} members</li>}
                        </ul>
                        {a.achievements && <p className="mt-3 text-sm font-medium text-gold-700">{a.achievements}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
