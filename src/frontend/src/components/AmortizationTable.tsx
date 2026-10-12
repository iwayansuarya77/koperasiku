import { LoanMethod } from "@/backend";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

export type AmortizationRow = {
  month: number;
  installment: number;
  interest: number;
  principal: number;
  remaining: number;
};

export function buildSchedule({
  principal,
  interestRate,
  method,
  termMonths,
}: {
  principal: number;
  interestRate: number;
  method: LoanMethod;
  termMonths: number;
}): AmortizationRow[] {
  if (principal <= 0 || termMonths <= 0) return [];
  const monthlyRate = interestRate / 100 / 12;
  const rows: AmortizationRow[] = [];
  let remaining = principal;

  if (method === LoanMethod.anuitas) {
    const installment =
      monthlyRate === 0
        ? principal / termMonths
        : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);
    for (let month = 1; month <= termMonths; month += 1) {
      const interest = remaining * monthlyRate;
      const principalPart = installment - interest;
      remaining = Math.max(0, remaining - principalPart);
      rows.push({
        month,
        installment,
        interest,
        principal: principalPart,
        remaining,
      });
    }
    return rows;
  }

  const principalPart = principal / termMonths;
  for (let month = 1; month <= termMonths; month += 1) {
    const interest = remaining * monthlyRate;
    remaining = Math.max(0, remaining - principalPart);
    rows.push({
      month,
      installment: principalPart + interest,
      interest,
      principal: principalPart,
      remaining,
    });
  }
  return rows;
}

export function AmortizationTable({
  principal,
  interestRate,
  method,
  termMonths,
}: {
  principal: number;
  interestRate: number;
  method: LoanMethod;
  termMonths: number;
}) {
  const rows = buildSchedule({
    principal,
    interestRate,
    method,
    termMonths,
  });

  if (rows.length === 0) {
    return (
      <p
        className="px-4 py-6 text-sm text-muted-foreground"
        data-ocid="loans.amortization_empty_state"
      >
        Isi pokok dan jangka waktu untuk melihat jadwal angsuran.
      </p>
    );
  }

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 pt-4 text-sm">
        <span className="text-muted-foreground">
          Metode:{" "}
          <span className="font-medium text-foreground">
            {method === LoanMethod.anuitas ? "Anuitas" : "Menurun"}
          </span>
        </span>
        <span className="text-muted-foreground">
          Total bunga:{" "}
          <span className="text-figure font-medium text-foreground">
            {formatCurrency(totalInterest)}
          </span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table data-ocid="loans.amortization_table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Bulan</TableHead>
              <TableHead className="text-right">Angsuran</TableHead>
              <TableHead className="text-right">Bunga</TableHead>
              <TableHead className="text-right">Pokok</TableHead>
              <TableHead className="text-right">Sisa pokok</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.month}
                data-ocid={`loans.amortization_row.${row.month}`}
              >
                <TableCell className="text-muted-foreground">
                  {row.month}
                </TableCell>
                <TableCell className="text-right text-figure">
                  {formatCurrency(row.installment)}
                </TableCell>
                <TableCell className="text-right text-figure text-muted-foreground">
                  {formatCurrency(row.interest)}
                </TableCell>
                <TableCell className="text-right text-figure text-muted-foreground">
                  {formatCurrency(row.principal)}
                </TableCell>
                <TableCell className="text-right text-figure">
                  {formatCurrency(row.remaining)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
