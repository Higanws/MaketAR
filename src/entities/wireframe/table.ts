export function parseTableText(text: string) {
  const rows = text
    .split("\n")
    .map((row) => row.split("|").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
  const columnCount = Math.max(1, ...rows.map((row) => row.length));
  return rows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] ?? ""));
}

export function serializeTableRows(rows: string[][]) {
  return rows.map((row) => row.join(" | ")).join("\n");
}

export function updateTableCell(text: string, rowIndex: number, cellIndex: number, value: string) {
  const rows = parseTableText(text);
  rows[rowIndex][cellIndex] = value;
  return serializeTableRows(rows);
}

export function addTableRow(text: string) {
  const rows = parseTableText(text);
  const columnCount = rows[0]?.length ?? 3;
  return serializeTableRows([...rows, Array.from({ length: columnCount }, () => "")]);
}

export function addTableColumn(text: string) {
  const rows = parseTableText(text);
  return serializeTableRows(rows.map((row) => [...row, ""]));
}
