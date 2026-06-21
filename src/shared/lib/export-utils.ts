export function sanitizeFileName(value: string) {
  return (
    value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/^\.+/, "")
      .slice(0, 80) || "maketar-export"
  );
}

export function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function withAlpha(color: string, alpha: number) {
  if (!color.startsWith("#")) return color;
  const hex = color.slice(1);
  const normalized = hex.length === 3
    ? hex.split("").map((char) => char + char).join("")
    : hex;
  if (normalized.length !== 6) return color;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
