import type {
    Dispatch, SetStateAction
} from "react";
import {
    DraggableList
} from "../draggable-list/DraggableList"
import type {
    ColumnSort, ColumnDef, SortingState
} from "@tanstack/react-table";

interface SortsPopoverListProps<T> {
    sorting: SortingState;
    setSorting: Dispatch<SetStateAction<SortingState>>
    isVisible: boolean;
    onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void,
    columns: ColumnDef<T>[],
    triggerRef: React.RefObject<HTMLButtonElement | null>,
    popoverRef: React.RefObject<HTMLDivElement | null>,
}

const SortsPopoverList = <T,>(
    {
        sorting,
        setSorting,
        isVisible,
        onToggle,
        columns,
        triggerRef,
        popoverRef,
    }: SortsPopoverListProps<T>
) => {
    return (
        <div style={{ display: "flex", position: "relative" }}>
            <button
                ref={triggerRef}
                disabled={sorting.length === 0}
                onClick={onToggle}
            >
                Sorts
            </button>

            {isVisible && (
                <div
                    ref={popoverRef}
                    style={{
                        position: "absolute",
                        top: "100%",
                        marginTop: "3%",
                        zIndex: 10,
                        backgroundColor: "black",
                    }}
                >
                    <DraggableList
                        items={sorting}
                        onItemsChange={setSorting}
                        renderItemContent={(item: ColumnSort) => {
                            // Buscar la columna con el `accessorKey` correspondiente
                            const column = columns.find(
                                (col): col is ColumnDef<any> & { accessorKey: string } =>
                                    "accessorKey" in col && col.accessorKey === item.id
                            );

                            const label =
                                typeof column?.header === "string"
                                    ? column.header
                                    : String(item.id);

                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        textAlign: "center",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <span>
                                        <strong>{label}</strong>
                                    </span>
                                    <span>{item.desc ? "desc" : "asc"}</span>
                                </div>
                            );
                        }}
                    />
                </div>
            )}
        </div>
    );
};


export default SortsPopoverList;