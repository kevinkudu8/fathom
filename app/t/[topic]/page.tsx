import type { Metadata } from "next";
import { PathExperience } from "@/components/PathExperience";
import { deslugify } from "@/lib/slug";

// The topic lives in the URL (/t/the-french-revolution) so every result is
// shareable. Hitting this URL directly runs the search animation, then resolves.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const label = deslugify(topic);
  const title = `Fathom — five books on ${label}`;
  const description = `A curated five-book reading path on ${label}.`;
  // openGraph/twitter images are supplied automatically by opengraph-image.tsx
  // and twitter-image.tsx in this route.
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  // key by slug so navigating between topics remounts the experience fresh.
  return <PathExperience key={topic} topic={deslugify(topic)} />;
}
