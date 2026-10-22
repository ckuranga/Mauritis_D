import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activities, mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ACTIVITY_CATEGORIES } from "@/lib/format";
import { mediaThumb } from "@/lib/media";
import { ActionForm, AreaField, CheckField, MediaPicker, SelectField, TextField } from "@/components/admin/ui";
import { Card, PageHeader } from "@/components/admin/PageHeader";
import { saveActivity } from "../../../actions";

export const metadata = { title: "Edit activity" };

export default async function EditActivity({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = getDb();
  const isNew = id === "new";
  const item = isNew ? null : (await db.select().from(activities).where(eq(activities.id, Number(id))).limit(1))[0];
  if (!isNew && !item) notFound();
  const images = (await db.select().from(mediaAssets).where(eq(mediaAssets.kind, "image")).orderBy(desc(mediaAssets.id)).limit(120)).map((m) => ({ id: m.id, title: m.title, src: mediaThumb(m) }));
  const cats = item && !ACTIVITY_CATEGORIES.includes(item.category) ? [item.category, ...ACTIVITY_CATEGORIES] : ACTIVITY_CATEGORIES;

  return (
    <>
      <PageHeader title={isNew ? "Add activity" : "Edit activity"} actions={<Link href="/admin/activities" className="text-sm underline">Back to list</Link>} />
      <Card>
        <ActionForm action={saveActivity} submitLabel={isNew ? "Add activity" : "Save changes"}>
          {item && <input type="hidden" name="id" value={item.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" name="name" required defaultValue={item?.name} />
            <SelectField label="Category" name="category" defaultValue={item?.category ?? cats[0]} options={cats} />
          </div>
          <AreaField label="Description" name="description" required rows={5} defaultValue={item?.description} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label="Season" name="season" defaultValue={item?.season} placeholder="e.g. Fall and spring" />
            <TextField label="Teacher or coach" name="advisor" defaultValue={item?.advisor} />
            <TextField label="Meets" name="schedule" defaultValue={item?.schedule} placeholder="e.g. Tue and Thu, 3:45 pm" />
            <TextField label="Where" name="location" defaultValue={item?.location} />
            <TextField label="Members" name="memberCount" type="number" defaultValue={item?.memberCount} hint="Leave blank to hide." />
            <TextField label="Recent achievements" name="achievements" defaultValue={item?.achievements} />
          </div>
          <MediaPicker name="cover" label="Photo" images={images} currentId={item?.coverMediaId ?? null} hasExternal={Boolean(item?.imageUrl)} />
          <CheckField label="Visible to the public" name="published" defaultChecked={item?.published ?? true} />
        </ActionForm>
      </Card>
    </>
  );
}
