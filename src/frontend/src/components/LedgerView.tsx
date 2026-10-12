import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccounts, useLedger } from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/lib/format";
import { BookOpen } from "lucide-react";
import { useState } from "react";

export function LedgerView() {
  const [accountCode, setAccountCode] = useState("");
  const { data: accounts } = useAccounts();
  const { data: entries, isLoading } = useLedger(accountCode || null);

  const selected = (accounts ?? []).find((a) => a.code === accountCode);
  const totalDebit = (entries ?? []).reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = (entries ?? []).reduce((sum, e) => sum + e.credit, 0);
  const balance = (entries ?? []).at(-1)?.balance ?? 0;

  return (
    <div className="surface-panel overflow-hidden" data-ocid="ledger.panel">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Buku Besar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih akun untuk melihat mutasi dan saldo berjalan.
          </p>
        </div>
        <div className="w-full space-y-2 sm:w-72">
          <Label htmlFor="ledger-account">Akun</Label>
          <Select value={accountCode} onValueChange={setAccountCode}>
            <SelectTrigger
              id="ledger-account"
              data-ocid="ledger.account_select"
            >
              <SelectValue placeholder="Pilih akun" />
            </SelectTrigger>
            <SelectContent>
              {(accounts ?? []).map((account) => (
                <SelectItem key={account.code} value={account.code}>
                  {account.code} · {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!accountCode ? (
        <div
          className="flex flex-col items-center gap-2 px-6 py-12 text-center"
          data-ocid="ledger.empty_state"
        >
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Belum ada akun dipilih</p>
          <p className="text-sm text-muted-foreground">
            Pilih akun di atas untuk menampilkan buku besar.
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 p-6" data-ocid="ledger.loading_state">
          {Array.from({ length: 4 }, (_, i) => `ledger-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-10 animate-pulse rounded-md bg-muted"
              />
            ),
          )}
        </div>
      ) : !entries || entries.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 px-6 py-12 text-center"
          data-ocid="ledger.empty_state"
        >
          <p className="font-medium">Belum ada mutasi</p>
          <p className="text-sm text-muted-foreground">
            Akun {selected?.name ?? accountCode} belum memiliki transaksi.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 border-b border-border bg-muted/40 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total debit
              </p>
              <p className="text-figure text-sm font-semibold sm:text-base">
                {formatCurrency(totalDebit)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total kredit
              </p>
              <p className="text-figure text-sm font-semibold sm:text-base">
                {formatCurrency(totalCredit)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Saldo
              </p>
              <p className="text-figure text-sm font-semibold sm:text-base">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table data-ocid="ledger.table">
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Kredit</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow
                    key={`${entry.transactionNumber}-${index}`}
                    data-ocid={`ledger.row.${index + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      {entry.transactionNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell className="min-w-[10rem]">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-right text-figure">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-figure">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-figure font-medium">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
