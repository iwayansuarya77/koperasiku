export type ExportColumn = {
  header: string;
  value: (row: Record<string, string | number>) => string | number;
};

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(
  columns: ExportColumn[],
  rows: Record<string, string | number>[],
): string {
  const header = columns.map((column) => escapeCsv(column.header)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsv(column.value(row))).join(","),
  );
  return [header, ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, string | number>[],
): void {
  downloadCsv(filename, toCsv(columns, rows));
}

export function printHtml(title: string, bodyHtml: string): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    document.body.removeChild(frame);
    return;
  }

  doc.open();
  doc.write(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "DM Sans", system-ui, sans-serif; color: #10201f; margin: 32px; }
  h1 { font-family: "Space Grotesk", system-ui, sans-serif; font-size: 20px; margin: 0 0 4px; }
  .meta { font-size: 12px; color: #5b6b6a; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #d8e0df; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #5b6b6a; }
  td.num, th.num { text-align: right; font-family: "JetBrains Mono", monospace; font-variant-numeric: tabular-nums; }
  tfoot td { font-weight: 600; border-top: 2px solid #10201f; }
  .footer { margin-top: 24px; font-size: 11px; color: #5b6b6a; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`);
  doc.close();

  const cleanup = () => {
    if (frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }
  };

  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.focus();
    win.print();
    window.setTimeout(cleanup, 1000);
  };
}
