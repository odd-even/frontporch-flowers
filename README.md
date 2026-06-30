# Front Porch Flowers

A beautiful website for [Front Porch Flowers](https://www.instagram.com/front_porchflowers) — Rhoda's backyard flower shop featuring wild & whimsical bouquets, seasonal workshops, and pick-your-own flower days.

Built with **Next.js**, **Sanity CMS**, **Tailwind CSS**, and deployed on **Vercel**.

## Features

- Wild, whimsical design with earthy tones and elegant typography
- Homepage with hero, bouquets, about teaser, pick-your-own dates, and workshops
- Dedicated pages for Bouquets, Workshops, Pick Your Own, and About
- Instagram integration linking to [@front_porchflowers](https://www.instagram.com/front_porchflowers)
- Sanity CMS for Rhoda to manage content (bouquets, workshops, events, site settings)
- Graceful fallback content when Sanity isn't configured yet
- Mobile-responsive with sticky header and smooth navigation

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

The site works out of the box with sample content. Connect Sanity to manage real content.

## Sanity CMS Setup

1. Create a free project at [sanity.io/manage](https://www.sanity.io/manage)
2. Copy `.env.example` to `.env.local` and add your project ID:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

3. Install Sanity Studio dependencies and run the CMS:

```bash
cd sanity && npm install && npm run dev
```

4. Open [http://localhost:3333](http://localhost:3333) to manage content

### Content Types

| Type | Description |
|------|-------------|
| **Bouquet** | Seasonal bouquet offerings with photos and pricing |
| **Workshop** | Events like hydrangea wreath workshops |
| **Pick Your Own Event** | Scheduled pick-your-own flower days |
| **Site Settings** | Tagline, about text, contact info |

Upload Rhoda's flower photos from Instagram into Sanity to replace the placeholder images.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables from `.env.example`
4. Deploy

Vercel will auto-detect Next.js and configure the build.

```bash
# Or deploy from CLI
npx vercel
```

## Project Structure

```
├── public/              # Static assets (logo)
├── sanity/              # Sanity CMS studio & schemas
├── src/
│   ├── app/             # Next.js pages (App Router)
│   ├── components/      # React components
│   └── lib/             # Sanity client, queries, types
├── _assets/             # Original design assets
└── package.json
```

## Tech Stack

- [Next.js 15](https://nextjs.org/) — React framework
- [Sanity](https://www.sanity.io/) — Headless CMS
- [Tailwind CSS 4](https://tailwindcss.com/) — Styling
- [Vercel](https://vercel.com/) — Hosting
- Google Fonts — Cormorant Garamond & Jost

## License

Private — Front Porch Flowers
