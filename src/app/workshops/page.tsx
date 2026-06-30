import { WorkshopsSection } from "@/components/WorkshopCard";
import { PageHeader } from "@/components/AboutTeaser";
import { getWorkshops } from "@/lib/queries";

export const metadata = {
  title: "Workshops | Front Porch Flowers",
  description:
    "Seasonal flower workshops including hydrangea wreath making and wild bouquet arranging. Gather with friends in the garden.",
};

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <>
      <PageHeader
        eyebrow="Gather & create"
        title="Workshops"
        description="Occasional hands-on workshops in the garden — from hydrangea wreath making to wild bouquet arranging. All materials included. Just bring your creativity and a willingness to get your hands a little dirty."
      />
      <WorkshopsSection workshops={workshops} showAll />

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl text-charcoal mb-4">
            How to sign up
          </h2>
          <p className="text-warm-brown/80 mb-6">
            Workshop spots are limited. DM Rhoda on Instagram to reserve your spot — she&apos;ll
            send you all the details including location and what to bring.
          </p>
          <a
            href="https://www.instagram.com/front_porchflowers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
          >
            Reserve on Instagram
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
