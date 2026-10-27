import BlogBlogInnerContent from "./BlogBlogInnerContent";
import BlogBlogInnerContent2 from "./BlogBlogInnerContent2";
import BlogBlogInnerContent3 from "./BlogBlogInnerContent3";
import BlogBlogInnerContent4 from "./BlogBlogInnerContent4";
import BlogBlogInnerContent5 from "./BlogBlogInnerContent5";
import BlogBlogInnerContent6 from "./BlogBlogInnerContent6";
import BlogHowFunplayManufacturesPlayground from "./BlogHowFunplayManufacturesPlayground";
import BlogImportedVsIndianEquipment from "./BlogImportedVsIndianEquipment";
import BlogMainContent from "./BlogMainContent";
import BlogMainContent2 from "./BlogMainContent2";

/** Section components for blog pages, keyed by the name stored in each page's JSON. */
export const sections = {
  BlogBlogInnerContent,
  BlogBlogInnerContent2,
  BlogBlogInnerContent3,
  BlogBlogInnerContent4,
  BlogBlogInnerContent5,
  BlogBlogInnerContent6,
  BlogHowFunplayManufacturesPlayground,
  BlogImportedVsIndianEquipment,
  BlogMainContent,
  BlogMainContent2,
};

export type SectionName = keyof typeof sections;
