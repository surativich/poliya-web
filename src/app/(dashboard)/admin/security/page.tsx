import { SecurityClient } from "@/components/admin/security-client";
import { getSystemSettings } from "@/actions/security.actions";

export default async function SecurityPage() {
  const settings = await getSystemSettings();
  
  return <SecurityClient initialSettings={settings} />;
}
