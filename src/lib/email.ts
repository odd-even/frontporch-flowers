export const DEFAULT_CONTACT_EMAIL = "hello@frontporchflowers.ca";

export function getContactEmail(override?: string): string {
  return (
    override ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    DEFAULT_CONTACT_EMAIL
  );
}

export function buildMailtoUrl(
  email: string,
  subject: string,
  body: string
): string {
  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${email}?${params.toString()}`;
}
