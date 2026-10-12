import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogo, useUploadLogo } from "@/hooks/use-auth";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useState } from "react";

export function LogoUpload() {
  const { data: logo } = useLogo();
  const uploadLogo = useUploadLogo();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const preview = url.trim() || logo || "";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = url.trim();
    if (!next) {
      setError("Masukkan URL logo terlebih dahulu.");
      return;
    }
    setError(null);
    uploadLogo.mutate(next, {
      onSuccess: () => setUrl(""),
      onError: (mutationError) =>
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Gagal menyimpan logo.",
        ),
    });
  };

  return (
    <section className="surface-panel p-5 sm:p-6" data-ocid="logo.section">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ImageIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">Logo Koperasi</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Logo tampil di header dan bukti transaksi.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {preview ? (
            <img
              src={preview}
              alt="Pratinjau logo koperasi"
              className="h-full w-full object-cover"
              data-ocid="logo.preview"
            />
          ) : (
            <span
              className="text-muted-foreground"
              data-ocid="logo.empty_state"
            >
              <ImageIcon className="h-8 w-8" />
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="logo-url">URL Logo</Label>
            <Input
              id="logo-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://contoh.com/logo.png"
              data-ocid="logo.input"
            />
          </div>
          {error && (
            <p
              className="text-sm text-destructive"
              data-ocid="logo.error_state"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={uploadLogo.isPending}
            data-ocid="logo.upload_button"
          >
            {uploadLogo.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadLogo.isPending ? "Menyimpan…" : "Simpan Logo"}
          </Button>
        </form>
      </div>
    </section>
  );
}
