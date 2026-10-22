"use client";

import { useActionState, useId } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/(site)/actions";

const input =
  "block w-full rounded border border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-muted/70 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/30 aria-[invalid=true]:border-red-700";

function Row({ label, name, error, hint, required, children }: { label: string; name: string; error?: string; hint?: string; required?: boolean; children: (p: Record<string, string | boolean | undefined>) => React.ReactNode }) {
  const id = useId();
  const describedBy = [error ? `${id}-e` : "", hint ? `${id}-h` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required ? <span className="text-muted"> (required)</span> : null}
      </label>
      {children({ id, name, "aria-invalid": error ? "true" : undefined, "aria-describedby": describedBy, required })}
      {hint && <p id={`${id}-h`} className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-e`} className="mt-1 text-sm font-medium text-red-800">{error}</p>}
    </div>
  );
}

export function InquiryForm({ kind, topics, grades }: { kind: "contact" | "admissions"; topics: string[]; grades?: string[] }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null);
  const v = state?.values ?? {};
  const e = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div role="status" className="rounded border border-emerald-300 bg-emerald-50 p-6">
        <p className="flex items-center gap-2 font-serif text-xl font-semibold text-emerald-900">
          <CheckCircle2 className="h-5 w-5" aria-hidden /> Thank you, we have your message.
        </p>
        <p className="mt-2 text-emerald-900">
          {kind === "admissions"
            ? "A member of the admissions office will reply within two working days to arrange your visit."
            : "The office will reply within two working days."}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="kind" value={kind} />
      {/* Honeypot: hidden from people and assistive technology */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {state?.error && (
        <p role="alert" className="rounded border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-900">{state.error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Full name" name="fullName" required error={e.fullName}>
          {(p) => <input {...p} type="text" autoComplete="name" defaultValue={v.fullName} className={input} />}
        </Row>
        <Row label="Email" name="email" required error={e.email}>
          {(p) => <input {...p} type="email" autoComplete="email" defaultValue={v.email} className={input} />}
        </Row>
        <Row label="Phone" name="phone" hint="Optional">
          {(p) => <input {...p} type="tel" autoComplete="tel" defaultValue={v.phone} className={input} />}
        </Row>
        <Row label={kind === "admissions" ? "I would like to" : "Topic"} name="topic">
          {(p) => (
            <select {...p} defaultValue={v.topic || topics[0]} className={input}>
              {topics.map((t) => <option key={t}>{t}</option>)}
            </select>
          )}
        </Row>
        {kind === "admissions" && grades && (
          <>
            <Row label="Grade your child is entering" name="studentGrade">
              {(p) => (
                <select {...p} defaultValue={v.studentGrade || grades[0]} className={input}>
                  {grades.map((g) => <option key={g}>{g}</option>)}
                </select>
              )}
            </Row>
            <Row label="Preferred visit date" name="preferredDate" hint="Optional">
              {(p) => <input {...p} type="date" defaultValue={v.preferredDate} className={input} />}
            </Row>
          </>
        )}
      </div>

      <Row label="Message" name="message" required error={e.message}>
        {(p) => <textarea {...p} rows={5} defaultValue={v.message} className={input} />}
      </Row>

      <div>
        <div className="flex items-start gap-3">
          <input id="consent" name="consent" type="checkbox" required aria-invalid={e.consent ? "true" : undefined} className="mt-1 h-5 w-5 rounded border-line" />
          <label htmlFor="consent" className="text-sm">
            I agree that the school may store these details and contact me about this request. See the <a href="/privacy" className="underline">privacy policy</a>.
          </label>
        </div>
        {e.consent && <p className="mt-1 text-sm font-medium text-red-800">{e.consent}</p>}
      </div>

      <button type="submit" disabled={pending} className="rounded bg-navy-900 px-6 py-3 font-semibold text-white hover:bg-navy-800 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Sending…" : kind === "admissions" ? "Request a visit" : "Send message"}
      </button>
    </form>
  );
}
