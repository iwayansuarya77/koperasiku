import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCalculatePenalty, useRecordInstallment } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { Receipt } from "lucide-react";
import { type FormEvent, useState } from "react";

export function InstallmentForm({
  loanId,
  remainingPrincipal,
  onDone,
}: {
  loanId: bigint;
  remainingPrincipal: number;
  onDone?: () => void;
}) {
  const recordInstallment = useRecordInstallment();
  const calculatePenalty = useCalculatePenalty();

  const [amount, setAmount] = useState("");
  const [unpaidMonths, setUnpaidMonths] = useState("");
  const [penalty, setPenalty] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (value <= 0) {
      setError("Jumlah angsuran harus lebih dari nol");
      return;
    }

    recordInstallment.mutate(
      { loanId, amount: value },
      {
        onSuccess: () => {
          setSuccess("Angsuran berhasil dicatat");
          setAmount("");
          setPenalty(null);
          setUnpaidMonths("");
          onDone?.();
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Gagal mencatat angsuran",
          );
        },
      },
    );
  };

  const handleCalculatePenalty = () => {
    setError("");
    const months = Number(unpaidMonths);
    if (months <= 0) {
      setError("Isi jumlah bulan tunggakan");
      return;
    }
    calculatePenalty.mutate(
      { loanId, unpaidMonths: BigInt(months) },
      {
        onSuccess: (value) => {
          setPenalty(value);
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Gagal menghitung denda",
          );
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-t border-border bg-muted/40 p-4 sm:p-5"
      data-ocid="loans.installment_form"
    >
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold">Catat angsuran</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          Sisa pokok:{" "}
          <span className="text-figure font-medium text-foreground">
            {formatCurrency(remainingPrincipal)}
          </span>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`installment-amount-${loanId}`}>
            Jumlah angsuran (Rp)
          </Label>
          <Input
            id={`installment-amount-${loanId}`}
            type="number"
            min="0"
            inputMode="numeric"
            data-ocid="loans.installment_amount_input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`installment-months-${loanId}`}>
            Bulan tunggakan
          </Label>
          <div className="flex gap-2">
            <Input
              id={`installment-months-${loanId}`}
              type="number"
              min="0"
              data-ocid="loans.unpaid_months_input"
              value={unpaidMonths}
              onChange={(e) => setUnpaidMonths(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              data-ocid="loans.calculate_penalty_button"
              onClick={handleCalculatePenalty}
              disabled={calculatePenalty.isPending}
            >
              {calculatePenalty.isPending ? "…" : "Hitung denda"}
            </Button>
          </div>
          {penalty !== null && (
            <p
              className="text-xs text-warning"
              data-ocid="loans.penalty_result"
            >
              Denda: {formatCurrency(penalty)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="loans.installment_error_state"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="rounded-md bg-success/10 px-3 py-2 text-sm text-success"
          data-ocid="loans.installment_success_state"
        >
          {success}
        </p>
      )}

      <Button
        type="submit"
        size="sm"
        data-ocid="loans.installment_submit_button"
        disabled={recordInstallment.isPending}
      >
        {recordInstallment.isPending ? "Menyimpan…" : "Catat angsuran"}
      </Button>
    </form>
  );
}
