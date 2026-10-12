import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Printer } from "lucide-react";

export type ReportColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
  mono?: boolean;
};

export type ReportRow = Record<string, string | number>;

export function ReportTable({
  ocid,
  columns,
  rows,
  isLoading,
  emptyMessage,
  totalLabel,
  totalValue,
  onExport,
  onPrint,
}: {
  ocid: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  isLoading: boolean;
  emptyMessage: string;
  totalLabel?: string;
  totalValue?: string;
  onExport?: () => void;
  onPrint?: () => void;
}) {
  const hasActions = Boolean(onExport || onPrint);

  return (
    <div className="surface-panel overflow-hidden" data-ocid={ocid}>
      {hasActions && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-4 py-3">
          {onPrint && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid={`${ocid}.print_button`}
              onClick={onPrint}
            >
              <Printer className="h-4 w-4" />
              Cetak PDF
            </Button>
          )}
          {onExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid={`${ocid}.export_button`}
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <div
          className="flex flex-col gap-3 p-5"
          data-ocid={`${ocid}.loading_state`}
        >
          {Array.from({ length: 6 }, (_, i) => `report-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-6 w-full" />
            ),
          )}
        </div>
      ) : rows.length === 0 ? (
        <div
          className="px-5 py-12 text-center text-sm text-muted-foreground"
          data-ocid={`${ocid}.empty_state`}
        >
          {emptyMessage}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={
                    column.align === "right" ? "text-right" : undefined
                  }
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={`${ocid}-${columns.map((column) => row[column.key]).join("-")}`}
                data-ocid={`${ocid}.row.${index + 1}`}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={
                      column.align === "right"
                        ? `text-right ${column.mono ? "text-figure" : ""}`
                        : column.mono
                          ? "text-figure"
                          : undefined
                    }
                  >
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {totalLabel !== undefined && totalValue !== undefined && (
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length - 1} className="font-medium">
                  {totalLabel}
                </TableCell>
                <TableCell className="text-figure text-right font-semibold">
                  {totalValue}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      )}
    </div>
  );
}
