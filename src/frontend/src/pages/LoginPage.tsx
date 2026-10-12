import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallerRole, useLogin } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const navigate = useNavigate();
  const { data: userRole, isLoading } = useCallerRole();

  useEffect(() => {
    if (!isLoading && userRole) {
      void navigate({ to: "/" });
    }
  }, [isLoading, userRole, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    login.mutate(
      { username, password },
      {
        onSuccess: () => {
          void navigate({ to: "/" });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Login gagal");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevated">
            <Landmark className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Koperasi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk untuk mengelola operasional koperasi
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="surface-panel space-y-5 p-6 sm:p-8"
          data-ocid="login.page"
        >
          <div className="space-y-2">
            <Label htmlFor="username">Nama pengguna</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              data-ocid="login.input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              data-ocid="login.password_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              data-ocid="login.error_state"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            data-ocid="login.submit_button"
            disabled={login.isPending}
            className="w-full"
          >
            {login.isPending ? "Memproses…" : "Masuk"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Akun admin bawaan:{" "}
            <span className="font-mono">admin / admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
