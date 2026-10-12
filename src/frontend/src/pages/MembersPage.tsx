import type { Member } from "@/backend";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { MemberForm } from "@/components/MemberForm";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteMember, useMembers } from "@/hooks/use-members";
import { formatDate } from "@/lib/format";
import { Pencil, Plus, Search, Trash2, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function MemberDetail({
  member,
  onOpenChange,
}: {
  member: Member | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="member.detail.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Detail Anggota</DialogTitle>
          <DialogDescription>
            Informasi lengkap data anggota koperasi.
          </DialogDescription>
        </DialogHeader>
        {member && (
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Nomor Anggota</dt>
              <dd className="font-mono font-medium">{member.memberNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Nama</dt>
              <dd className="text-right font-medium">{member.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Telepon</dt>
              <dd className="font-mono">{member.phone || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all text-right">{member.email || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Alamat</dt>
              <dd className="text-right">{member.address || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Tanggal Gabung</dt>
              <dd className="font-mono">{formatDate(member.joinedAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <span
                  className={
                    member.isActive
                      ? "inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success"
                      : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {member.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </dd>
            </div>
          </dl>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="member.detail.close_button"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MembersPage() {
  const { data: members, isLoading } = useMembers();
  const deleteMember = useDeleteMember();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [detail, setDetail] = useState<Member | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members ?? [];
    return (members ?? []).filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        member.memberNumber.toLowerCase().includes(term) ||
        member.phone.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term),
    );
  }, [members, search]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditing(member);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteMember.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success("Anggota dihapus");
        setPendingDelete(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const columns: DataTableColumn<Member>[] = [
    {
      key: "memberNumber",
      header: "No. Anggota",
      render: (member) => (
        <span className="font-mono text-sm font-medium">
          {member.memberNumber}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama",
      render: (member) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{member.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {member.email || member.phone || "Tanpa kontak"}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telepon",
      render: (member) => (
        <span className="font-mono text-sm">{member.phone || "—"}</span>
      ),
    },
    {
      key: "joinedAt",
      header: "Gabung",
      render: (member) => (
        <span className="font-mono text-sm">{formatDate(member.joinedAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) => (
        <span
          className={
            member.isActive
              ? "inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success"
              : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
          }
        >
          {member.isActive ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (member) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Lihat detail ${member.name}`}
            data-ocid="member.detail_button"
            onClick={() => setDetail(member)}
          >
            <UserRound className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Ubah ${member.name}`}
            data-ocid="member.edit_button"
            onClick={() => handleEdit(member)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Hapus ${member.name}`}
            data-ocid="member.delete_button"
            onClick={() => setPendingDelete(member)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-ocid="members.page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Master Anggota</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data anggota koperasi.
          </p>
        </div>
        <Button
          type="button"
          data-ocid="member.add_button"
          onClick={handleAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Anggota
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-ocid="member.search_input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama, nomor, telepon, atau email"
          className="pl-9"
          aria-label="Cari anggota"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="members.loading_state">
          {Array.from(
            { length: 5 },
            (_, index) => `member-skeleton-${index}`,
          ).map((id) => (
            <Skeleton key={id} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="surface-panel flex flex-col items-center gap-3 px-6 py-16 text-center"
          data-ocid="members.empty_state"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </span>
          <p className="font-medium">
            {search ? "Anggota tidak ditemukan" : "Belum ada anggota"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {search
              ? "Coba kata kunci lain atau tambahkan anggota baru."
              : "Tambahkan anggota pertama untuk memulai pembukuan koperasi."}
          </p>
          {!search && (
            <Button
              type="button"
              data-ocid="members.empty_state.add_button"
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4" />
              Tambah Anggota
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(member) => member.id.toString()}
          ocidPrefix="member"
          caption="Daftar anggota koperasi"
        />
      )}

      <MemberForm open={formOpen} onOpenChange={setFormOpen} member={editing} />

      <MemberDetail member={detail} onOpenChange={() => setDetail(null)} />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent data-ocid="member.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Hapus Anggota</DialogTitle>
            <DialogDescription>
              Data anggota {pendingDelete?.name} akan dihapus permanen. Tindakan
              ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="member.delete.cancel_button"
              onClick={() => setPendingDelete(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="member.delete.confirm_button"
              disabled={deleteMember.isPending}
              onClick={handleDelete}
            >
              {deleteMember.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
