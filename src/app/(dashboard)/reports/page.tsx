import { getReportsData, getShopStats } from "@/actions/reports.actions";
import { getTodayStats } from "@/actions/timer.actions";
import { ReportsClient } from "@/components/reports/reports-client";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [data, stats, shopStats] = await Promise.all([
    getReportsData(),
    getTodayStats(),
    getShopStats()
  ]);
  return <ReportsClient initialData={data.sessions || []} stats={stats} shopStats={shopStats} />;
}
