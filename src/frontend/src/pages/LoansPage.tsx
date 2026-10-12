import type { LoanMethod } from "@/backend";
import { AmortizationTable } from "@/components/AmortizationTable";
import { InstallmentForm } from "@/components/InstallmentForm";
import { LoanForm } from "@/components/LoanForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDisburseLoan,
  useInstallments,
  useLoans,
  useMembers,
  usePostMonthlyLoanInterest,
  useSendDueReminders,
} from "@/hooks/useQueries";
import { formatCurrency, formatDate } from "@/lib/format";
import { BellRing, ChevronDown, Percent } from "lucide-react";
import { useState } from "react";

const METHOD_LABEL: Record<LoanMethod, string> = {
  anuitas: "Anuitas",
  menurun: "Menurun",
};

function LoanCard({
  loan,
  memberName,
  index,
}: {
  loan: {
    id: bigint;
    loanNumber: string;
    principal: number;
    interestRate: number;
    method: LoanMethod;
    termMonths: bigint;
    penaltyMonths: bigint;
    penaltyRate: number;
    disbursedAt: bigint;
    remainingPrincipal: number;
    isClosed: boolean;
  };
  memberName: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const disburseLoan = useDisburseLoan();
  const { data: installments } = useInstallments(expanded ? loan.id : null);

  const isDisbursed = loan.disbursedAt > 0n;
  const status = loan.isClosed
    ? "Lunas"
    : isDisbursed
      ? "Berjalan"
      : "Menunggu pencairan";

  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border py-0 shadow-subtle"
      data-ocid={`loans.card.${index + 1}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-figure font-semibold text-foreground">
                {loan.loanNumber}
              </span>
              <Badge
                variant={
                  loan.isClosed
                    ? "secondary"
                    : isDisbursed
                      ? "default"
                      : "outline"
                }
                data-ocid={`loans.status.${index + 1}`}
              >
                {status}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {memberName} · {METHOD_LABEL[loan.method]} · {loan.interestRate}%
              /tahun
            </p>
            <p className="text-xs text-muted-foreground">
              Jangka {loan.termMonths.toString()} bulan · Denda{" "}
              {loan.penaltyRate}% setelah {loan.penaltyMonths.toString()} bulan
              tunggakan
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Sisa pokok
            </span>
            <span className="text-figure text-lg font-semibold text-foreground">
              {formatCurrency(loan.remainingPrincipal)}
            </span>
            <span className="text-xs text-muted-foreground">
              Pokok {formatCurrency(loan.principal)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
          {!isDisbursed && (
            <Button
              type="button"
              size="sm"
              data-ocid={`loans.disburse_button.${index + 1}`}
              onClick={() => disburseLoan.mutate(loan.id)}
              disabled={disburseLoan.isPending}
            >
              {disburseLoan.isPending ? "Mencairkan…" : "Cairkan pinjaman"}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid={`loans.toggle_installment.${index + 1}`}
            onClick={() => setExpanded((open) => !open)}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Tutup" : "Angsuran & jadwal"}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-4 border-t border-border">
            {isDisbursed && !loan.isClosed && (
              <InstallmentForm
                loanId={loan.id}
                remainingPrincipal={loan.remainingPrincipal}
              />
            )}

            <div className="px-4 py-4">
              <h4 className="mb-2 font-display text-sm font-semibold">
                Riwayat angsuran
              </h4>
              {!installments || installments.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground"
                  data-ocid={`loans.installment_empty_state.${index + 1}`}
                >
                  Belum ada angsuran tercatat.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {installments.map((item, itemIndex) => (
                    <li
                      key={item.id.toString()}
                      className="flex items-center justify-between gap-3 text-sm"
                      data-ocid={`loans.installment_item.${index + 1}.${itemIndex + 1}`}
                    >
                      <span className="text-muted-foreground">
                        {item.transactionNumber} · {formatDate(item.paidAt)}
                      </span>
                      <span className="text-figure font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border">
              <h4 className="px-4 pt-4 font-display text-sm font-semibold">
                Jadwal angsuran ({METHOD_LABEL[loan.method]})
              </h4>
              <AmortizationTable
                principal={loan.principal}
                interestRate={loan.interestRate}
                method={loan.method}
                termMonths={Number(loan.termMonths)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LoansPage() {
  const [memberId, setMemberId] = useState("");
  const { data: members } = useMembers();
  const { data: loans, isLoading } = useLoans(
    memberId ? BigInt(memberId) : null,
  );
  const sendDueReminders = useSendDueReminders();
  const postMonthlyInterest = usePostMonthlyLoanInterest();
  const [notice, setNotice] = useState("");

  const memberName = (id: bigint) =>
    members?.find((member) => member.id === id)?.name ?? "Anggota";

  const handleReminders = () => {
    setNotice("");
    sendDueReminders.mutate(undefined, {
      onSuccess: (count) =>
        setNotice(`${count.toString()} pengingat jatuh tempo terkirim`),
      onError: (err) =>
        setNotice(err instanceof Error ? err.message : "Gagal mengirim"),
    });
  };

  const handlePostInterest = () => {
    setNotice("");
    postMonthlyInterest.mutate(undefined, {
      onSuccess: (count) =>
        setNotice(`${count.toString()} pinjaman dikenai bunga bulanan`),
      onError: (err) =>
        setNotice(
          err instanceof Error ? err.message : "Gagal memposting bunga",
        ),
    });
  };

  return (
    <div className="space-y-6" data-ocid="loans.page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pinjaman</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengajuan, pencairan, dan pencatatan angsuran anggota.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="loans.send_reminders_button"
            onClick={handleReminders}
            disabled={sendDueReminders.isPending}
          >
            <BellRing className="h-4 w-4" />
            {sendDueReminders.isPending ? "Mengirim…" : "Kirim pengingat H-3"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="loans.post_interest_button"
            onClick={handlePostInterest}
            disabled={postMonthlyInterest.isPending}
          >
            <Percent className="h-4 w-4" />
            {postMonthlyInterest.isPending
              ? "Memposting…"
              : "Posting bunga bulanan"}
          </Button>
        </div>
      </div>

      {notice && (
        <p
          className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          data-ocid="loans.notice_state"
        >
          {notice}
        </p>
      )}

      <LoanForm />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold">
            Daftar pinjaman
          </h2>
          <div className="w-full sm:w-72">
            <Label htmlFor="loan-filter-member" className="sr-only">
              Pilih anggota
            </Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger
                id="loan-filter-member"
                data-ocid="loans.filter_member_select"
              >
                <SelectValue placeholder="Pilih anggota untuk melihat pinjaman" />
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
        </div>

        {!memberId ? (
          <div
            className="surface-panel flex flex-col items-center gap-2 px-6 py-12 text-center"
            data-ocid="loans.empty_state"
          >
            <p className="font-medium">Pilih anggota</p>
            <p className="text-sm text-muted-foreground">
              Pilih anggota di atas untuk menampilkan daftar pinjaman mereka.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3" data-ocid="loans.loading_state">
            {Array.from({ length: 2 }, (_, i) => `loan-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-32 w-full rounded-lg" />
              ),
            )}
          </div>
        ) : !loans || loans.length === 0 ? (
          <div
            className="surface-panel flex flex-col items-center gap-2 px-6 py-12 text-center"
            data-ocid="loans.empty_state"
          >
            <p className="font-medium">Belum ada pinjaman</p>
            <p className="text-sm text-muted-foreground">
              Ajukan pinjaman pertama melalui formulir di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="loans.list">
            {loans.map((loan, index) => (
              <LoanCard
                key={loan.id.toString()}
                loan={loan}
                memberName={memberName(loan.memberId)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
