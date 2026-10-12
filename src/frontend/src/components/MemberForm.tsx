import type { Member } from "@/backend";
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
import { useCreateMember, useUpdateMember } from "@/hooks/use-members";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type MemberDraft = {
  memberNumber: string;
  name: string;
  address: string;
  phone: string;
  email: string;
};

const EMPTY_DRAFT: MemberDraft = {
  memberNumber: "",
  name: "",
  address: "",
  phone: "",
  email: "",
};

export function MemberForm({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}) {
  const [draft, setDraft] = useState<MemberDraft>(EMPTY_DRAFT);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEditing = member !== null;
  const isPending = createMember.isPending || updateMember.isPending;

  useEffect(() => {
    if (!open) return;
    if (member) {
      setDraft({
        memberNumber: member.memberNumber,
        name: member.name,
        address: member.address,
        phone: member.phone,
        email: member.email,
      });
    } else {
      setDraft(EMPTY_DRAFT);
    }
  }, [open, member]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.memberNumber.trim() || !draft.name.trim()) {
      toast.error("Nomor anggota dan nama wajib diisi");
      return;
    }
    if (member) {
      updateMember.mutate(
        { ...member, ...draft },
        {
          onSuccess: () => {
            toast.success("Data anggota diperbarui");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    } else {
      createMember.mutate(draft, {
        onSuccess: () => {
          toast.success("Anggota baru ditambahkan");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        data-ocid="member.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Ubah Anggota" : "Tambah Anggota"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi anggota koperasi."
              : "Lengkapi data anggota koperasi baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-number">Nomor Anggota</Label>
              <Input
                id="member-number"
                data-ocid="member.member_number.input"
                value={draft.memberNumber}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    memberNumber: event.target.value,
                  }))
                }
                placeholder="A-0001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-name">Nama Lengkap</Label>
              <Input
                id="member-name"
                data-ocid="member.name.input"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nama anggota"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-phone">Telepon</Label>
              <Input
                id="member-phone"
                data-ocid="member.phone.input"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="08xx xxxx xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                data-ocid="member.email.input"
                value={draft.email}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="nama@contoh.id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-address">Alamat</Label>
            <Input
              id="member-address"
              data-ocid="member.address.input"
              value={draft.address}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              placeholder="Alamat lengkap"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="member.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              data-ocid="member.submit_button"
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
