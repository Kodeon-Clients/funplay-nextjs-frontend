"use client";

import { useEffect } from "react";
import { initBehaviors } from "@/lib/behaviors";

/** Attaches the theme's interactive behaviours (menu, popups, sliders, forms) after hydration. */
export default function Behaviors() {
  useEffect(() => initBehaviors(), []);
  return null;
}
