import { useMemo, useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface UseDndTableRowsParams<T> {
    rows: T[];
    enableSortableRows?: boolean;

    // ⭐ ya NO string → ahora es función que LEE el campo numérico
    getSortField?: (row: T) => number;

    // ⭐ función que ESCRIBE el campo numérico (anidado o no)
    setSortField?: (row: T, value: number) => T;

    // ⭐ única salida: tú decides cómo guardarlo
    setOnReorderRows?: (rows: T[]) => void;

    getId: (row: T, index: number) => string | number;
}

const useDndTableRows = <T,>({
    rows,
    enableSortableRows = false,
    getSortField,
    setSortField,
    setOnReorderRows,
    getId,
}: UseDndTableRowsParams<T>) => {

    // IDs para sortable
    const items = useMemo(
        () => enableSortableRows ? rows.map((row, index) => getId(row, index)) : [],
        [rows, enableSortableRows, getId]
    );

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            if (!enableSortableRows) return;
            if (!setOnReorderRows) return;

            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            // mover
            let reordered = arrayMove(rows, oldIndex, newIndex);

            // reasignar orden si existen ambas funciones
            if (getSortField && setSortField) {
                reordered = reordered.map((row, idx) =>
                    setSortField(row, idx + 1)
                );
            }

            // única salida
            setOnReorderRows(reordered);
        },
        [
            rows,
            items,
            enableSortableRows,
            setOnReorderRows,
            getSortField,
            setSortField,
        ]
    );

    return { items, onDragEnd };
};

export default useDndTableRows;
