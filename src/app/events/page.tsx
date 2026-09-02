import { redirect } from "next/navigation";

/** Events live on the homepage for now. */
export default function EventsPage() {
  redirect("/#events");
}
