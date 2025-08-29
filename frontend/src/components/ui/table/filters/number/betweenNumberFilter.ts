import { type FilterFn } from '@tanstack/react-table';

const betweenNumberFilter: FilterFn<any> = (row, columnId, filterValue) => {
  // filterValue: { min?: number; max?: number }
  const rowValue = row.getValue<number>(columnId);
  if (filterValue == null) return true;

  const { min, max } = filterValue as { min?: number; max?: number };

  if (min !== undefined && max !== undefined) {
    return rowValue >= min && rowValue <= max;
  }
  if (min !== undefined) {
    return rowValue >= min;
  }
  if (max !== undefined) {
    return rowValue <= max;
  }
  return true;
};


export default betweenNumberFilter;