import type { SavingsType } from "@/backend";
import { CsvImportDialog } from "@/components/CsvImportDialog";
import { SavingsBook } from "@/components/SavingsBook";
import { SavingsTransactionForm } from "@/components/SavingsTransactionForm";
import { SavingsTypeForm } from "@/components/SavingsTypeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAccounts,
  useMembers,
  usePostMonthlySavingsInterest,
  useSavingsTypes,
} from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { CalendarClock, Pencil, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SavingsPage() {
  const { data: members = [] } = useMembers();
  const { data: savingsTypes = [], isLoading: typesLoading } =
    useSavingsTypes();
  const { data: accounts = [] } = useAccounts();
  const postInterest = usePostMonthlySavingsInterest();

  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<SavingsType | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const handleAddType = () => {
    setEditingType(null);
    setTypeFormOpen(true);
  };

  const handleEditType = (type: SavingsType) => {
    setEditingType(type);
    setTypeFormOpen(true);
  };

  const handlePostInterest = () => {
    postInterest.mutate(undefined, {
      onSuccess: (count) =>
        toast.success(`Bunga bulanan diposting untuk ${count} saldo`),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="space-y-6" data-ocid="savings.page">
      <Toaster position="top-right" richColors />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Simpanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola jenis simpanan, transaksi, dan buku simpanan anggota.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="savings.import_button"
            onClick={() => setCsvOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Import Saldo Awal
          </Button>
          <Button
            type="button"
            variant="outline"
            data-ocid="savings.post_interest_button"
            onClick={handlePostInterest}
            disabled={postInterest.isPending}
          >
            <CalendarClock className="h-4 w-4" />
            {postInterest.isPending ? "Memproses…" : "Posting Bunga Bulanan"}
          </Button>
          <Button
            type="button"
            data-ocid="savings.add_type_button"
            onClick={handleAddType}
          >
            <Plus className="h-4 w-4" />
            Jenis Simpanan
          </Button>
        </div>
      </header>

      <section
        className="surface-panel overflow-hidden"
        data-ocid="savings_types.section"
      >
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-lg font-semibold">Jenis Simpanan</h2>
          <p className="text-sm text-muted-foreground">
            Suku bunga dan akun kas per jenis simpanan.
          </p>
        </div>

        {typesLoading ? (
          <p
            className="px-5 py-10 text-center text-sm text-muted-foreground"
            data-ocid="savings_types.loading_state"
          >
            Memuat jenis simpanan…
          </p>
        ) : savingsTypes.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 px-6 py-14 text-center"
            data-ocid="savings_types.empty_state"
          >
            <p className="font-medium">Belum ada jenis simpanan</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tambahkan jenis simpanan untuk mulai mencatat transaksi.
            </p>
            <Button
              type="button"
              data-ocid="savings_types.empty_add_button"
              onClick={handleAddType}
            >
              <Plus className="h-4 w-4" />
              Tambah Jenis
            </Button>
          </div>
        ) : (
          <Table data-ocid="savings_types.table">
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Bunga (%/thn)</TableHead>
                <TableHead>Akun Kas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savingsTypes.map((type) => (
                <TableRow
                  key={type.id.toString()}
                  data-ocid="savings_types.row"
                >
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-right text-figure">
                    {type.interestRate}%
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {type.cashAccountCode}
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-ocid="savings_types.edit_button"
                      onClick={() => handleEditType(type)}
                    >
                      <Pencil className="h-4 w-4" />
                      Ubah
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <SavingsTransactionForm
        members={members}
        savingsTypes={savingsTypes}
        accounts={accounts}
      />

      <SavingsBook
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
      />

      <SavingsTypeForm
        open={typeFormOpen}
        onOpenChange={setTypeFormOpen}
        accounts={accounts}
        editing={editingType}
      />

      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        members={members}
        savingsTypes={savingsTypes}
      />
    </div>
  );
}
