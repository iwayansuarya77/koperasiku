import { Construction } from "lucide-react";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6" data-ocid="placeholder.page">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="surface-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Construction className="h-6 w-6" />
        </span>
        <p className="font-medium">Halaman ini sedang disiapkan</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Modul {title} akan tersedia pada tahap berikutnya.
        </p>
      </div>
    </div>
  );
}
