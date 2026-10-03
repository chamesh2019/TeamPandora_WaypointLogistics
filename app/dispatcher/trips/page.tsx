import { redirect } from "next/navigation";

export default function DispatcherTripsRedirect() {
  redirect("/dispatcher/trip-planning");
}
