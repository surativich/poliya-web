import { getProducts } from "@/actions/inventory.actions";
import { getInventoryMovements } from "@/actions/inventory-moves.actions";
import { InventoryClient } from "@/components/inventory/inventory-client";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const products = await getProducts();
  const movements = await getInventoryMovements();
  return <InventoryClient initialProducts={products || []} initialMovements={movements || []} />;
}
