import type React from "react";

/** Theme icon (bi-*, icon-feather-*, fa-*, line-icon-*). Decorative unless given an aria-label. */
export default function Icon({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <i className={className} aria-hidden={rest["aria-label"] ? undefined : true} {...rest} />;
}
