import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import { getFacebookPageUrl } from "@/lib/facebook";
import { HOME_SECTIONS } from "@/lib/home-sections";

export function Footer() {
  const facebookUrl = getFacebookPageUrl();

  return (
    <footer className="relative bg-site-dark-band text-cream mt-auto border-t border-cream/20">
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-charcoal/25 via-charcoal/38 to-charcoal/48"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-10 md:pt-16 md:pb-10">
        <div className="grid md:grid-cols-[2fr_auto] gap-8 md:gap-6 items-stretch">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 items-center sm:items-center text-center sm:text-left">
            <Link href="/" className="shrink-0 group">
              <Image
                src="/logo.svg"
                alt="Front Porch Flowers"
                width={256}
                height={256}
                className="w-56 h-56 sm:w-52 sm:h-52 md:w-56 md:h-56 transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="flex-1 max-w-[17rem] sm:max-w-xs md:max-w-none">
              <p className="text-cream/88 text-sm leading-relaxed text-balance">
                Locally grown cut flowers and bouquets serving Woodstock, New Brunswick.
              </p>
              <p className="text-cream/72 text-xs mt-2">Local pickup available</p>
            </div>
          </div>

          <div className="flex flex-col sm:grid sm:h-full sm:grid-cols-[1fr_auto_1fr] sm:items-stretch rounded-2xl border border-cream/20 py-5 gap-5 sm:gap-0">
            <div className="flex flex-col px-4 sm:px-5">
              <h4 className="font-medium text-sm uppercase tracking-widest text-cream/90 mb-3">
                Explore
              </h4>
              <ul className="space-y-2 text-sm text-cream/85">
                {HOME_SECTIONS.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`/#${section.id}`}
                      className="hover:text-cream transition-colors"
                    >
                      {section.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px sm:h-auto sm:w-px bg-cream/20 mx-4 sm:mx-0" aria-hidden="true" />

            <div className="flex flex-col px-4 sm:px-5">
              <h4 className="font-medium text-sm uppercase tracking-widest text-cream/90 mb-3">
                Connect
              </h4>
              <ul className="space-y-2 text-sm text-cream/85">
                <li>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-cream transition-colors"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    Facebook
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
      </div>

      <div className="relative z-10 border-t border-cream/10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-cream/68 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} Front Porch Flowers · Woodstock, NB
          </p>
          <p>
            Site crafted by{" "}
            <a
              href="https://darrowdesign.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/85 hover:text-cream transition-colors"
            >
              Darrow Design
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
