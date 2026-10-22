import { requireAdmin } from "@/lib/auth";
import { ActionForm, TextField } from "@/components/admin/ui";
import { Card, PageHeader } from "@/components/admin/PageHeader";
import { changePassword, updateProfile } from "../../actions";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-sans text-base font-semibold">Profile</h2>
          <ActionForm action={updateProfile} submitLabel="Save profile">
            <TextField label="Name" name="name" required defaultValue={me.name} />
            <TextField label="Job title" name="title" defaultValue={me.title} />
            <TextField label="Email (used to sign in)" name="email" type="email" required defaultValue={me.email} />
          </ActionForm>
        </Card>
        <Card>
          <h2 className="mb-4 font-sans text-base font-semibold">Change password</h2>
          <ActionForm action={changePassword} submitLabel="Change password">
            <TextField label="Current password" name="current" type="password" required />
            <TextField label="New password" name="next" type="password" required hint="At least 12 characters with upper-case, lower-case and a number." />
            <TextField label="Confirm new password" name="confirm" type="password" required />
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
