import type { ComponentType } from "react";
import CityFacts from "./blocks/CityFacts";
import Faq from "./blocks/Faq";
import RichText from "./blocks/RichText";
import LocalLinks from "./blocks/LocalLinks";

/** Registry of content blocks that can be placed in a page body with <fp-block data-name="...">. */
export const blockComponents: Record<string, ComponentType<any>> = {
  "city-facts": CityFacts,
  faq: Faq,
  "rich-text": RichText,
  "local-links": LocalLinks,
};
