import Image from "next/image";

/**
 * A responsive photo that fills its (positioned) parent. Stored uploads are
 * already web-sized by the uploader, so only remote photos go through the
 * Next.js image optimiser.
 */
export function Photo({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const local = src.startsWith("/");
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={local} className={className} />;
}
