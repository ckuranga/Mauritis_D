import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { mediaThumb } from "@/lib/media";
import { ActionForm, AreaField, CheckField, MediaPicker, TextField } from "@/components/admin/ui";
import { Card, PageHeader } from "@/components/admin/PageHeader";
import { saveSettings } from "../../actions";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  const images = (await getDb().select().from(mediaAssets).where(eq(mediaAssets.kind, "image")).orderBy(desc(mediaAssets.id)).limit(120)).map((m) => ({ id: m.id, title: m.title, src: mediaThumb(m) }));

  return (
    <>
      <PageHeader title="Site settings" description="Text, contact details and key facts shown across the website. Leave a figure blank to hide it." />
      <ActionForm action={saveSettings} className="space-y-6" submitLabel="Save settings">
        <Card className="space-y-4">
          <h2 className="font-sans text-base font-semibold">School</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="School name" name="schoolName" required defaultValue={s.schoolName} />
            <TextField label="Motto" name="motto" defaultValue={s.motto} />
            <TextField label="Year founded" name="foundedYear" defaultValue={s.foundedYear} />
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-sans text-base font-semibold">Announcement bar</h2>
          <CheckField label="Show the announcement at the top of every page" name="announcementActive" defaultChecked={s.announcementActive} />
          <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <TextField label="Label" name="announcementLabel" defaultValue={s.announcementLabel} maxLength={40} />
            <TextField label="Message" name="announcementText" defaultValue={s.announcementText} maxLength={240} />
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-sans text-base font-semibold">Home page</h2>
          <TextField label="Headline" name="heroTitle" defaultValue={s.heroTitle} />
          <AreaField label="Introduction" name="heroSubtitle" rows={3} defaultValue={s.heroSubtitle} />
          <MediaPicker name="heroCover" label="Main photo" images={images} currentId={s.heroMediaId} hasExternal={Boolean(s.heroImageUrl)} />
          <div className="grid gap-4 sm:grid-cols-4">
            <TextField label="Student–teacher ratio" name="statRatio" defaultValue={s.statRatio} />
            <TextField label="University placement" name="statMatriculation" defaultValue={s.statMatriculation} hint="Only enter a figure you can verify." />
            <TextField label="Athletics record" name="statAthletics" defaultValue={s.statAthletics} />
            <TextField label="Clubs and societies" name="statClubs" defaultValue={s.statClubs} />
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-sans text-base font-semibold">Headmaster</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" name="headName" defaultValue={s.headName} />
            <TextField label="Title" name="headTitle" defaultValue={s.headTitle} />
          </div>
          <AreaField label="Pull quote" name="headQuote" rows={2} defaultValue={s.headQuote} />
          <AreaField label="Message" name="headMessage" rows={7} defaultValue={s.headMessage} hint="Separate paragraphs with a blank line." />
          <MediaPicker name="headCover" label="Portrait" images={images} currentId={s.headMediaId} hasExternal={Boolean(s.headImageUrl)} />
        </Card>
        <Card className="space-y-4">
          <h2 className="font-sans text-base font-semibold">Admissions & fees</h2>
          <TextField label="Application deadline" name="admissionsDeadline" defaultValue={s.admissionsDeadline} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Day tuition" name="tuitionDay" defaultValue={s.tuitionDay} />
            <TextField label="Boarding tuition" name="tuitionBoarding" defaultValue={s.tuitionBoarding} />
          </div>
          <AreaField label="Financial aid" name="financialAid" rows={2} defaultValue={s.financialAid} />
        </Card>
        <Card className="space-y-4">
          <h2 className="font-sans text-base font-semibold">Contact details</h2>
          <TextField label="Address" name="address" defaultValue={s.address} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Phone" name="phone" defaultValue={s.phone} />
            <TextField label="General email" name="email" type="email" defaultValue={s.email} />
            <TextField label="Admissions email" name="admissionsEmail" type="email" defaultValue={s.admissionsEmail} />
          </div>
          <TextField label="Office hours" name="officeHours" defaultValue={s.officeHours} />
        </Card>
      </ActionForm>
    </>
  );
}
