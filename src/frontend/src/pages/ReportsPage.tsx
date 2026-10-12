import type {
  BalanceSheetRow,
  IncomeStatementRow,
  Installment,
  Loan,
  Member,
  SavingsTransaction,
  ShuReport,
  TrialBalanceRow,
} from "@/backend";
import { createActor } from "@/backend";
import {
  MemberHistory,
  type MemberHistoryEntry,
} from "@/components/MemberHistory";
import {
  type ReportColumn,
  type ReportRow,
  ReportTable,
} from "@/components/ReportTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBalanceSheet,
  useIncomeStatement,
  useLoans,
  useMemberSavingsTransactions,
  useMembers,
  useShu,
  useTrialBalance,
} from "@/hooks/useQueries";
import { exportToCsv, printHtml } from "@/lib/export";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueries } from "@tanstack/react-query";
import { BarChart3, FileSpreadsheet, Users } from "lucide-react";
import { useState } from "react";

type Tab = "trial" | "income" | "balance" | "shu" | "member";

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "trial", label: "Neraca Saldo", icon: FileSpreadsheet },
  { id: "income", label: "Laba Rugi", icon: BarChart3 },
  { id: "balance", label: "Neraca", icon: FileSpreadsheet },
  { id: "shu", label: "SHU", icon: BarChart3 },
  { id: "member", label: "Riwayat Anggota", icon: Users },
];

const TRIAL_COLUMNS: ReportColumn[] = [
  { key: "accountCode", header: "Kode" },
  { key: "accountName", header: "Nama Akun" },
  { key: "debit", header: "Debit", align: "right", mono: true },
  { key: "credit", header: "Kredit", align: "right", mono: true },
];

const INCOME_COLUMNS: ReportColumn[] = [
  { key: "accountCode", header: "Kode" },
  { key: "accountName", header: "Nama Akun" },
  { key: "amount", header: "Jumlah", align: "right", mono: true },
];

const BALANCE_COLUMNS: ReportColumn[] = [
  { key: "accountCode", header: "Kode" },
  { key: "accountName", header: "Nama Akun" },
  { key: "amount", header: "Saldo", align: "right", mono: true },
];

function toTrialRows(rows: TrialBalanceRow[]): ReportRow[] {
  return rows.map((row) => ({
    accountCode: row.accountCode,
    accountName: row.accountName,
    debit: formatCurrency(row.debit),
    credit: formatCurrency(row.credit),
  }));
}

function toStatementRows(
  rows: (IncomeStatementRow | BalanceSheetRow)[],
): ReportRow[] {
  return rows.map((row) => ({
    accountCode: row.accountCode,
    accountName: row.accountName,
    amount: formatCurrency(row.amount),
  }));
}

function sum(rows: { amount: number }[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>("trial");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const { data: members = [] } = useMembers();
  const trialBalance = useTrialBalance();
  const incomeStatement = useIncomeStatement();
  const balanceSheet = useBalanceSheet();
  const shu = useShu();

  const memberId = selectedMemberId ? BigInt(selectedMemberId) : null;
  const memberTransactions = useMemberSavingsTransactions(memberId);
  const memberLoans = useLoans(memberId);
  const selectedMember = members.find(
    (member: Member) => member.id.toString() === selectedMemberId,
  );

  const trialRows = toTrialRows(trialBalance.data ?? []);
  const incomeRows = toStatementRows(incomeStatement.data ?? []);
  const balanceRows = toStatementRows(balanceSheet.data ?? []);

  const trialDebit = (trialBalance.data ?? []).reduce(
    (total, row) => total + row.debit,
    0,
  );
  const trialCredit = (trialBalance.data ?? []).reduce(
    (total, row) => total + row.credit,
    0,
  );
  const trialBalanced = trialDebit === trialCredit;
  const incomeTotal = sum(incomeStatement.data ?? []);
  const balanceTotal = sum(balanceSheet.data ?? []);

  const savingsEntries: MemberHistoryEntry[] = (
    memberTransactions.data ?? []
  ).map((tx: SavingsTransaction) => ({
    id: `savings-${tx.id.toString()}`,
    date: tx.createdAt,
    description: `${tx.isDeposit ? "Setoran" : "Penarikan"} · ${tx.transactionNumber}`,
    amount: tx.amount,
    direction: tx.isDeposit ? "in" : "out",
  }));

  const loanEntries: MemberHistoryEntry[] = (memberLoans.data ?? []).map(
    (loan: Loan) => ({
      id: `loan-${loan.id.toString()}`,
      date: loan.disbursedAt,
      description: `Pencairan pinjaman · ${loan.loanNumber}`,
      amount: loan.principal,
      direction: "in",
    }),
  );

  const handlePrintReceipt = (entry: MemberHistoryEntry) => {
    const memberLabel = selectedMember
      ? `${selectedMember.memberNumber} — ${selectedMember.name}`
      : "Anggota";
    printHtml(
      `Bukti Transaksi ${entry.id}`,
      `<h1>Bukti Transaksi</h1>
       <p class="meta">${memberLabel}</p>
       <table>
         <tbody>
           <tr><th>Tanggal</th><td>${formatDateTime(entry.date)}</td></tr>
           <tr><th>Keterangan</th><td>${entry.description}</td></tr>
           <tr><th>Nominal</th><td class="num">${entry.direction === "in" ? "+" : "−"}${formatCurrency(entry.amount)}</td></tr>
         </tbody>
       </table>
       <p class="footer">Dicetak dari aplikasi koperasi.</p>`,
    );
  };

  const handlePrintReport = (
    title: string,
    columns: ReportColumn[],
    rows: ReportRow[],
    totalLabel?: string,
    totalValue?: string,
  ) => {
    const head = columns.map((column) => `<th>${column.header}</th>`).join("");
    const body = rows
      .map(
        (row) =>
          `<tr>${columns
            .map(
              (column) =>
                `<td class="${column.align === "right" ? "num" : ""}">${row[column.key]}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("");
    const foot =
      totalLabel !== undefined && totalValue !== undefined
        ? `<tfoot><tr><td colspan="${columns.length - 1}">${totalLabel}</td><td class="num">${totalValue}</td></tr></tfoot>`
        : "";
    printHtml(
      title,
      `<h1>${title}</h1>
       <p class="meta">Koperasi · ${formatDateTime(BigInt(Date.now()) * 1_000_000n)}</p>
       <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table>
       <p class="footer">Dicetak dari aplikasi koperasi.</p>`,
    );
  };

  const handleExport = (
    filename: string,
    columns: ReportColumn[],
    rows: ReportRow[],
  ) => {
    exportToCsv(
      filename,
      columns.map((column) => ({
        header: column.header,
        value: (row) => row[column.key] ?? "",
      })),
      rows,
    );
  };

  return (
    <div className="space-y-6" data-ocid="reports.page">
      <header>
        <h1 className="font-display text-2xl font-bold">Laporan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Neraca saldo, laba rugi, neraca, SHU, dan riwayat transaksi anggota.
        </p>
      </header>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Jenis laporan"
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
              data-ocid={`reports.tab.${item.id}`}
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

      {tab === "trial" && (
        <ReportTable
          ocid="reports.trial_balance"
          columns={TRIAL_COLUMNS}
          rows={trialRows}
          isLoading={trialBalance.isLoading}
          emptyMessage="Belum ada data neraca saldo."
          totalLabel={trialBalanced ? "Total (seimbang)" : "Total Debit"}
          totalValue={formatCurrency(trialDebit)}
          onPrint={() =>
            handlePrintReport(
              "Neraca Saldo",
              TRIAL_COLUMNS,
              trialRows,
              trialBalanced ? "Total (seimbang)" : "Total Debit",
              formatCurrency(trialDebit),
            )
          }
          onExport={() =>
            handleExport("neraca-saldo.csv", TRIAL_COLUMNS, trialRows)
          }
        />
      )}

      {tab === "income" && (
        <ReportTable
          ocid="reports.income_statement"
          columns={INCOME_COLUMNS}
          rows={incomeRows}
          isLoading={incomeStatement.isLoading}
          emptyMessage="Belum ada data laba rugi."
          totalLabel="Total"
          totalValue={formatCurrency(incomeTotal)}
          onPrint={() =>
            handlePrintReport(
              "Laba Rugi",
              INCOME_COLUMNS,
              incomeRows,
              "Total",
              formatCurrency(incomeTotal),
            )
          }
          onExport={() =>
            handleExport("laba-rugi.csv", INCOME_COLUMNS, incomeRows)
          }
        />
      )}

      {tab === "balance" && (
        <ReportTable
          ocid="reports.balance_sheet"
          columns={BALANCE_COLUMNS}
          rows={balanceRows}
          isLoading={balanceSheet.isLoading}
          emptyMessage="Belum ada data neraca."
          totalLabel="Total"
          totalValue={formatCurrency(balanceTotal)}
          onPrint={() =>
            handlePrintReport(
              "Neraca",
              BALANCE_COLUMNS,
              balanceRows,
              "Total",
              formatCurrency(balanceTotal),
            )
          }
          onExport={() =>
            handleExport("neraca.csv", BALANCE_COLUMNS, balanceRows)
          }
        />
      )}

      {tab === "shu" && (
        <ShuPanel
          shu={shu.data ?? null}
          isLoading={shu.isLoading}
          onPrint={() => {
            if (!shu.data) return;
            printHtml(
              "Sisa Hasil Usaha",
              `<h1>Sisa Hasil Usaha</h1>
               <p class="meta">Koperasi</p>
               <table>
                 <tbody>
                   <tr><th>Total Pendapatan</th><td class="num">${formatCurrency(shu.data.totalRevenue)}</td></tr>
                   <tr><th>Total Beban</th><td class="num">${formatCurrency(shu.data.totalExpense)}</td></tr>
                   <tr><th>SHU</th><td class="num">${formatCurrency(shu.data.shu)}</td></tr>
                 </tbody>
               </table>
               <p class="footer">Dicetak dari aplikasi koperasi.</p>`,
            );
          }}
          onExport={() => {
            if (!shu.data) return;
            exportToCsv(
              "shu.csv",
              [
                { header: "Komponen", value: (row) => row.komponen },
                { header: "Nilai", value: (row) => row.nilai },
              ],
              [
                {
                  komponen: "Total Pendapatan",
                  nilai: formatCurrency(shu.data.totalRevenue),
                },
                {
                  komponen: "Total Beban",
                  nilai: formatCurrency(shu.data.totalExpense),
                },
                { komponen: "SHU", nilai: formatCurrency(shu.data.shu) },
              ],
            );
          }}
        />
      )}

      {tab === "member" && (
        <section className="space-y-4" data-ocid="reports.member_section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Riwayat Transaksi Anggota
              </h2>
              <p className="text-sm text-muted-foreground">
                Mutasi simpanan per anggota dan cetak bukti transaksi.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
              >
                <SelectTrigger
                  data-ocid="reports.member_select"
                  className="w-full"
                >
                  <SelectValue placeholder="Pilih anggota" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member: Member) => (
                    <SelectItem
                      key={member.id.toString()}
                      value={member.id.toString()}
                    >
                      {member.memberNumber} — {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!memberId ? (
            <div
              className="surface-panel flex flex-col items-center gap-3 px-6 py-14 text-center"
              data-ocid="reports.member.empty_state"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="h-6 w-6" />
              </span>
              <p className="font-medium">Pilih anggota</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Pilih anggota untuk melihat riwayat transaksi dan mencetak
                bukti.
              </p>
            </div>
          ) : (
            <MemberHistoryPanel
              savingsEntries={savingsEntries}
              loanEntries={loanEntries}
              loans={memberLoans.data ?? []}
              isLoading={memberTransactions.isLoading || memberLoans.isLoading}
              onPrintReceipt={handlePrintReceipt}
            />
          )}
        </section>
      )}
    </div>
  );
}

function MemberHistoryPanel({
  savingsEntries,
  loanEntries,
  loans,
  isLoading,
  onPrintReceipt,
}: {
  savingsEntries: MemberHistoryEntry[];
  loanEntries: MemberHistoryEntry[];
  loans: Loan[];
  isLoading: boolean;
  onPrintReceipt: (entry: MemberHistoryEntry) => void;
}) {
  const { actor, isFetching } = useActor(createActor);
  const installmentQueries = useQueries({
    queries: loans.map((loan) => ({
      queryKey: ["installments", loan.id.toString()],
      queryFn: async (): Promise<Installment[]> => {
        if (!actor) return [];
        return actor.listInstallments(loan.id);
      },
      enabled: !!actor && !isFetching,
    })),
  });

  const installmentEntries: MemberHistoryEntry[] = installmentQueries.flatMap(
    (query, index) => {
      const loan = loans[index];
      if (!loan) return [];
      return (query.data ?? []).map((installment: Installment) => ({
        id: `installment-${installment.id.toString()}`,
        date: installment.paidAt,
        description: `Angsuran pinjaman · ${installment.transactionNumber}`,
        amount: installment.amount,
        direction: "out",
      }));
    },
  );

  const entries = [
    ...savingsEntries,
    ...loanEntries,
    ...installmentEntries,
  ].sort((a, b) => Number(b.date - a.date));

  return (
    <MemberHistory
      entries={entries}
      isLoading={isLoading}
      onPrintReceipt={onPrintReceipt}
    />
  );
}

function ShuPanel({
  shu,
  isLoading,
  onPrint,
  onExport,
}: {
  shu: ShuReport | null;
  isLoading: boolean;
  onPrint: () => void;
  onExport: () => void;
}) {
  if (isLoading) {
    return (
      <div
        className="surface-panel flex flex-col gap-3 p-5"
        data-ocid="reports.shu.loading_state"
      >
        {Array.from({ length: 3 }, (_, i) => `shu-skeleton-${i}`).map((id) => (
          <div key={id} className="h-6 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!shu) {
    return (
      <div
        className="surface-panel px-5 py-12 text-center text-sm text-muted-foreground"
        data-ocid="reports.shu.empty_state"
      >
        Belum ada data SHU.
      </div>
    );
  }

  const items = [
    { label: "Total Pendapatan", value: shu.totalRevenue },
    { label: "Total Beban", value: shu.totalExpense },
    { label: "Sisa Hasil Usaha", value: shu.shu },
  ];

  return (
    <div className="surface-panel overflow-hidden" data-ocid="reports.shu">
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          data-ocid="reports.shu.print_button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-smooth hover:bg-accent"
        >
          Cetak PDF
        </button>
        <button
          type="button"
          data-ocid="reports.shu.export_button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-smooth hover:bg-accent"
        >
          Export Excel
        </button>
      </div>
      <dl className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-5 py-4"
          >
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="text-figure font-semibold">
              {formatCurrency(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
