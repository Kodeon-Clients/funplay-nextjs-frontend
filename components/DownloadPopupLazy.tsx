"use client";

import dynamic from "next/dynamic";

/** The catalogue popup is only used on the home page and shows after load, so its code is fetched on demand. */
const DownloadPopup = dynamic(() => import("@/components/DownloadPopup"), { ssr: false });

export default DownloadPopup;
