export function getSafeAuthRedirect(
  value: string | string[] | undefined,
  fallback = "/account",
): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const nextPath = rawValue?.trim();

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  if (nextPath.startsWith("/login") || nextPath.startsWith("/register")) {
    return fallback;
  }

  return nextPath;
}
