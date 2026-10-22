"use client";

import { useActionState, useId, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Check } from "lucide-react";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

export const inputCls =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/25 disabled:bg-slate-100";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextField(props: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  className?: string;
  placeholder?: string;
}) {
  const { label, hint, className, ...rest } = props;
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input id={id} className={inputCls} {...rest} defaultValue={rest.defaultValue ?? ""} />
      )}
    </Field>
  );
}

export function AreaField(props: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}) {
  const { label, hint, className, rows = 4, ...rest } = props;
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <textarea id={id} rows={rows} className={inputCls} {...rest} defaultValue={rest.defaultValue ?? ""} />}
    </Field>
  );
}

export function SelectField(props: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[] | { value: string; label: string }[];
  hint?: string;
  className?: string;
}) {
  const { label, hint, className, options, ...rest } = props;
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select id={id} className={inputCls} {...rest}>
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return (
              <option key={v} value={v}>
                {l}
              </option>
            );
          })}
        </select>
      )}
    </Field>
  );
}

export function CheckField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
      />
      <label htmlFor={id} className="text-sm text-slate-800">
        {label}
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </label>
    </div>
  );
}

export function SubmitButton({ children, pending: label = "Saving…" }: { children: ReactNode; pending?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? label : children}
    </button>
  );
}

export function Notice({ state }: { state: FormState }) {
  if (!state || (!state.error && !state.message)) return null;
  const bad = Boolean(state.error);
  return (
    <p
      role={bad ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
        bad ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {bad ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
      {state.error || state.message}
    </p>
  );
}

/** A form wired to a server action with inline success/error feedback. */
export function ActionForm({
  action,
  children,
  className = "space-y-5",
  submitLabel = "Save changes",
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <Notice state={state} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

/** Delete button that asks first. */
export function DeleteForm({
  action,
  id,
  label = "Delete",
  confirmText,
}: {
  action: (data: FormData) => Promise<void>;
  id: number;
  label?: string;
  confirmText: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-md px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
        {label}
      </button>
    </form>
  );
}

export type PickerImage = { id: number; title: string; src: string };

/** Choose a cover/hero photo from the media library. Submits "keep", "none" or a media id. */
export function MediaPicker({
  name,
  label,
  images,
  currentId,
  hasExternal,
}: {
  name: string;
  label: string;
  images: PickerImage[];
  currentId: number | null;
  hasExternal: boolean;
}) {
  const initial = currentId ? String(currentId) : hasExternal ? "keep" : "none";
  const [value, setValue] = useState(initial);
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-800">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-md border border-slate-300 bg-white p-2 sm:grid-cols-4 md:grid-cols-6">
        {hasExternal && (
          <Choice selected={value === "keep"} onSelect={() => setValue("keep")} label="Current image (external)">
            <span className="flex h-full items-center justify-center bg-slate-100 p-1 text-center text-[11px] text-slate-600">Current image</span>
          </Choice>
        )}
        <Choice selected={value === "none"} onSelect={() => setValue("none")} label="No image">
          <span className="flex h-full items-center justify-center bg-slate-100 p-1 text-center text-[11px] text-slate-600">None</span>
        </Choice>
        {images.map((img) => (
          <Choice key={img.id} selected={value === String(img.id)} onSelect={() => setValue(String(img.id))} label={img.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </Choice>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">Photos come from the Media library. Upload new ones there first.</p>
    </fieldset>
  );
}

function Choice({
  selected,
  onSelect,
  label,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={label}
      aria-label={label}
      className={`relative aspect-[4/3] overflow-hidden rounded border-2 ${selected ? "border-navy-700" : "border-transparent hover:border-slate-300"}`}
    >
      {children}
      {selected && (
        <span className="absolute right-1 top-1 rounded-full bg-navy-800 p-0.5 text-white">
          <Check className="h-3 w-3" aria-hidden />
        </span>
      )}
    </button>
  );
}
