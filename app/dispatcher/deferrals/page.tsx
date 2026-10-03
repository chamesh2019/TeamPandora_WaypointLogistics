import { redirect } from "next/navigation";

export default function DispatcherDeferralsRedirect() {
  redirect("/dispatcher/allocation");
}
