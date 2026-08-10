import { getCustomers } from "@/actions/debts.actions";
import { DebtsClient } from "@/components/debts/debts-client";

export const dynamic = 'force-dynamic';

export default async function DebtsPage() {
  const customers = await getCustomers();
  return <DebtsClient initialCustomers={customers || []} />;
}
