import { CashFlowChart } from "@/components/CashFlowChart";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlow30Days, useDashboardStats } from "@/hooks/useQueries";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { HandCoins, PiggyBank, Users } from "lucide-react";

const RECENT_LIMIT = 6;

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlow30Days();

  const latestBalance =
    cashFlow && cashFlow.length > 0
      ? cashFlow[cashFlow.length - 1].balance
      : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan operasional koperasi.
        </p>
      </header>

      <section
        data-ocid="dashboard.stats_section"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          ocid="dashboard.member_card"
          label="Jumlah Anggota"
          value={stats ? formatNumber(stats.memberCount) : "—"}
          icon={Users}
          hint="Anggota terdaftar"
          isLoading={statsLoading}
        />
        <StatCard
          ocid="dashboard.savings_card"
          label="Total Simpanan"
          value={stats ? formatCurrency(stats.totalSavings) : "—"}
          icon={PiggyBank}
          hint="Saldo simpanan aktif"
          isLoading={statsLoading}
        />
        <StatCard
          ocid="dashboard.loans_card"
          label="Total Pinjaman"
          value={stats ? formatCurrency(stats.totalLoans) : "—"}
          icon={HandCoins}
          hint="Pokok pinjaman berjalan"
          isLoading={statsLoading}
        />
      </section>

      <section
        data-ocid="dashboard.chart_section"
        className="grid grid-cols-1 gap-4"
      >
        <CashFlowChart points={cashFlow ?? []} isLoading={cashFlowLoading} />
      </section>

      <section
        data-ocid="dashboard.summary_section"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card className="gap-0 rounded-lg border-border py-0 shadow-subtle lg:col-span-1">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="font-display text-base font-semibold">
              Saldo Kas Terkini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {cashFlowLoading ? (
              <Skeleton className="h-9 w-40" />
            ) : (
              <p className="text-figure text-3xl font-semibold text-foreground">
                {latestBalance !== null ? formatCurrency(latestBalance) : "—"}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Posisi kas per akhir periode pencatatan.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-lg border-border py-0 shadow-subtle lg:col-span-2">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="font-display text-base font-semibold">
              Pergerakan Kas Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cashFlowLoading ? (
              <div className="flex flex-col gap-3 p-5">
                {Array.from({ length: 4 }, (_, i) => `cash-row-${i}`).map(
                  (id) => (
                    <Skeleton key={id} className="h-6 w-full" />
                  ),
                )}
              </div>
            ) : !cashFlow || cashFlow.length === 0 ? (
              <div
                data-ocid="dashboard.cashflow_list.empty_state"
                className="p-5 text-sm text-muted-foreground"
              >
                Belum ada data pergerakan kas.
              </div>
            ) : (
              <ul
                data-ocid="dashboard.cashflow_list"
                className="divide-y divide-border"
              >
                {cashFlow
                  .slice(-RECENT_LIMIT)
                  .reverse()
                  .map((point) => (
                    <li
                      key={point.date.toString()}
                      className="flex items-center justify-between gap-4 px-5 py-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(point.date)}
                      </span>
                      <span className="text-figure text-sm font-medium text-foreground">
                        {formatCurrency(point.balance)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
