const MALL_ORIGIN = "https://www.mall.hr";

// Parse instead of checking the prefix: "https://www.mall.hr.evil.example" also starts with the origin
export function toMallUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, MALL_ORIGIN);
    return url.origin === MALL_ORIGIN && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
