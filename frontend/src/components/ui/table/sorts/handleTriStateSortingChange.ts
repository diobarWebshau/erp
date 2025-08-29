import type { ColumnSort, SortingState, Updater } from "@tanstack/react-table";

/**
 * Lógica de ordenamiento cíclico: ascendente → descendente → sin orden
 * @param updater - Puede ser una función que recibe el estado actual o un nuevo estado directo
 * @param currentSorting - Estado actual de ordenamiento
 * @param setSorting - Setter del estado de ordenamiento (como setState)
 */
const handleTriStateSortingChange = (
    updater: Updater<SortingState>,
    currentSorting: SortingState,
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>
) => {
    const next: SortingState =
        typeof updater === "function" ? updater(currentSorting) : updater;

    const last: ColumnSort | undefined = next.at(-1);
    if (!last) return;

    setSorting((prev) => {
        const exists = prev.find((s) => s.id === last.id);

        if (exists?.desc === true) {
            // Si ya está en descendente, quitar el orden
            return prev.filter((s) => s.id !== last.id);
        }

        if (exists?.desc === false) {
            // Si está en ascendente, pasar a descendente
            return prev.map((s) =>
                s.id === last.id ? { ...s, desc: true } : s
            );
        }

        // Si no existía, agregar orden ascendente
        return [...prev, { id: last.id, desc: false }];
    });
}


export default handleTriStateSortingChange;