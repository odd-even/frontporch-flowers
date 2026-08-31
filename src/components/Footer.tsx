import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import { getFacebookPageUrl } from "@/lib/facebook";

export function Footer() {
  const facebookUrl = getFacebookPageUrl();

  return (
    <footer className="relative bg-site-dark-band text-cream mt-auto border-t border-cream/20">
      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-10 md:pt-16 md:pb-10">
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
                Locally grown cut flowers and bouquets in Woodstock, New Brunswick.
              </p>
              <p className="text-cream/50 text-xs mt-2">Local pickup available</p>
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
                <Link href="/events" className="hover:text-cream transition-colors">
                  Events
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
                  className="inline-flex items-center gap-2 hover:text-cream transition-colors"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  Facebook — reservations
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/front_porchflowers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-cream transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
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
      </div>

      <div className="relative border-t border-cream/10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-cream/50">
          <p>
            &copy; {new Date().getFullYear()} Front Porch Flowers · Woodstock, NB
          </p>
        </div>
      </div>
    </footer>
  );
}
