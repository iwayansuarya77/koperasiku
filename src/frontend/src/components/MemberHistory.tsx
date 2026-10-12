import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Printer } from "lucide-react";

export type MemberHistoryEntry = {
  id: string;
  date: bigint;
  description: string;
  amount: number;
  direction: "in" | "out";
};

export function MemberHistory({
  entries,
  isLoading,
  onPrintReceipt,
}: {
  entries: MemberHistoryEntry[];
  isLoading: boolean;
  onPrintReceipt: (entry: MemberHistoryEntry) => void;
}) {
  if (isLoading) {
    return (
      <div
        className="surface-panel flex flex-col gap-3 p-5"
        data-ocid="reports.member_history.loading_state"
      >
        {Array.from({ length: 5 }, (_, i) => `history-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-6 w-full" />
          ),
        )}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        className="surface-panel px-5 py-12 text-center text-sm text-muted-foreground"
        data-ocid="reports.member_history.empty_state"
      >
        Belum ada transaksi untuk anggota ini.
      </div>
    );
  }

  return (
    <div
      className="surface-panel overflow-hidden"
      data-ocid="reports.member_history"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tanggal</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="text-right">Bukti</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow
              key={entry.id}
              data-ocid={`reports.member_history.row.${index + 1}`}
            >
              <TableCell className="text-muted-foreground">
                {formatDateTime(entry.date)}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span
                    className={
                      entry.direction === "in"
                        ? "inline-block h-2 w-2 rounded-full bg-success"
                        : "inline-block h-2 w-2 rounded-full bg-destructive"
                    }
                    aria-hidden="true"
                  />
                  {entry.description}
                </span>
              </TableCell>
              <TableCell className="text-figure text-right">
                {entry.direction === "in" ? "+" : "−"}
                {formatCurrency(entry.amount)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`reports.member_history.print_button.${index + 1}`}
                  onClick={() => onPrintReceipt(entry)}
                >
                  <Printer className="h-4 w-4" />
                  Cetak
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
