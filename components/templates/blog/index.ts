import BlogPost from "./BlogPost";

/** Section components for blog pages, keyed by the name stored in each page's JSON. */
export const sections = {
  BlogPost,
};

export type SectionName = keyof typeof sections;
