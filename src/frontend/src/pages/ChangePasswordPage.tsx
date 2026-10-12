import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangeOwnPassword } from "@/hooks/use-auth";
import { KeyRound } from "lucide-react";
import { type FormEvent, useState } from "react";

export function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const changePassword = useChangeOwnPassword();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setMessage("Kata sandi berhasil diperbarui");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Gagal memperbarui");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl" data-ocid="change_password.page">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Ganti Kata Sandi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perbarui kata sandi akun Anda secara berkala.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-panel space-y-5 p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Masukkan kata sandi lama dan kata sandi baru Anda.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="oldPassword">Kata sandi lama</Label>
          <Input
            id="oldPassword"
            type="password"
            autoComplete="current-password"
            data-ocid="change_password.old_input"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Kata sandi baru</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            data-ocid="change_password.new_input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi kata sandi baru</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            data-ocid="change_password.confirm_input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            data-ocid="change_password.error_state"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            className="rounded-md bg-success/10 px-3 py-2 text-sm text-success"
            data-ocid="change_password.success_state"
          >
            {message}
          </p>
        )}

        <Button
          type="submit"
          data-ocid="change_password.submit_button"
          disabled={changePassword.isPending}
        >
          {changePassword.isPending ? "Menyimpan…" : "Simpan kata sandi"}
        </Button>
      </form>
    </div>
  );
}
