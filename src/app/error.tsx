"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6 py-24">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="mt-4 text-lg text-muted">We could not load this page. Please try again in a moment.</p>
      <button onClick={reset} className="mt-8 rounded bg-navy-900 px-6 py-3 font-semibold text-white hover:bg-navy-800">Try again</button>
    </main>
  );
}
