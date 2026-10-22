import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getDb } from "@/db";
import { newsPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { DeleteForm } from "@/components/admin/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { deletePost } from "../../actions";

export const metadata = { title: "News & events" };

export default async function NewsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const posts = await getDb().select().from(newsPosts).orderBy(desc(newsPosts.eventDate), desc(newsPosts.id));
  return (
    <>
      <PageHeader
        title="News & events"
        description="Publish stories and upcoming events. Events appear on the home page until their date has passed."
        actions={
          <Link href="/admin/news/new" className="inline-flex items-center gap-2 rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700">
            <Plus className="h-4 w-4" aria-hidden /> New story or event
          </Link>
        }
      />
      {saved && <p role="status" className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Saved.</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">All news stories and events</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Title</th>
              <th scope="col" className="px-4 py-3 font-medium">Type</th>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="max-w-md px-4 py-3 font-medium text-slate-900">{p.title}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{p.kind}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(p.eventDate, { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="px-4 py-3">{p.published ? <span className="text-emerald-700">Published</span> : <span className="text-slate-500">Draft</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/news/${p.id}`} className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-slate-100">Edit</Link>
                    <DeleteForm action={deletePost} id={p.id} confirmText={`Delete “${p.title}”?`} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600">Nothing published yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
