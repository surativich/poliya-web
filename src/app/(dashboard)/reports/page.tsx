import { getReportsData } from "@/actions/reports.actions";
import { getTodayStats } from "@/actions/timer.actions";
import { ReportsClient } from "@/components/reports/reports-client";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [data, stats] = await Promise.all([
    getReportsData(),
    getTodayStats()
  ]);
  return <ReportsClient initialData={data.sessions || []} stats={stats} />;
}
