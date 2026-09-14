import Image from "next/image";

export function MediaImage({
  media,
  src,
  alt = "",
  sizes,
  className = "",
  imageClassName = "object-cover",
  loading = "lazy",
  quality = 75,
  imageRef,
  style,
}) {
  const url = src ?? media?.url;
  if (!url) return null;

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        ref={imageRef}
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        loading={loading}
        draggable={false}
        className={imageClassName}
        style={style}
      />
    </span>
  );
}
