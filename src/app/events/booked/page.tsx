import { redirect } from "next/navigation";

/** Legacy confirmation URL — Square redirects should use /workshop/thanks. */
export default function EventBookedRedirect() {
  redirect("/workshop/thanks");
}
