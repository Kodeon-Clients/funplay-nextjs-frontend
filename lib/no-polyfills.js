// Replaces Next.js's built-in polyfill module (next/dist/build/polyfills/polyfill-module) in the browser
// bundle. Those polyfills (Array.prototype.at, Object.hasOwn, String.prototype.trimStart, ...) are for
// browsers older than the ones this site supports (package.json browserslist: Chrome/Edge/Firefox 111+,
// Safari 16.4+), and PageSpeed reports them as "legacy JavaScript".
export {};
