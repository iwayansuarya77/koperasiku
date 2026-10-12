import type { Account, SavingsType } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSavingsType, useUpdateSavingsType } from "@/hooks/useQueries";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SavingsTypeForm({
  open,
  onOpenChange,
  accounts,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  editing: SavingsType | null;
}) {
  const createType = useCreateSavingsType();
  const updateType = useUpdateSavingsType();

  const [name, setName] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [cashAccountCode, setCashAccountCode] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setInterestRate(String(editing.interestRate));
      setCashAccountCode(editing.cashAccountCode);
    } else {
      setName("");
      setInterestRate("");
      setCashAccountCode("");
    }
  }, [open, editing]);

  const pending = createType.isPending || updateType.isPending;
  const canSubmit =
    name.trim().length > 0 &&
    cashAccountCode.length > 0 &&
    interestRate.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || pending) return;
    const rate = Number(interestRate);
    if (Number.isNaN(rate)) {
      toast.error("Suku bunga harus berupa angka");
      return;
    }

    if (editing) {
      updateType.mutate(
        {
          id: editing.id,
          name: name.trim(),
          interestRate: rate,
          cashAccountCode,
          isActive: editing.isActive,
        },
        {
          onSuccess: () => {
            toast.success("Jenis simpanan diperbarui");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    } else {
      createType.mutate(
        { name: name.trim(), interestRate: rate, cashAccountCode },
        {
          onSuccess: () => {
            toast.success("Jenis simpanan ditambahkan");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="savings_type.dialog">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Ubah Jenis Simpanan" : "Tambah Jenis Simpanan"}
          </DialogTitle>
          <DialogDescription>
            Tentukan nama, suku bunga, dan akun kas untuk jenis simpanan ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="savings-type-name">Nama jenis</Label>
            <Input
              id="savings-type-name"
              data-ocid="savings_type.name_input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Simpanan Sukarela"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-type-rate">Suku bunga (% / tahun)</Label>
            <Input
              id="savings-type-rate"
              data-ocid="savings_type.rate_input"
              type="number"
              step="0.01"
              min="0"
              value={interestRate}
              onChange={(event) => setInterestRate(event.target.value)}
              placeholder="3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-type-account">Akun kas</Label>
            <Select value={cashAccountCode} onValueChange={setCashAccountCode}>
              <SelectTrigger
                id="savings-type-account"
                data-ocid="savings_type.account_select"
                className="w-full"
              >
                <SelectValue placeholder="Pilih akun kas" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.code} value={account.code}>
                    {account.code} — {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="savings_type.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              data-ocid="savings_type.submit_button"
              disabled={!canSubmit || pending}
            >
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
