import { ReservationsClient } from "@/components/reservations/reservations-client";
import { getReservations } from "@/actions/reservations.actions";
import { getResources } from "@/actions/timer.actions";

export default async function ReservationsPage() {
  const reservations = await getReservations();
  const resources = await getResources();

  return (
    <ReservationsClient 
      initialReservations={reservations} 
      resources={resources} 
    />
  );
}
