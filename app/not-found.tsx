import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/marketing/Logo";
import { FOUNDER_EMAIL } from "@/lib/legal";

export const metadata: Metadata = { title: "Page not found · DoughTally" };

// Any URL that doesn't exist: say so plainly and offer the ways back.
export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#0c0b09] px-4 py-24 text-center font-body text-[#cfc6b7]">
      <Link href="/" aria-label="DoughTally home" className="flex items-center gap-2.5">
        <LogoMark className="h-9 w-9" />
        <span className="font-display text-xl font-bold tracking-tight text-white">DoughTally</span>
      </Link>
      <p className="mt-12 font-ledger text-[11px] tracking-[0.25em] text-[#ff5b1f] uppercase">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">This page isn&apos;t here.</h1>
      <p className="mt-4 max-w-md text-[17px] text-[#a79f92]">The link may be old or mistyped. Here are the ways back.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-[#ff5b1f] px-6 py-3 text-[15px] font-semibold text-[#0c0b09] hover:bg-[#ff7a45]">
          Home page
        </Link>
        <Link href="/login" className="rounded-full border border-white/15 px-6 py-3 text-[15px] font-medium text-white hover:border-white/40">
          Log in
        </Link>
      </div>
      <p className="mt-10 text-[14px] text-[#8f877b]">
        Expected something here?{" "}
        <a href={`mailto:${FOUNDER_EMAIL}`} className="text-white underline decoration-[#ff5b1f] underline-offset-4">
          Tell me
        </a>
        .
      </p>
    </div>
  );
}
