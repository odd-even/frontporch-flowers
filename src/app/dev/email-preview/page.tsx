import Link from "next/link";

export const metadata = {
  title: "Email preview",
  robots: { index: false, follow: false },
};

export default function EmailPreviewPage() {
  return (
    <main className="min-h-screen bg-[#efe8dc] px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl text-charcoal mb-3">
          Booking email preview
        </h1>
        <p className="text-warm-brown/80 mb-8">
          Open each email as it will look in the inbox (pumpkin workshop sample).
        </p>
        <ul className="space-y-3">
          <li>
            <Link
              href="/dev/email-preview/rhoda"
              className="btn bg-terracotta text-cream hover:bg-terracotta-dark"
            >
              Preview email to Rhoda
            </Link>
          </li>
          <li>
            <Link
              href="/dev/email-preview/customer"
              className="btn border border-sage/30 text-sage-dark hover:bg-sage/5"
            >
              Preview receipt to customer
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
