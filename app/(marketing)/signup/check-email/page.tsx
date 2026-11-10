import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { ResendForm } from "@/components/auth/ResendForm";

export const metadata: Metadata = { title: "Check your email · DoughTally", robots: { index: false } };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return (
    <AuthShell title="Check your email" subtitle="One step left before you can log in.">
      <div className="space-y-5 text-sm text-stone-700">
        <p>
          We sent a confirmation link to <span className="font-medium text-stone-900">{email || "your email address"}</span>.
          Click it and you&apos;ll land straight in your dashboard.
        </p>
        <p className="text-stone-500">Nothing after a few minutes? Check spam, or send it again.</p>
        {email && <ResendForm email={email} />}
        <p className="text-center">
          <Link href="/login" className="font-medium text-stone-900 underline">
            Back to log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
