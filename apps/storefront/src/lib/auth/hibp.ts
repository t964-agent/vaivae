import "client-only";

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function sha1Hash(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-1", data);

  return arrayBufferToHex(digest);
}

export async function isPasswordBreached(password: string): Promise<boolean> {
  if (!password) {
    return false;
  }

  const sha1 = await sha1Hash(password);
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5).toUpperCase();
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });

  if (!response.ok) {
    throw new Error("Unable to verify password breach status.");
  }

  const text = await response.text();
  const lines = text.split("\n");

  return lines.some((line) => {
    const [hashSuffix, count] = line.trim().split(":");

    return hashSuffix === suffix && count !== "0";
  });
}
