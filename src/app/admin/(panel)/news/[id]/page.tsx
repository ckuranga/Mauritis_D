import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets, newsPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { NEWS_CATEGORIES } from "@/lib/format";
import { mediaThumb } from "@/lib/media";
import { ActionForm, AreaField, CheckField, MediaPicker, SelectField, TextField } from "@/components/admin/ui";
import { Card, PageHeader } from "@/components/admin/PageHeader";
import { savePost } from "../../../actions";

export const metadata = { title: "Edit story or event" };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const db = getDb();
  const isNew = id === "new";
  const post = isNew ? null : (await db.select().from(newsPosts).where(eq(newsPosts.id, Number(id))).limit(1))[0];
  if (!isNew && !post) notFound();
  const images = (await db.select().from(mediaAssets).where(eq(mediaAssets.kind, "image")).orderBy(desc(mediaAssets.id)).limit(120)).map((m) => ({ id: m.id, title: m.title, src: mediaThumb(m) }));

  return (
    <>
      <PageHeader title={isNew ? "New story or event" : "Edit story or event"} actions={<Link href="/admin/news" className="text-sm underline">Back to list</Link>} />
      <Card>
        <ActionForm action={savePost} submitLabel={isNew ? "Publish" : "Save changes"} className="space-y-5">
          {post && <input type="hidden" name="id" value={post.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Type" name="kind" defaultValue={post?.kind ?? "news"} options={[{ value: "news", label: "News story" }, { value: "event", label: "Event" }]} />
            <SelectField label="Category" name="category" defaultValue={post?.category ?? "Announcements"} options={NEWS_CATEGORIES} />
          </div>
          <TextField label="Title" name="title" required defaultValue={post?.title} maxLength={200} />
          <AreaField label="Summary" name="summary" required rows={2} maxLength={400} defaultValue={post?.summary} hint="One or two sentences shown in lists and search results." />
          <AreaField label="Full text" name="body" required rows={10} defaultValue={post?.body} hint="Separate paragraphs with a blank line." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField label="Date" name="eventDate" type="date" required defaultValue={post?.eventDate ?? new Date().toISOString().slice(0, 10)} />
            <TextField label="Time" name="eventTime" defaultValue={post?.eventTime} placeholder="e.g. 7:00 pm – 9:30 pm" />
            <TextField label="Location" name="location" defaultValue={post?.location} />
            <TextField label="Author" name="author" defaultValue={post?.author ?? me.name} />
          </div>
          <MediaPicker name="cover" label="Cover photo" images={images} currentId={post?.coverMediaId ?? null} hasExternal={Boolean(post?.coverUrl)} />
          <div className="space-y-3">
            <CheckField label="Feature on the home page" name="featured" defaultChecked={post?.featured} />
            <CheckField label="Published" name="published" defaultChecked={post?.published ?? true} hint="Untick to keep it as a draft that visitors cannot see." />
          </div>
        </ActionForm>
      </Card>
    </>
  );
}
