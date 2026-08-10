import { getResources, getActiveSessions } from "@/actions/timer.actions";
import { getProducts } from "@/actions/inventory.actions";
import { getCustomers } from "@/actions/debts.actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [resources, sessions, products, customers] = await Promise.all([
    getResources(),
    getActiveSessions(),
    getProducts(),
    getCustomers()
  ]);

  return <DashboardClient 
    initialResources={resources || []} 
    initialSessions={sessions || []} 
    products={products || []} 
    customers={customers || []}
  />;
}
