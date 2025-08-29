import type { FilterFn, Row } from '@tanstack/react-table';

const betweenDateFilter: FilterFn<any> = <T,>(row: Row<T>, columnId: string, filterValue: unknown) => {
  const rowValue = row.getValue<string>(columnId); // suponemos string ISO
  console.log("rowValue", rowValue);
  console.log("filterValue", filterValue);
  if (!rowValue) return false;
  if (filterValue == null) return true;

  const { from, to } = filterValue as { from?: Date; to?: Date };

  const rowDate = new Date(rowValue);
  if (isNaN(rowDate.getTime())) return false;

  const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const rowNormalized = normalize(rowDate);

  if (from && to) {
    const startDate = normalize(from);
    const endDate = normalize(to);
    return rowNormalized >= startDate && rowNormalized <= endDate;
  }

  if (from) {
    const startDate = normalize(from);
    return rowNormalized >= startDate;
  }

  if (to) {
    const endDate = normalize(to);
    return rowNormalized <= endDate;
  }

  return true;
};

export default betweenDateFilter;
