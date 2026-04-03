export function generateSlug(colors: string[]): string {
  return colors
    .map((c) => c.replace("#", "").toLowerCase())
    .join("-");
}
