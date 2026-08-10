import { getReportsData } from "@/actions/reports.actions";
import { ReportsClient } from "@/components/reports/reports-client";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const data = await getReportsData();
  return <ReportsClient initialData={data.sessions || []} />;
}
