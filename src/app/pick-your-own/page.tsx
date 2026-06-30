import Image from "next/image";
import { EventCard } from "@/components/WorkshopCard";
import { PageHeader } from "@/components/AboutTeaser";
import { getPickYourOwnEvents } from "@/lib/queries";

export const metadata = {
  title: "Pick Your Own | Front Porch Flowers",
  description:
    "Wander the garden rows and fill a bucket with backyard blooms. Pick-your-own flower days on select dates.",
};

export default async function PickYourOwnPage() {
  const events = await getPickYourOwnEvents();

  return (
    <>
      <PageHeader
        eyebrow="In the garden"
        title="Pick Your Own"
        description="On select dates throughout the season, the garden opens for pick-your-own. Wander the rows, clip your own stems, and take home a bundle of whatever's blooming — zinnias, cosmos, dahlias, and more."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            <div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-8">
                <Image
                  src="https://images.unsplash.com/photo-1592150621744-aca64f48394c?w=800&q=80"
                  alt="Colorful flower garden rows"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="bg-cream-dark/50 rounded-2xl p-8 border border-sage/10">
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-4">
                  What to expect
                </h2>
                <ul className="space-y-3 text-warm-brown/80 text-sm">
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Buckets and clippers provided
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Pay by the stem or bundle — prices posted in the garden
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Kids welcome (with supervision)
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Rain or shine — dress for the garden
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sage/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-warm-brown/80 mb-6">
            No reservation needed — just show up during the posted hours. Follow{" "}
            <a
              href="https://www.instagram.com/front_porchflowers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:text-terracotta-dark"
            >
              @front_porchflowers
            </a>{" "}
            for weather updates and last-minute announcements.
          </p>
        </div>
      </section>
    </>
  );
}
