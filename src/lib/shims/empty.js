// Used as a webpack alias target to replace Next's built-in polyfill bundle.
// The browserslist targets pinned in package.json already ship every
// referenced method natively, so the extra ~11 KB polyfill module is dead
// weight.
export {};
