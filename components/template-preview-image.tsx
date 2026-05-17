/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { cn } from "@/lib/cn";
import { getPhotoSource } from "@/lib/photo-url";

type TemplatePreviewImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function TemplatePreviewImage({
  src,
  alt,
  className,
  priority = false,
  sizes
}: TemplatePreviewImageProps) {
  const resolvedSrc = getPhotoSource(src, { lowRes: src.startsWith("local://") });

  if (canUseNextImage(resolvedSrc)) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        unoptimized={resolvedSrc.startsWith("/api/")}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    <img
      alt={alt}
      className={cn("absolute inset-0 h-full w-full", className)}
      loading={priority ? "eager" : "lazy"}
      src={resolvedSrc}
    />
  );
}

function canUseNextImage(src: string) {
  return src.startsWith("/") || src.startsWith("https://images.unsplash.com/");
}
