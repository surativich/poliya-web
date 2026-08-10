import { getResources } from "@/actions/timer.actions";
import { QRCodesClient } from "@/components/reports/qr-codes-client";

export const dynamic = 'force-dynamic';

export default async function QRCodesPage() {
  const resources = await getResources();
  return <QRCodesClient resources={resources || []} />;
}
