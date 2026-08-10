import { getProducts } from "@/actions/inventory.actions";
import { InventoryClient } from "@/components/inventory/inventory-client";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const products = await getProducts();
  return <InventoryClient initialProducts={products || []} />;
}
