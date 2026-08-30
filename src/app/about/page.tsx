import Image from "next/image";
import { PageHeader } from "@/components/AboutTeaser";
import { FacebookIcon } from "@/components/SocialIcons";
import { getSiteSettings } from "@/lib/queries";
import { getAboutPhoto } from "@/lib/photos.server";
import { getFacebookPageUrl } from "@/lib/facebook";

export const metadata = {
  title: "About",
  description:
    "Meet Rhoda of Front Porch Flowers in Woodstock, NB — she grows cut flowers in her backyard and crafts seasonal bouquets for local pickup.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const aboutPhoto = getAboutPhoto();
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);

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
                  src={aboutPhoto.src}
                  alt={aboutPhoto.alt}
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
                began growing flowers in her Woodstock, New Brunswick backyard because she
                loved having fresh blooms on the table. Friends started asking for
                bouquets. Then came the workshops, the pick-your-own days, and a little
                community of people who appreciate flowers that look like they were
                gathered on a walk, not arranged in a studio.
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
                    text: "Every stem comes from Rhoda's Woodstock backyard or nearby growers. No flown-in imports.",
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
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn gap-2 bg-terracotta text-cream hover:bg-terracotta-dark"
                >
                  <FacebookIcon className="w-5 h-5" />
                  Reserve on Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
