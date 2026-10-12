import { type Account, AccountType } from "@/backend";
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
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  asset: "Aset",
  liability: "Kewajiban",
  equity: "Ekuitas",
  revenue: "Pendapatan",
  expense: "Beban",
};

export const ACCOUNT_TYPE_ORDER: AccountType[] = [
  AccountType.asset,
  AccountType.liability,
  AccountType.equity,
  AccountType.revenue,
  AccountType.expense,
];

export function AccountForm({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(
    AccountType.asset,
  );
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const isEditing = account !== null;
  const isPending = createAccount.isPending || updateAccount.isPending;

  useEffect(() => {
    if (!open) return;
    if (account) {
      setCode(account.code);
      setName(account.name);
      setAccountType(account.accountType);
    } else {
      setCode("");
      setName("");
      setAccountType(AccountType.asset);
    }
  }, [open, account]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Nama akun wajib diisi");
      return;
    }
    if (account) {
      updateAccount.mutate(
        { ...account, code, name, accountType },
        {
          onSuccess: () => {
            toast.success("Akun diperbarui");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    } else {
      createAccount.mutate(
        { name, accountType },
        {
          onSuccess: () => {
            toast.success("Akun baru ditambahkan");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        data-ocid="account.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Ubah Akun" : "Tambah Akun"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui kode, nama, dan tipe akun."
              : "Kode akun dibuat otomatis sesuai tipe."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="account-code">Kode Akun</Label>
              <Input
                id="account-code"
                data-ocid="account.code.input"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="font-mono"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="account-name">Nama Akun</Label>
            <Input
              id="account-name"
              data-ocid="account.name.input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Kas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type">Tipe Akun</Label>
            <Select
              value={accountType}
              onValueChange={(value) => setAccountType(value as AccountType)}
            >
              <SelectTrigger
                id="account-type"
                data-ocid="account.type.select"
                className="w-full"
              >
                <SelectValue placeholder="Pilih tipe akun" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPE_ORDER.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ACCOUNT_TYPE_LABEL[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="account.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              data-ocid="account.submit_button"
              disabled={isPending}
            >
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
