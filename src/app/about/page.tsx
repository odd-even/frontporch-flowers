import Image from "next/image";
import { PageHeader } from "@/components/AboutTeaser";
import { getSiteSettings } from "@/lib/queries";

export const metadata = {
  title: "About | Front Porch Flowers",
  description:
    "Meet Rhoda — she grows wild and whimsical flowers in her backyard and crafts bouquets for laid-back occasions.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="About Rhoda"
        description="A backyard flower farm with a laid-back heart."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden sticky top-28">
                <Image
                  src="https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80"
                  alt="Wildflower bouquet in soft natural light"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-6 text-warm-brown/80 leading-relaxed">
              <p className="font-display text-2xl text-charcoal leading-snug">
                {settings.aboutText}
              </p>

              <p>
                Front Porch Flowers started the way the best things do — organically. Rhoda
                began growing flowers in her backyard because she loved having fresh blooms
                on the table. Friends started asking for bouquets. Then came the workshops,
                the pick-your-own days, and a little community of people who appreciate
                flowers that look like they were gathered on a walk, not arranged in a
                studio.
              </p>

              <p>
                Every bouquet is different. Rhoda might weave in dried grasses from the
                field edge, a few seed heads that caught the light just right, or a stem
                of something unexpected she found on a morning walk. The result is always
                wild, always whimsical, and always a little bit imperfect — in the best
                way.
              </p>

              <h2 className="font-display text-2xl text-charcoal pt-4">
                What we believe
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Locally grown",
                    text: "Every stem comes from Rhoda's backyard or nearby growers. No flown-in imports.",
                  },
                  {
                    title: "Wild & whimsical",
                    text: "Loose, garden-gathered arrangements that feel alive — not stiff or formal.",
                  },
                  {
                    title: "Laid-back occasions",
                    text: "Birthdays, brunch, Tuesday nights. Flowers don't need a reason.",
                  },
                  {
                    title: "Community first",
                    text: "Workshops and pick-your-own days bring people together in the garden.",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-cream-dark/50 rounded-xl p-6 border border-sage/10">
                    <h3 className="font-display text-lg text-charcoal mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <a
                  href="https://www.instagram.com/front_porchflowers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
                >
                  Say hello on Instagram
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
