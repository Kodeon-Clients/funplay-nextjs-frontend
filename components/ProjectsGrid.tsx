import fs from "node:fs";
import path from "node:path";
import { imageInfo, srcSetFor } from "@/lib/render";

type Project = { title: string; location: string; image: string; link: string; map: string };

/** Project cards for /Projects.html (the original built these in the browser from a script). */
export default function ProjectsGrid({ className }: { className?: string }) {
  const projects: Project[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "projects-grid.json"), "utf8"));
  return (
    <div className={className || "row"} id="projects-container">
      {projects.map((p) => {
        const info = imageInfo(p.image);
        return (
          <div className="col-12 col-lg-4 md-mb-15px pt-30px" key={p.link}>
            <div className="swiper-slide" style={{ border: "1px solid #e6e6e6", borderRadius: 6 }}>
              <div className="services-box-style-01 hover-box last-paragraph-no-margin">
                <div className="position-relative box-image" style={{ borderRadius: "6px 6px 0 0" }}>
                  <img className="w-100" src={p.image} srcSet={srcSetFor(p.image)} sizes="(max-width: 991px) 100vw, 33vw" width={info?.w} height={info?.h} alt={`${p.title.charAt(0) + p.title.slice(1).toLowerCase()} playground project, ${p.location.toLowerCase()}`} loading="lazy" decoding="async" style={{ borderRadius: "6px 6px 0 0", height: 348, objectFit: "cover" }} />
                  <div className="box-overlay bg-dark-gray"></div>
                  <a href={p.link} className="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 w-110px h-110px rounded-circle bg-white box-shadow-extra-large text-uppercase fs-16 lh-24 fw-700 text-red ps-15px pe-15px text-center" aria-label={`View project: ${p.title}`}>View Project</a>
                </div>
                <div className="pt-15px pb-15px text-center border-radius-6px">
                  <div className="mb-5">
                    <span className="d-inline-block text-dark-gray fs-19 fw-600 lh-1">{p.title}</span>
                    <span className="d-block fs-12 lh-1 fw-600 mb-5px text-base-color">{p.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
