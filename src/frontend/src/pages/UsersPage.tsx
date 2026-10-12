import { Role } from "@/backend";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAssignUserRole,
  useCreateUserAccount,
  useUserAccounts,
} from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";
import { UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";

const ROLES: Role[] = [Role.admin, Role.kasir, Role.supervisor];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  kasir: "Kasir",
  supervisor: "Supervisor",
};

export function UsersPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.kasir);
  const [error, setError] = useState("");

  const { data: accounts, isLoading } = useUserAccounts();
  const createAccount = useCreateUserAccount();
  const assignRole = useAssignUserRole();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    createAccount.mutate(
      { username, password, role },
      {
        onSuccess: () => {
          setUsername("");
          setPassword("");
          setRole(Role.kasir);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Gagal membuat akun");
        },
      },
    );
  };

  return (
    <div className="space-y-6" data-ocid="users.page">
      <div>
        <h1 className="font-display text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola akun dan tetapkan peran akses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-panel space-y-4 p-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Tambah akun</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="new-username">Nama pengguna</Label>
            <Input
              id="new-username"
              data-ocid="users.username_input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Kata sandi</Label>
            <Input
              id="new-password"
              type="password"
              data-ocid="users.password_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role">Peran</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="new-role" data-ocid="users.role_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            data-ocid="users.error_state"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          data-ocid="users.add_button"
          disabled={createAccount.isPending}
        >
          {createAccount.isPending ? "Menyimpan…" : "Tambah akun"}
        </Button>
      </form>

      <div className="surface-panel overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Daftar akun</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6" data-ocid="users.loading_state">
            {Array.from({ length: 3 }, (_, i) => `user-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="h-10 animate-pulse rounded-md bg-muted"
                />
              ),
            )}
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 px-6 py-12 text-center"
            data-ocid="users.empty_state"
          >
            <p className="font-medium">Belum ada akun pengguna</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan akun pertama melalui formulir di atas.
            </p>
          </div>
        ) : (
          <Table data-ocid="users.table">
            <TableHeader>
              <TableRow>
                <TableHead>Nama pengguna</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account, index) => (
                <TableRow
                  key={account.id.toString()}
                  data-ocid={`users.row.${index + 1}`}
                >
                  <TableCell className="font-medium">
                    {account.username}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={account.role}
                      onValueChange={(v) =>
                        assignRole.mutate({
                          userId: account.id,
                          role: v as Role,
                        })
                      }
                    >
                      <SelectTrigger
                        className="w-36"
                        data-ocid={`users.role_select.${index + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(account.createdAt)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {account.isActive ? "Aktif" : "Nonaktif"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
