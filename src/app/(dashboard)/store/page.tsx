import { getProducts } from "@/actions/inventory.actions";
import { getCustomers } from "@/actions/debts.actions";
import { StoreClient } from "@/components/store/store-client";

export const dynamic = 'force-dynamic';

export default async function StorePage() {
  const [products, customers] = await Promise.all([
    getProducts(),
    getCustomers()
  ]);

  return <StoreClient products={products || []} customers={customers || []} />;
}
