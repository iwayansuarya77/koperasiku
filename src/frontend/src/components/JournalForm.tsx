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
import { useAccounts, usePostManualJournal } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

type DraftLine = {
  key: string;
  accountCode: string;
  debit: string;
  credit: string;
};

function newLine(): DraftLine {
  return {
    key: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    debit: "",
    credit: "",
  };
}

export function JournalForm() {
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine(), newLine()]);
  const [error, setError] = useState("");

  const { data: accounts } = useAccounts();
  const postJournal = usePostManualJournal();

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => setLines((current) => [...current, newLine()]);

  const removeLine = (key: string) =>
    setLines((current) => current.filter((line) => line.key !== key));

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce(
    (sum, l) => sum + (Number(l.credit) || 0),
    0,
  );
  const balanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const payload: JournalLine[] = lines
      .filter((l) => l.accountCode)
      .map((l) => ({
        accountCode: l.accountCode,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      }));

    if (payload.length < 2) {
      setError("Jurnal memerlukan minimal dua baris akun.");
      return;
    }
    if (!balanced) {
      setError("Total debit dan kredit harus seimbang.");
      return;
    }

    postJournal.mutate(
      { description, lines: payload },
      {
        onSuccess: () => {
          setDescription("");
          setLines([newLine(), newLine()]);
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Gagal menyimpan jurnal",
          );
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-panel space-y-4 p-5 sm:p-6"
      data-ocid="journal.form"
    >
      <div>
        <h2 className="font-display text-lg font-semibold">Jurnal Umum</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat entri manual dengan pasangan debit dan kredit.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-description">Keterangan</Label>
        <Input
          id="journal-description"
          data-ocid="journal.description_input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Penyesuaian beban listrik"
          required
        />
      </div>

      <div className="space-y-3">
        <div className="hidden gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[1fr_7rem_7rem_2.5rem]">
          <span>Akun</span>
          <span className="text-right">Debit</span>
          <span className="text-right">Kredit</span>
          <span />
        </div>

        {lines.map((line, index) => (
          <div
            key={line.key}
            className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_7rem_7rem_2.5rem] sm:items-center sm:border-0 sm:p-0"
            data-ocid={`journal.line.${index + 1}`}
          >
            <Select
              value={line.accountCode}
              onValueChange={(value) =>
                updateLine(line.key, { accountCode: value })
              }
            >
              <SelectTrigger data-ocid={`journal.account_select.${index + 1}`}>
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

            <Input
              type="number"
              min="0"
              inputMode="numeric"
              data-ocid={`journal.debit_input.${index + 1}`}
              value={line.debit}
              onChange={(e) =>
                updateLine(line.key, { debit: e.target.value, credit: "" })
              }
              placeholder="0"
              className="text-right text-figure"
            />

            <Input
              type="number"
              min="0"
              inputMode="numeric"
              data-ocid={`journal.credit_input.${index + 1}`}
              value={line.credit}
              onChange={(e) =>
                updateLine(line.key, { credit: e.target.value, debit: "" })
              }
              placeholder="0"
              className="text-right text-figure"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus baris ${index + 1}`}
              data-ocid={`journal.remove_button.${index + 1}`}
              onClick={() => removeLine(line.key)}
              disabled={lines.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="journal.add_line_button"
          onClick={addLine}
        >
          <Plus className="h-4 w-4" />
          Tambah baris
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex gap-6 text-sm">
          <span className="text-muted-foreground">
            Debit:{" "}
            <span className="text-figure font-medium text-foreground">
              {formatCurrency(totalDebit)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Kredit:{" "}
            <span className="text-figure font-medium text-foreground">
              {formatCurrency(totalCredit)}
            </span>
          </span>
        </div>
        <Button
          type="submit"
          data-ocid="journal.submit_button"
          disabled={postJournal.isPending}
        >
          {postJournal.isPending ? "Menyimpan…" : "Simpan jurnal"}
        </Button>
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="journal.error_state"
        >
          {error}
        </p>
      )}
    </form>
  );
}
