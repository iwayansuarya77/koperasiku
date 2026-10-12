import type { Account, Member, SavingsType } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecordSavingsTransaction } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";

export function SavingsTransactionForm({
  members,
  savingsTypes,
  accounts,
}: {
  members: Member[];
  savingsTypes: SavingsType[];
  accounts: Account[];
}) {
  const record = useRecordSavingsTransaction();

  const [memberId, setMemberId] = useState("");
  const [savingsTypeId, setSavingsTypeId] = useState("");
  const [cashAccountCode, setCashAccountCode] = useState("");
  const [amount, setAmount] = useState("");
  const [isDeposit, setIsDeposit] = useState(true);

  const activeTypes = savingsTypes.filter((type) => type.isActive);
  const activeAccounts = accounts.filter((account) => account.isActive);

  const canSubmit =
    memberId.length > 0 &&
    savingsTypeId.length > 0 &&
    cashAccountCode.length > 0 &&
    amount.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || record.isPending) return;
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      toast.error("Jumlah harus lebih dari nol");
      return;
    }

    record.mutate(
      {
        memberId: BigInt(memberId),
        savingsTypeId: BigInt(savingsTypeId),
        cashAccountCode,
        amount: value,
        isDeposit,
      },
      {
        onSuccess: () => {
          toast.success(
            isDeposit
              ? `Setoran ${formatCurrency(value)} tercatat`
              : `Penarikan ${formatCurrency(value)} tercatat`,
          );
          setAmount("");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-panel space-y-4 p-5"
      data-ocid="savings_transaction.panel"
    >
      <div>
        <h2 className="font-display text-lg font-semibold">Transaksi Baru</h2>
        <p className="text-sm text-muted-foreground">
          Catat setoran atau penarikan simpanan anggota.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tx-member">Anggota</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger
              id="tx-member"
              data-ocid="savings_transaction.member_select"
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

        <div className="space-y-2">
          <Label htmlFor="tx-type">Jenis simpanan</Label>
          <Select value={savingsTypeId} onValueChange={setSavingsTypeId}>
            <SelectTrigger
              id="tx-type"
              data-ocid="savings_transaction.type_select"
              className="w-full"
            >
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              {activeTypes.map((type) => (
                <SelectItem key={type.id.toString()} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tx-account">Akun kas</Label>
          <Select value={cashAccountCode} onValueChange={setCashAccountCode}>
            <SelectTrigger
              id="tx-account"
              data-ocid="savings_transaction.account_select"
              className="w-full"
            >
              <SelectValue placeholder="Pilih akun kas" />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts.map((account) => (
                <SelectItem key={account.code} value={account.code}>
                  {account.code} — {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tx-amount">Jumlah (Rp)</Label>
          <Input
            id="tx-amount"
            data-ocid="savings_transaction.amount_input"
            type="number"
            min="0"
            step="1000"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100000"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-md border border-border p-1"
          data-ocid="savings_transaction.toggle"
        >
          <button
            type="button"
            data-ocid="savings_transaction.deposit_toggle"
            onClick={() => setIsDeposit(true)}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-smooth ${
              isDeposit
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Setoran
          </button>
          <button
            type="button"
            data-ocid="savings_transaction.withdrawal_toggle"
            onClick={() => setIsDeposit(false)}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-smooth ${
              !isDeposit
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Penarikan
          </button>
        </div>

        <Button
          type="submit"
          data-ocid="savings_transaction.submit_button"
          disabled={!canSubmit || record.isPending}
        >
          {record.isPending
            ? "Menyimpan…"
            : isDeposit
              ? "Catat Setoran"
              : "Catat Penarikan"}
        </Button>
      </div>
    </form>
  );
}
