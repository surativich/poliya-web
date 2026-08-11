import { ExpensesClient } from "@/components/admin/expenses-client";
import { getExpenses } from "@/actions/expenses.actions";

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  return <ExpensesClient initialExpenses={expenses} />;
}

