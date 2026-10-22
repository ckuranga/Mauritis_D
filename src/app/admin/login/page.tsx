import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <h1 className="font-sans text-xl font-semibold text-slate-900">Administration</h1>
          <p className="mb-6 mt-1 text-sm text-slate-600">Sign in to manage the school website.</p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href="/" className="underline underline-offset-2 hover:text-slate-900">Back to the school website</Link>
        </p>
      </div>
    </main>
  );
}
