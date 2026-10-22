import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getDb } from "@/db";
import { activities } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { DeleteForm } from "@/components/admin/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteActivity } from "../../actions";

export const metadata = { title: "Activities" };

export default async function ActivitiesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const rows = await getDb().select().from(activities).orderBy(asc(activities.category), asc(activities.name));
  return (
    <>
      <PageHeader
        title="Activities"
        description="Clubs, teams and programmes listed on the Activities page."
        actions={<Link href="/admin/activities/new" className="inline-flex items-center gap-2 rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"><Plus className="h-4 w-4" aria-hidden /> Add activity</Link>}
      />
      {saved && <p role="status" className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Saved.</p>}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">{a.category}{!a.published && " · Hidden"}</p>
            </div>
            <div className="flex items-center gap-1">
              <Link href={`/admin/activities/${a.id}`} className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-slate-100">Edit</Link>
              <DeleteForm action={deleteActivity} id={a.id} confirmText={`Delete “${a.name}”?`} />
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-600">No activities yet.</li>}
      </ul>
    </>
  );
}
