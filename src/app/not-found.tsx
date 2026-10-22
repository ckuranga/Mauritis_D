import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6 py-24">
      <h1 className="text-4xl">This page could not be found</h1>
      <p className="mt-4 text-lg text-muted">The address may have changed, or the page may have been removed.</p>
      <Link href="/" className="mt-8 rounded bg-navy-900 px-6 py-3 font-semibold text-white hover:bg-navy-800">Go to the home page</Link>
    </main>
  );
}
