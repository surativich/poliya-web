import { getResources } from "@/actions/timer.actions";
import { SettingsClient } from "@/components/settings/settings-client";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const resources = await getResources();
  return <SettingsClient initialResources={resources || []} />;
}
