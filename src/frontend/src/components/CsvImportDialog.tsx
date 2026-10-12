import type { Member, SavingsType } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useImportInitialSavingsBalances } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ParsedRow = {
  memberId: bigint;
  savingsTypeId: bigint;
  amount: number;
  label: string;
};

function parseCsv(
  text: string,
  members: Member[],
  types: SavingsType[],
): { rows: ParsedRow[]; errors: string[] } {
  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  lines.forEach((line, index) => {
    const cells = line.split(/[,;]/).map((cell) => cell.trim());
    if (index === 0 && cells[0].toLowerCase().includes("anggota")) return;
    if (cells.length < 3) {
      errors.push(`Baris ${index + 1}: butuh 3 kolom (anggota, jenis, saldo)`);
      return;
    }
    const [memberRef, typeRef, amountRef] = cells;
    const member = members.find(
      (item) => item.memberNumber === memberRef || item.name === memberRef,
    );
    const type = types.find((item) => item.name === typeRef);
    const amount = Number(amountRef.replace(/\./g, "").replace(/,/g, "."));
    if (!member) {
      errors.push(`Baris ${index + 1}: anggota "${memberRef}" tidak ditemukan`);
      return;
    }
    if (!type) {
      errors.push(`Baris ${index + 1}: jenis "${typeRef}" tidak ditemukan`);
      return;
    }
    if (Number.isNaN(amount)) {
      errors.push(`Baris ${index + 1}: saldo "${amountRef}" tidak valid`);
      return;
    }
    rows.push({
      memberId: member.id,
      savingsTypeId: type.id,
      amount,
      label: `${member.name} — ${type.name}`,
    });
  });

  return { rows, errors };
}

export function CsvImportDialog({
  open,
  onOpenChange,
  members,
  savingsTypes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  savingsTypes: SavingsType[];
}) {
  const importBalances = useImportInitialSavingsBalances();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

  const { rows, errors } = parseCsv(text, members, savingsTypes);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setText(content);
    setFileName(file.name);
  };

  const handleSubmit = () => {
    if (rows.length === 0 || importBalances.isPending) return;
    importBalances.mutate(
      rows.map((row) => [row.memberId, row.savingsTypeId, row.amount]),
      {
        onSuccess: (count) => {
          toast.success(`${count} saldo awal berhasil diimpor`);
          setText("");
          setFileName("");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-ocid="csv_import.dialog">
        <DialogHeader>
          <DialogTitle>Import Saldo Awal</DialogTitle>
          <DialogDescription>
            Unggah CSV dengan kolom: nomor anggota, jenis simpanan, saldo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label
            htmlFor="csv-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-input px-6 py-8 text-center transition-smooth hover:bg-muted"
            data-ocid="csv_import.dropzone"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              {fileName || "Pilih berkas CSV"}
            </span>
            <span className="text-xs text-muted-foreground">
              Format: 1001, Simpanan Sukarela, 250000
            </span>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              data-ocid="csv_import.upload_button"
              onChange={handleFile}
            />
          </label>

          {errors.length > 0 && (
            <div
              className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              data-ocid="csv_import.error_state"
            >
              {errors.slice(0, 4).map((error) => (
                <p key={error}>{error}</p>
              ))}
              {errors.length > 4 && (
                <p>+{errors.length - 4} baris bermasalah</p>
              )}
            </div>
          )}

          {rows.length > 0 && (
            <div
              className="max-h-56 overflow-y-auto rounded-md border border-border"
              data-ocid="csv_import.preview_list"
            >
              {rows.map((row) => (
                <div
                  key={`${row.memberId}-${row.savingsTypeId}`}
                  className="flex items-center justify-between border-b border-border px-4 py-2 text-sm last:border-0"
                >
                  <span className="truncate">{row.label}</span>
                  <span className="text-figure">
                    {formatCurrency(row.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="csv_import.cancel_button"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            data-ocid="csv_import.submit_button"
            disabled={rows.length === 0 || importBalances.isPending}
            onClick={handleSubmit}
          >
            {importBalances.isPending
              ? "Mengimpor…"
              : `Impor ${rows.length} Baris`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
