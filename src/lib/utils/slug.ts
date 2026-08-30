const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Converts arbitrary text into a URL-safe slug fragment (not guaranteed unique). */
export function slugify(input: string, maxLength: number = 60): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

export function isValidSlug(value: string, minLength: number = 3, maxLength: number = 60): boolean {
  return value.length >= minLength && value.length <= maxLength && SLUG_PATTERN.test(value);
}

/** Appends a short random suffix so an auto-generated slug (e.g. from a product name) is effectively unique without a DB round-trip on every attempt. */
export function withUniqueSuffix(slug: string): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  return `${slug}-${suffix}`;
}
