import { LoanMethod } from "@/backend";
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
import { useCreateLoan, useMembers } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { HandCoins } from "lucide-react";
import { type FormEvent, useState } from "react";

const METHOD_LABEL: Record<LoanMethod, string> = {
  anuitas: "Anuitas (angsuran tetap)",
  menurun: "Menurun (bunga dari sisa pokok)",
};

export function LoanForm() {
  const { data: members } = useMembers();
  const createLoan = useCreateLoan();

  const [memberId, setMemberId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("12");
  const [method, setMethod] = useState<LoanMethod>(LoanMethod.anuitas);
  const [termMonths, setTermMonths] = useState("12");
  const [penaltyMonths, setPenaltyMonths] = useState("1");
  const [penaltyRate, setPenaltyRate] = useState("5");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const principalValue = Number(principal);
    const interestValue = Number(interestRate);
    const termValue = Number(termMonths);
    const penaltyMonthsValue = Number(penaltyMonths);
    const penaltyRateValue = Number(penaltyRate);

    if (!memberId) {
      setError("Pilih anggota terlebih dahulu");
      return;
    }
    if (principalValue <= 0) {
      setError("Jumlah pokok harus lebih dari nol");
      return;
    }

    createLoan.mutate(
      {
        memberId: BigInt(memberId),
        principal: principalValue,
        interestRate: interestValue,
        method,
        termMonths: BigInt(termValue),
        penaltyMonths: BigInt(penaltyMonthsValue),
        penaltyRate: penaltyRateValue,
      },
      {
        onSuccess: () => {
          setSuccess("Pengajuan pinjaman berhasil dibuat");
          setMemberId("");
          setPrincipal("");
          setInterestRate("12");
          setMethod(LoanMethod.anuitas);
          setTermMonths("12");
          setPenaltyMonths("1");
          setPenaltyRate("5");
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Gagal membuat pinjaman",
          );
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-panel space-y-4 p-5 sm:p-6"
      data-ocid="loans.form"
    >
      <div className="flex items-center gap-2">
        <HandCoins className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">
          Pengajuan pinjaman
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="loan-member">Anggota</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger id="loan-member" data-ocid="loans.member_select">
              <SelectValue placeholder="Pilih anggota" />
            </SelectTrigger>
            <SelectContent>
              {(members ?? []).map((member) => (
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
          <Label htmlFor="loan-principal">Pokok pinjaman (Rp)</Label>
          <Input
            id="loan-principal"
            type="number"
            min="0"
            inputMode="numeric"
            data-ocid="loans.principal_input"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            required
          />
          {principal && Number(principal) > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(Number(principal))}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-interest">Bunga per tahun (%)</Label>
          <Input
            id="loan-interest"
            type="number"
            min="0"
            step="0.5"
            data-ocid="loans.interest_input"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-method">Metode angsuran</Label>
          <Select
            value={method}
            onValueChange={(v) => setMethod(v as LoanMethod)}
          >
            <SelectTrigger id="loan-method" data-ocid="loans.method_select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LoanMethod.anuitas}>
                {METHOD_LABEL.anuitas}
              </SelectItem>
              <SelectItem value={LoanMethod.menurun}>
                {METHOD_LABEL.menurun}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-term">Jangka waktu (bulan)</Label>
          <Input
            id="loan-term"
            type="number"
            min="1"
            data-ocid="loans.term_input"
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-penalty-months">
            Denda setelah tunggakan (bulan)
          </Label>
          <Input
            id="loan-penalty-months"
            type="number"
            min="0"
            data-ocid="loans.penalty_months_input"
            value={penaltyMonths}
            onChange={(e) => setPenaltyMonths(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-penalty-rate">Denda dari sisa hutang (%)</Label>
          <Input
            id="loan-penalty-rate"
            type="number"
            min="0"
            step="0.5"
            data-ocid="loans.penalty_rate_input"
            value={penaltyRate}
            onChange={(e) => setPenaltyRate(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="loans.error_state"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="rounded-md bg-success/10 px-3 py-2 text-sm text-success"
          data-ocid="loans.success_state"
        >
          {success}
        </p>
      )}

      <Button
        type="submit"
        data-ocid="loans.submit_button"
        disabled={createLoan.isPending}
      >
        {createLoan.isPending ? "Mengajukan…" : "Ajukan pinjaman"}
      </Button>
    </form>
  );
}
