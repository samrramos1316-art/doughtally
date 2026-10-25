"use client";

import { useActionState } from "react";
import { deleteAccountAction, type DeleteAccountState } from "@/app/(app)/settings/actions";

// Collapsed by default: deleting is permanent, so it takes opening this,
// reading what goes, and the password.
export function DeleteAccount() {
  const [state, action, pending] = useActionState<DeleteAccountState, FormData>(deleteAccountAction, null);
  return (
    <details className="group mt-4 border-t border-stone-200 pt-3">
      <summary className="cursor-pointer text-sm font-medium text-red-700">Delete account…</summary>
      <form action={action} className="mt-3 space-y-3">
        <p className="text-sm text-stone-700">
          This permanently deletes your login and everything in this business: invoices and their photos, ingredients, recipes, menu items, prices and alerts. It can&apos;t be undone. Export your ingredient list first if you want to keep it.
        </p>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <div className="space-y-1">
          <label htmlFor="delete-password" className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase">Your password</label>
          <input id="delete-password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-red-200" />
        </div>
        <button type="submit" disabled={pending} className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">
          {pending ? "Deleting…" : "Delete my account and data"}
        </button>
      </form>
    </details>
  );
}
