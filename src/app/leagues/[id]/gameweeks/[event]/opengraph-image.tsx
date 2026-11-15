import { shareImage, shareImageSize } from "../../share-image";

export const alt = "A mini-league's moves on FPL Social";
export const size = shareImageSize;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; event: string }>;
}) {
  const { id, event } = await params;
  return shareImage(id, event);
}
