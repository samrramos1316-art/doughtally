// Minimal RFC 4180 CSV — quoted fields, doubled quotes, commas and newlines
// inside quotes, CRLF or LF — enough for round-tripping a spreadsheet export.

// Spreadsheets run a cell that starts with = + - @ (or a tab/CR before
// one) as a formula, and names here can come straight off a supplier's
// invoice. A leading ' makes the app show it as text; parseCsv drops it
// again on import. Numbers are written as numbers, so -1 stays -1.
const FORMULA_START = /^[=+\-@\t\r]/;
export const unguardCell = (s: string) => (s.startsWith("'") && FORMULA_START.test(s.slice(1)) ? s.slice(1) : s);

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    const raw = v == null ? "" : String(v);
    const s = typeof v === "string" && FORMULA_START.test(raw) ? `'${raw}` : raw;
    return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, ""); // Excel's UTF-8 BOM

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"' && field === "") inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== "")).map((r) => r.map(unguardCell));
}
