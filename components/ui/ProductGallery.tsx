import { imageInfo, srcSetFor } from "./Img";
import { altFor, srcFor } from "@/lib/image-seo";

type Colour = { name?: string; swatch?: string; images: string[]; alts?: string[] };

/** Product photo carousel: the first colour's images are rendered on the server so they are crawlable. */
export default function ProductGallery({ className, id, colours, name }: { className?: string; id?: string; role?: string; colours: Colour[]; name: string }) {
  const c = colours?.[0];
  return (
    <div className={className} id={id}>
      {c?.images.map((orig, i) => {
        const src = srcFor(orig);
        const info = imageInfo(src);
        return (
          <div className={i === 0 ? "carousel-item active" : "carousel-item"} key={orig + i}>
            <img
              src={src}
              srcSet={srcSetFor(src)}
              sizes={info ? "(max-width: 1200px) 100vw, 1200px" : undefined}
              width={info?.w}
              height={info?.h}
              className="d-block w-100"
              alt={altFor(orig, c.alts?.[i] || name) || ""}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          </div>
        );
      })}
    </div>
  );
}
