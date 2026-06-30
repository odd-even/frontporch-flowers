export const DEFAULT_FACEBOOK_PAGE_URL = "https://www.facebook.com/FrontPorchFlowers";

export function getFacebookPageUrl(override?: string): string {
  return (
    override ||
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ||
    DEFAULT_FACEBOOK_PAGE_URL
  );
}
