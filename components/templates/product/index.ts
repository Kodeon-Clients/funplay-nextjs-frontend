import ProductCrownCourt3Castle from "./ProductCrownCourt3Castle";
import ProductDescription from "./ProductDescription";
import ProductDescription2 from "./ProductDescription2";
import ProductDiagram from "./ProductDiagram";
import ProductSection from "./ProductSection";
import ProductSection2 from "./ProductSection2";
import ProductSpecifications from "./ProductSpecifications";
import ProductSpecifications2 from "./ProductSpecifications2";
import ProductSpecifications3 from "./ProductSpecifications3";
import ProductSpecifications4 from "./ProductSpecifications4";
import ProductSpecifications5 from "./ProductSpecifications5";
import ProductWheelThrillClimber from "./ProductWheelThrillClimber";

/** Section components for product pages, keyed by the name stored in each page's JSON. */
export const sections = {
  ProductCrownCourt3Castle,
  ProductDescription,
  ProductDescription2,
  ProductDiagram,
  ProductSection,
  ProductSection2,
  ProductSpecifications,
  ProductSpecifications2,
  ProductSpecifications3,
  ProductSpecifications4,
  ProductSpecifications5,
  ProductWheelThrillClimber,
};

export type SectionName = keyof typeof sections;
