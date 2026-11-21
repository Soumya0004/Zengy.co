import Link from "next/link";

export default function NotFound() {
  return (
    <main
      aria-labelledby="not-found-title"
      className="flex min-h-[65vh] items-center justify-center bg-[#fcfbfb] px-6 py-20 text-zinc-900"
    >
      <div className="w-full max-w-3xl text-center">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
          404 · Page not found
        </p>
        <h1
          id="not-found-title"
          className="font-zentry text-[clamp(7rem,24vw,17rem)] leading-[0.8] tracking-tight"
        >
          404
        </h1>
        <p className="mx-auto mt-8 max-w-md text-base leading-7 text-zinc-600 sm:text-lg">
          Looks like this page has gone out of style. It may have moved, or the
          link may be incorrect.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Back to home
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium transition hover:border-zinc-900"
          >
            Explore the shop
          </Link>
        </div>
      </div>
    </main>
  );
}
