import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { deslugify } from "@/lib/slug";

export const alt = "A five-book reading path on Fathom";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  return renderOgImage(deslugify(topic));
}
