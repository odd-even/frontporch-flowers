import { Hero } from "@/components/Hero";
import { FinishRequestPicker } from "@/components/BouquetInquiry";
import { AboutTeaser, EventsTeaser } from "@/components/AboutTeaser";
import { PaymentOptions } from "@/components/PaymentOptions";
import { FacebookFeed } from "@/components/FacebookFeed";
import { getContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/queries";

/** Keep Facebook posts fresh; homepage is server-rendered with env-backed Graph API. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();

  const etransferEmail =
    process.env.NEXT_PUBLIC_ETRANSFER_EMAIL || "rhoda@frontporchflowers.ca";
  const phone =
    process.env.NEXT_PUBLIC_CONTACT_PHONE || settings.phone || "+15064253850";

  return (
    <>
      <Hero tagline={settings.tagline} />
      <section id="bouquets" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FinishRequestPicker contactEmail={getContactEmail(settings.email)} />
        </div>
      </section>
      <PaymentOptions etransferEmail={etransferEmail} phone={phone} />
      <AboutTeaser aboutText={settings.aboutText} />
      <EventsTeaser />
      <FacebookFeed pageUrl={settings.facebookPageUrl} />
    </>
  );
}
