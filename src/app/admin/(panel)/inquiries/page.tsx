import { desc } from "drizzle-orm";
import { Mail, Phone } from "lucide-react";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { DeleteForm } from "@/components/admin/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteInquiry, setInquiryStatus } from "../../actions";

export const metadata = { title: "Inquiries" };

const STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

export default async function InquiriesPage() {
  await requireAdmin();
  const rows = await getDb().select().from(inquiries).orderBy(desc(inquiries.id)).limit(200);
  return (
    <>
      <PageHeader title="Inquiries" description="Messages and admissions requests sent through the website. Personal details are visible only here." />
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No inquiries yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((q) => (
            <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{q.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {q.kind === "admissions" ? "Admissions" : "Contact"} · {formatDate(q.createdAt.toISOString().slice(0, 10))}
                    {q.topic && ` · ${q.topic}`}
                  </p>
                </div>
                <form action={setInquiryStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={q.id} />
                  <label htmlFor={`s${q.id}`} className="sr-only">Status for {q.fullName}</label>
                  <select id={`s${q.id}`} name="status" defaultValue={q.status} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm">
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-50">Update</button>
                </form>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-800">{q.message}</p>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-1.5"><dt className="sr-only">Email</dt><Mail className="h-3.5 w-3.5" aria-hidden /><dd><a className="underline" href={`mailto:${q.email}`}>{q.email}</a></dd></div>
                {q.phone && <div className="flex items-center gap-1.5"><dt className="sr-only">Phone</dt><Phone className="h-3.5 w-3.5" aria-hidden /><dd><a className="underline" href={`tel:${q.phone.replace(/[^+\d]/g, "")}`}>{q.phone}</a></dd></div>}
                {q.studentGrade && <div><dt className="inline font-medium">Grade: </dt><dd className="inline">{q.studentGrade}</dd></div>}
                {q.preferredDate && <div><dt className="inline font-medium">Preferred date: </dt><dd className="inline">{q.preferredDate}</dd></div>}
              </dl>
              <div className="mt-2 flex justify-end"><DeleteForm action={deleteInquiry} id={q.id} confirmText="Delete this inquiry permanently?" /></div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
