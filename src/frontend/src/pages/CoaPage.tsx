import type { Account, AccountType } from "@/backend";
import {
  ACCOUNT_TYPE_LABEL,
  ACCOUNT_TYPE_ORDER,
  AccountForm,
} from "@/components/AccountForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts, useDeleteAccount } from "@/hooks/use-accounts";
import { BookOpenText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_ACCENT: Record<AccountType, string> = {
  asset: "bg-chart-1",
  liability: "bg-chart-5",
  equity: "bg-chart-3",
  revenue: "bg-chart-4",
  expense: "bg-chart-2",
};

export function CoaPage() {
  const { data: accounts, isLoading } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditing(account);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteAccount.mutate(pendingDelete.code, {
      onSuccess: () => {
        toast.success("Akun dihapus");
        setPendingDelete(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const grouped = ACCOUNT_TYPE_ORDER.map((type) => ({
    type,
    items: (accounts ?? [])
      .filter((account) => account.accountType === type)
      .sort((a, b) => a.code.localeCompare(b.code)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6" data-ocid="coa.page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Akun COA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bagan akun dan klasifikasi akuntansi.
          </p>
        </div>
        <Button
          type="button"
          data-ocid="account.add_button"
          onClick={handleAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="coa.loading_state">
          {Array.from(
            { length: 6 },
            (_, index) => `account-skeleton-${index}`,
          ).map((id) => (
            <Skeleton key={id} className="h-14 w-full" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div
          className="surface-panel flex flex-col items-center gap-3 px-6 py-16 text-center"
          data-ocid="coa.empty_state"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BookOpenText className="h-6 w-6" />
          </span>
          <p className="font-medium">Belum ada akun</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tambahkan akun pertama untuk menyusun bagan akun koperasi.
          </p>
          <Button
            type="button"
            data-ocid="coa.empty_state.add_button"
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4" />
            Tambah Akun
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section
              key={group.type}
              className="space-y-3"
              data-ocid={`coa.section.${group.type}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${TYPE_ACCENT[group.type]}`}
                />
                <h2 className="font-display text-lg font-semibold">
                  {ACCOUNT_TYPE_LABEL[group.type]}
                </h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {group.items.length} akun
                </span>
              </div>

              <div className="surface-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Kode
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nama Akun
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((account, index) => (
                        <tr
                          key={account.code}
                          data-ocid={`coa.row.${index + 1}`}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 font-mono font-medium">
                            {account.code}
                          </td>
                          <td className="px-4 py-3">{account.name}</td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                account.isActive
                                  ? "inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success"
                                  : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                              }
                            >
                              {account.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Ubah akun ${account.name}`}
                                data-ocid="account.edit_button"
                                onClick={() => handleEdit(account)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Hapus akun ${account.name}`}
                                data-ocid="account.delete_button"
                                onClick={() => setPendingDelete(account)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        account={editing}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent data-ocid="account.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Hapus Akun</DialogTitle>
            <DialogDescription>
              Akun {pendingDelete?.code} — {pendingDelete?.name} akan dihapus.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="account.delete.cancel_button"
              onClick={() => setPendingDelete(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="account.delete.confirm_button"
              disabled={deleteAccount.isPending}
              onClick={handleDelete}
            >
              {deleteAccount.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
