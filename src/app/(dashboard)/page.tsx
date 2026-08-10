import { getResources, getActiveSessions, getTodayStats } from "@/actions/timer.actions";
import { getProducts } from "@/actions/inventory.actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [resources, sessions, products, stats] = await Promise.all([
    getResources(),
    getActiveSessions(),
    getProducts(),
    getTodayStats()
  ]);

  return <DashboardClient 
    initialResources={resources || []} 
    initialSessions={sessions || []} 
    products={products || []} 
    stats={stats}
  />;
}
