import type { JournalLine } from "@/backend";
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
import { useAccounts, usePostCashEntry } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowDownToLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

type DraftLine = {
  key: string;
  accountCode: string;
  amount: string;
};

function newLine(): DraftLine {
  return {
    key: `cash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    amount: "",
  };
}

export function CashEntryForm() {
  const [isCashIn, setIsCashIn] = useState(true);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [error, setError] = useState("");

  const { data: accounts } = useAccounts();
  const postCash = usePostCashEntry();

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => setLines((current) => [...current, newLine()]);
  const removeLine = (key: string) =>
    setLines((current) => current.filter((line) => line.key !== key));

  const total = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const payload: JournalLine[] = lines
      .filter((l) => l.accountCode && Number(l.amount) > 0)
      .map((l) => ({
        accountCode: l.accountCode,
        debit: isCashIn ? 0 : Number(l.amount),
        credit: isCashIn ? Number(l.amount) : 0,
      }));

    if (payload.length === 0) {
      setError("Tambahkan minimal satu baris akun dengan nominal.");
      return;
    }

    postCash.mutate(
      { description, lines: payload, isCashIn },
      {
        onSuccess: () => {
          setDescription("");
          setLines([newLine()]);
        },
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Gagal menyimpan kas"),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-panel space-y-4 p-5 sm:p-6"
      data-ocid="cash.form"
    >
      <div>
        <h2 className="font-display text-lg font-semibold">
          Kas Masuk / Keluar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat mutasi kas dengan satu atau beberapa akun lawan.
        </p>
      </div>

      <fieldset
        className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1"
        aria-label="Jenis mutasi kas"
      >
        <button
          type="button"
          data-ocid="cash.in_toggle"
          aria-pressed={isCashIn}
          onClick={() => setIsCashIn(true)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-smooth",
            isCashIn
              ? "bg-card text-foreground shadow-subtle"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowDownToLine className="h-4 w-4" />
          Kas masuk
        </button>
        <button
          type="button"
          data-ocid="cash.out_toggle"
          aria-pressed={!isCashIn}
          onClick={() => setIsCashIn(false)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-smooth",
            !isCashIn
              ? "bg-card text-foreground shadow-subtle"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowUpFromLine className="h-4 w-4" />
          Kas keluar
        </button>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="cash-description">Keterangan</Label>
        <Input
          id="cash-description"
          data-ocid="cash.description_input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Setoran modal tunai"
          required
        />
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <div
            key={line.key}
            className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_9rem_2.5rem] sm:items-center sm:border-0 sm:p-0"
            data-ocid={`cash.line.${index + 1}`}
          >
            <Select
              value={line.accountCode}
              onValueChange={(value) =>
                updateLine(line.key, { accountCode: value })
              }
            >
              <SelectTrigger data-ocid={`cash.account_select.${index + 1}`}>
                <SelectValue placeholder="Pilih akun lawan" />
              </SelectTrigger>
              <SelectContent>
                {(accounts ?? []).map((account) => (
                  <SelectItem key={account.code} value={account.code}>
                    {account.code} · {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min="0"
              inputMode="numeric"
              data-ocid={`cash.amount_input.${index + 1}`}
              value={line.amount}
              onChange={(e) => updateLine(line.key, { amount: e.target.value })}
              placeholder="Nominal"
              className="text-right text-figure"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus baris ${index + 1}`}
              data-ocid={`cash.remove_button.${index + 1}`}
              onClick={() => removeLine(line.key)}
              disabled={lines.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="cash.add_line_button"
          onClick={addLine}
        >
          <Plus className="h-4 w-4" />
          Tambah baris
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="text-figure font-medium text-foreground">
            {formatCurrency(total)}
          </span>
        </span>
        <Button
          type="submit"
          data-ocid="cash.submit_button"
          disabled={postCash.isPending}
        >
          {postCash.isPending ? "Menyimpan…" : "Simpan transaksi kas"}
        </Button>
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="cash.error_state"
        >
          {error}
        </p>
      )}
    </form>
  );
}
