import type { FilterFn } from '@tanstack/react-table';

const equalsNumberFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const rowValue = row.getValue<number>(columnId);
    if (filterValue == null) return true;

    const { min } = filterValue as { min?: number };

    if (min !== undefined) {
        return rowValue === min;
    }
    return true;
};
export default equalsNumberFilter;  