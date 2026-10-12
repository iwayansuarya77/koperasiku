import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LogoUpload } from "@/components/LogoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useBackupDatabase,
  useClearTransactionData,
  useCloseMonth,
  useCloseYear,
} from "@/hooks/use-auth";
import {
  CalendarCheck,
  CalendarX,
  Database,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState } from "react";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function currentYear() {
  return String(new Date().getFullYear());
}

export function SettingsPage() {
  const [month, setMonth] = useState(currentPeriod);
  const [year, setYear] = useState(currentYear);
  const [monthMessage, setMonthMessage] = useState<string | null>(null);
  const [yearMessage, setYearMessage] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const closeMonth = useCloseMonth();
  const closeYear = useCloseYear();
  const backup = useBackupDatabase();
  const clearData = useClearTransactionData();

  const handleCloseMonth = () => {
    setMonthMessage(null);
    closeMonth.mutate(month, {
      onSuccess: () => setMonthMessage(`Periode ${month} berhasil ditutup.`),
      onError: (error) =>
        setMonthMessage(
          error instanceof Error ? error.message : "Gagal menutup bulan.",
        ),
    });
  };

  const handleCloseYear = () => {
    setYearMessage(null);
    closeYear.mutate(year, {
      onSuccess: () => setYearMessage(`Tahun ${year} berhasil ditutup.`),
      onError: (error) =>
        setYearMessage(
          error instanceof Error ? error.message : "Gagal menutup tahun.",
        ),
    });
  };

  const handleBackup = () => {
    setBackupMessage(null);
    backup.mutate(undefined, {
      onSuccess: (text) => {
        const blob = new Blob([text], { type: "application/json" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `backup-koperasi-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        setBackupMessage("Backup berhasil diunduh.");
      },
      onError: (error) =>
        setBackupMessage(
          error instanceof Error ? error.message : "Gagal membuat backup.",
        ),
    });
  };

  const handleClear = () => {
    setClearError(null);
    clearData.mutate("HAPUS", {
      onSuccess: () => {
        setClearOpen(false);
      },
      onError: (error) =>
        setClearError(
          error instanceof Error ? error.message : "Gagal membersihkan data.",
        ),
    });
  };

  return (
    <div className="space-y-6" data-ocid="settings.page">
      <div>
        <h1 className="font-display text-2xl font-bold">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola identitas koperasi, tutup periode, dan pemeliharaan database.
        </p>
      </div>

      <LogoUpload />

      <section className="surface-panel p-5 sm:p-6" data-ocid="period.section">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold">
              Tutup Periode
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kunci pembukuan bulan atau tahun yang telah selesai.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="close-month">Periode Bulan</Label>
              <Input
                id="close-month"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                data-ocid="period.month_input"
              />
            </div>
            <Button
              type="button"
              onClick={handleCloseMonth}
              disabled={closeMonth.isPending || !month}
              data-ocid="period.close_month_button"
            >
              {closeMonth.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarCheck className="h-4 w-4" />
              )}
              Tutup Bulan
            </Button>
            {monthMessage && (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="period.month_message"
              >
                {monthMessage}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="close-year">Tahun Buku</Label>
              <Input
                id="close-year"
                inputMode="numeric"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                data-ocid="period.year_input"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseYear}
              disabled={closeYear.isPending || !year}
              data-ocid="period.close_year_button"
            >
              {closeYear.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarX className="h-4 w-4" />
              )}
              Tutup Tahun
            </Button>
            {yearMessage && (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="period.year_message"
              >
                {yearMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      <section
        className="surface-panel p-5 sm:p-6"
        data-ocid="maintenance.section"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold">
              Pemeliharaan Database
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Unduh cadangan data atau bersihkan data transaksi.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackup}
            disabled={backup.isPending}
            data-ocid="maintenance.backup_button"
          >
            {backup.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Backup Database
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setClearError(null);
              setClearOpen(true);
            }}
            data-ocid="maintenance.open_clear_button"
          >
            <Trash2 className="h-4 w-4" />
            Bersihkan Data
          </Button>
        </div>

        {backupMessage && (
          <p
            className="mt-3 text-sm text-muted-foreground"
            data-ocid="maintenance.backup_message"
          >
            {backupMessage}
          </p>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Membersihkan data transaksi tidak dapat dibatalkan. Pastikan backup
          terbaru sudah diunduh.
        </p>
      </section>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Bersihkan Data Transaksi"
        description="Seluruh jurnal dan transaksi akan dihapus permanen. Data anggota dan simpanan tetap tersimpan."
        confirmLabel="Bersihkan Data"
        confirmWord="HAPUS"
        onConfirm={handleClear}
        isPending={clearData.isPending}
        errorMessage={clearError ?? undefined}
      />
    </div>
  );
}
