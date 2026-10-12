import type {
  Member,
  SavingsBalance,
  SavingsTransaction,
  SavingsType,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
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
import {
  useSavingsBalances,
  useSavingsTransactions,
  useSavingsTypes,
} from "@/hooks/useQueries";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ArrowDownLeft, ArrowUpRight, BookOpen } from "lucide-react";

function typeName(types: SavingsType[], id: bigint): string {
  return types.find((type) => type.id === id)?.name ?? "Jenis dihapus";
}

export function SavingsBook({
  members,
  selectedMemberId,
  onSelectMember,
}: {
  members: Member[];
  selectedMemberId: string;
  onSelectMember: (value: string) => void;
}) {
  const memberId = selectedMemberId ? BigInt(selectedMemberId) : null;
  const { data: types = [] } = useSavingsTypes();
  const { data: balances = [], isLoading: balancesLoading } =
    useSavingsBalances(memberId);
  const { data: transactions = [], isLoading: transactionsLoading } =
    useSavingsTransactions(memberId);

  const total = balances.reduce(
    (sum: number, row: SavingsBalance) => sum + row.balance,
    0,
  );

  return (
    <section className="space-y-4" data-ocid="savings_book.section">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Buku Simpanan</h2>
          <p className="text-sm text-muted-foreground">
            Saldo dan mutasi per anggota.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select value={selectedMemberId} onValueChange={onSelectMember}>
            <SelectTrigger
              data-ocid="savings_book.member_select"
              className="w-full"
            >
              <SelectValue placeholder="Pilih anggota" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
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
          data-ocid="savings_book.empty_state"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BookOpen className="h-6 w-6" />
          </span>
          <p className="font-medium">Pilih anggota</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Pilih anggota untuk melihat saldo dan riwayat mutasi simpanan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-semibold">
                Saldo per Jenis
              </h3>
              <span className="text-figure text-sm font-semibold">
                {formatCurrency(total)}
              </span>
            </div>
            {balancesLoading ? (
              <p
                className="px-5 py-8 text-center text-sm text-muted-foreground"
                data-ocid="savings_book.loading_state"
              >
                Memuat saldo…
              </p>
            ) : balances.length === 0 ? (
              <p
                className="px-5 py-8 text-center text-sm text-muted-foreground"
                data-ocid="savings_book.balances_empty_state"
              >
                Belum ada saldo simpanan untuk anggota ini.
              </p>
            ) : (
              <Table data-ocid="savings_book.balances_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Simpanan</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((row: SavingsBalance) => (
                    <TableRow
                      key={row.savingsTypeId.toString()}
                      data-ocid="savings_book.balance_row"
                    >
                      <TableCell className="font-medium">
                        {typeName(types, row.savingsTypeId)}
                      </TableCell>
                      <TableCell className="text-right text-figure">
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="surface-panel overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-semibold">
                Mutasi Terakhir
              </h3>
            </div>
            {transactionsLoading ? (
              <p
                className="px-5 py-8 text-center text-sm text-muted-foreground"
                data-ocid="savings_book.transactions_loading_state"
              >
                Memuat mutasi…
              </p>
            ) : transactions.length === 0 ? (
              <p
                className="px-5 py-8 text-center text-sm text-muted-foreground"
                data-ocid="savings_book.transactions_empty_state"
              >
                Belum ada mutasi simpanan.
              </p>
            ) : (
              <Table data-ocid="savings_book.transactions_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: SavingsTransaction) => (
                    <TableRow
                      key={tx.id.toString()}
                      data-ocid="savings_book.transaction_row"
                    >
                      <TableCell className="font-mono text-xs">
                        {tx.transactionNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={tx.isDeposit ? "default" : "secondary"}
                          >
                            {tx.isDeposit ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {tx.isDeposit ? "Setoran" : "Penarikan"}
                          </Badge>
                          <span className="text-muted-foreground">
                            {typeName(types, tx.savingsTypeId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(tx.createdAt)}
                      </TableCell>
                      <TableCell className="text-right text-figure">
                        {tx.isDeposit ? "+" : "−"}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
