const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatProjectUpdatedAt(value: string) {
  const normalizedValue = value.trim();
  if (!normalizedValue || ["hoy", "ayer"].includes(normalizedValue.toLowerCase())) {
    return normalizedValue || "Sin fecha";
  }

  if (!/^\d{4}-\d{2}-\d{2}T/.test(normalizedValue)) {
    return value || "Sin fecha";
  }

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = shortMonths[date.getMonth()];
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hour}:${minute}`;
}
