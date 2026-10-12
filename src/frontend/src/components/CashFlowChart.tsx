import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, timestampToDate } from "@/lib/format";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  balance: {
    label: "Saldo Kas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function CashFlowChart({
  points,
  isLoading,
}: {
  points: Array<{ date: bigint; balance: number }>;
  isLoading: boolean;
}) {
  const data = points.map((point) => {
    const date = timestampToDate(point.date);
    return {
      date: date
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
          }).format(date)
        : "—",
      balance: point.balance,
    };
  });

  return (
    <Card
      data-ocid="dashboard.cashflow_card"
      className="gap-0 rounded-lg border-border py-0 shadow-subtle"
    >
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="font-display text-base font-semibold">
          Saldo Kas 30 Hari Terakhir
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <Skeleton
            className="h-[260px] w-full"
            data-ocid="dashboard.cashflow.loading_state"
          />
        ) : data.length === 0 ? (
          <div
            data-ocid="dashboard.cashflow.empty_state"
            className="flex h-[260px] flex-col items-center justify-center gap-2 text-center"
          >
            <p className="text-sm font-medium text-foreground">
              Belum ada pergerakan kas
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Catat transaksi simpanan atau pinjaman untuk melihat tren saldo
              kas harian.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[260px] w-full"
            data-ocid="dashboard.cashflow_chart"
          >
            <AreaChart
              data={data}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-balance)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-balance)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Area
                dataKey="balance"
                type="monotone"
                fill="url(#fillBalance)"
                stroke="var(--color-balance)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
