import { TransactionKind } from "@/backend";
import { CashEntryForm } from "@/components/CashEntryForm";
import { JournalForm } from "@/components/JournalForm";
import { LedgerView } from "@/components/LedgerView";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useJournals } from "@/hooks/useQueries";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BookOpen, Coins, ScrollText, Wallet } from "lucide-react";
import { useState } from "react";

const KIND_LABEL: Record<TransactionKind, string> = {
  [TransactionKind.manualJournal]: "Jurnal manual",
  [TransactionKind.cashIn]: "Kas masuk",
  [TransactionKind.cashOut]: "Kas keluar",
  [TransactionKind.savingsDeposit]: "Setoran simpanan",
  [TransactionKind.savingsWithdrawal]: "Penarikan simpanan",
  [TransactionKind.savingsInterest]: "Bunga simpanan",
  [TransactionKind.loanDisbursement]: "Pencairan pinjaman",
  [TransactionKind.loanInstallment]: "Angsuran pinjaman",
  [TransactionKind.loanInterest]: "Bunga pinjaman",
  [TransactionKind.penalty]: "Denda",
};

type Tab = "journal" | "cash" | "ledger";

const TABS: { id: Tab; label: string; icon: typeof Coins }[] = [
  { id: "journal", label: "Jurnal Umum", icon: ScrollText },
  { id: "cash", label: "Kas", icon: Wallet },
  { id: "ledger", label: "Buku Besar", icon: BookOpen },
];

export function AccountingPage() {
  const [tab, setTab] = useState<Tab>("journal");
  const { data: journals, isLoading } = useJournals();

  return (
    <div className="space-y-6" data-ocid="accounting.page">
      <div>
        <h1 className="font-display text-2xl font-bold">Akuntansi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Jurnal umum, mutasi kas, dan buku besar koperasi.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Bagian akuntansi"
      >
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-ocid={`accounting.tab.${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-smooth",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "journal" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <JournalForm />

          <div
            className="surface-panel overflow-hidden"
            data-ocid="journal.list"
          >
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="font-display text-lg font-semibold">
                Daftar Jurnal
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jurnal otomatis dan manual dengan nomor transaksi.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-6" data-ocid="journal.loading_state">
                {Array.from(
                  { length: 4 },
                  (_, i) => `journal-skeleton-${i}`,
                ).map((id) => (
                  <div
                    key={id}
                    className="h-12 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            ) : !journals || journals.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 px-6 py-12 text-center"
                data-ocid="journal.empty_state"
              >
                <Coins className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Belum ada jurnal</p>
                <p className="text-sm text-muted-foreground">
                  Jurnal otomatis muncul dari transaksi simpanan, pinjaman, dan
                  kas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {journals.map((entry, index) => {
                  const total = entry.lines.reduce(
                    (sum, line) => sum + line.debit,
                    0,
                  );
                  return (
                    <div
                      key={entry.id.toString()}
                      className="space-y-2 px-5 py-4 sm:px-6"
                      data-ocid={`journal.item.${index + 1}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {entry.transactionNumber}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {KIND_LABEL[entry.kind]}
                        </span>
                      </div>
                      <p className="font-medium">{entry.description}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{formatDateTime(entry.createdAt)}</span>
                        <span className="text-figure">
                          {entry.lines.length} baris · {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "cash" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <CashEntryForm />

          <div className="surface-panel overflow-hidden" data-ocid="cash.list">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="font-display text-lg font-semibold">
                Riwayat Kas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mutasi kas masuk dan keluar terbaru.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-6" data-ocid="cash.loading_state">
                {Array.from({ length: 4 }, (_, i) => `cash-skeleton-${i}`).map(
                  (id) => (
                    <div
                      key={id}
                      className="h-12 animate-pulse rounded-md bg-muted"
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="cash.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Transaksi</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(journals ?? [])
                      .filter(
                        (entry) =>
                          entry.kind === TransactionKind.cashIn ||
                          entry.kind === TransactionKind.cashOut,
                      )
                      .map((entry, index) => {
                        const total = entry.lines.reduce(
                          (sum, line) => sum + line.debit,
                          0,
                        );
                        const isIn = entry.kind === TransactionKind.cashIn;
                        return (
                          <TableRow
                            key={entry.id.toString()}
                            data-ocid={`cash.row.${index + 1}`}
                          >
                            <TableCell className="font-mono text-xs">
                              {entry.transactionNumber}
                            </TableCell>
                            <TableCell className="min-w-[10rem]">
                              {entry.description}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right text-figure font-medium",
                                isIn ? "text-success" : "text-destructive",
                              )}
                            >
                              {isIn ? "+" : "−"}
                              {formatCurrency(total)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                {(journals ?? []).filter(
                  (entry) =>
                    entry.kind === TransactionKind.cashIn ||
                    entry.kind === TransactionKind.cashOut,
                ).length === 0 && (
                  <div
                    className="flex flex-col items-center gap-2 px-6 py-12 text-center"
                    data-ocid="cash.empty_state"
                  >
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">Belum ada mutasi kas</p>
                    <p className="text-sm text-muted-foreground">
                      Catat kas masuk atau keluar melalui formulir.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "ledger" && <LedgerView />}
    </div>
  );
}
