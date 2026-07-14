import Image from "next/image";
import Link from "next/link";
import { getFacebookPageUrl } from "@/lib/facebook";

export function Footer() {
  const facebookUrl = getFacebookPageUrl();

  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="grid md:grid-cols-3 gap-10 md:gap-12 items-start">
          <div className="flex gap-5 items-start">
            <Link href="/" className="shrink-0 group">
              <Image
                src="/logo.svg"
                alt="Front Porch Flowers"
                width={192}
                height={192}
                className="w-36 h-36 sm:w-44 sm:h-44 transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="min-w-0 pt-1">
              <p className="text-cream/70 text-sm leading-relaxed">
                Wild & whimsical bouquets grown with love in Rhoda&apos;s backyard.
                Local grasses, seed heads, and whatever&apos;s blooming.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm uppercase tracking-widest text-sage-light mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <Link href="/gallery" className="hover:text-cream transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-cream transition-colors">
                  Workshops
                </Link>
              </li>
              <li>
                <Link href="/pick-your-own" className="hover:text-cream transition-colors">
                  Pick Your Own
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm uppercase tracking-widest text-sage-light mb-4">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors"
                >
                  Facebook — reservations
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/front_porchflowers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors"
                >
                  @front_porchflowers
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@frontporchflowers.ca"
                  className="hover:text-cream transition-colors"
                >
                  hello@frontporchflowers.ca
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-cream/50">
          <p>&copy; {new Date().getFullYear()} Front Porch Flowers. All rights reserved.</p>
          <p className="font-accent text-xl text-cream/50">
            grown in the backyard, arranged with whimsy
          </p>
        </div>
      </div>
    </footer>
  );
}
