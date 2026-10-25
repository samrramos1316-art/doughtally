// PostgREST returns at most 1000 rows a request (Supabase's max_rows), and
// cuts the rest off silently. For lists that grow with use (price history,
// invoice lines, invoices, alerts), read every page. `page` must be the
// query with a stable order (end on .order("id")) and .range(from, to).
export async function selectAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 1000,
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) return { data: null, error };
    out.push(...(data ?? []));
    if (!data || data.length < pageSize) return { data: out, error: null };
  }
}
