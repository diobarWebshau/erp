import type { FilterFn, Row } from "@tanstack/react-table";

const toBool = (v: unknown): boolean | undefined => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1" || v === "true") return true;
  if (v === 0 || v === "0" || v === "false") return false;
  return Boolean(v);
};

const equalsBooleanFilter: FilterFn<any> = <T,>(
  row: Row<T>,
  columnId: string,
  filterValue: boolean | undefined
) => {
  if (filterValue === undefined) return true; // sin filtro
  const cell = row.getValue(columnId);
  return toBool(cell) === filterValue;
};

export default equalsBooleanFilter;
