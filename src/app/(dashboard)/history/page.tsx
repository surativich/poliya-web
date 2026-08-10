import { getCompletedSessions } from "@/actions/history.actions";
import { HistoryClient } from "@/components/history/history-client";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const sessions = await getCompletedSessions();
  return <HistoryClient initialSessions={sessions || []} />;
}
