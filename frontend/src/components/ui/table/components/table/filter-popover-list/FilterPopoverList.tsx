import type {
    Dispatch, JSX,
    MouseEvent,
    RefObject,
    SetStateAction
} from "react";
import {
    DraggableList
} from "./../../table/draggable-list/DraggableList";
import type {
    ColumnFilter,
    ColumnFiltersState,
    Table
} from "@tanstack/react-table";
import type {
    ObjectDateFilter,
    ObjectNumericFilter
} from "../../../types";

interface FiltersPopoverListProps<T> {
    columnFilters: ColumnFiltersState;
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
    isVisible: boolean;
    onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
    table: Table<T>;
    triggerRef: RefObject<HTMLButtonElement | null>;
    popoverRef: RefObject<HTMLDivElement | null>;
}

export const FiltersPopoverList = <T,>({
    columnFilters,
    setColumnFilters,
    isVisible,
    onToggle,
    table,
    triggerRef,
    popoverRef,
}: FiltersPopoverListProps<T>) => {

    return (
        <div style={{ display: "flex", position: "relative" }}>
            <div>
                <button
                    ref={triggerRef}
                    disabled={columnFilters.length === 0}
                    onClick={onToggle}
                >
                    Filters
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
                            items={columnFilters}
                            onItemsChange={setColumnFilters}
                            renderItemContent={(item: ColumnFilter) => {
                                const column = table.getColumn(item.id);
                                const meta = column?.columnDef.meta;

                                const containerStyle: React.CSSProperties = {
                                    display: "flex",
                                    flexDirection: "row",
                                    textAlign: "center",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "0.5rem",
                                };

                                const renderValue = (): JSX.Element => {
                                    if (meta?.mode === "range") {
                                        if (meta?.type === "number") {
                                            const { min, max } = item.value as ObjectNumericFilter;
                                            return <span>{`${min ?? "—"} - ${max ?? "—"}`}</span>;
                                        }
                                        if (meta?.type === "date") {
                                            const { start, end } = item.value as ObjectDateFilter;
                                            return <span>{`${start ?? "—"} - ${end ?? "—"}`}</span>;
                                        }
                                    } else {
                                        if (meta?.type === "number") {
                                            const { min } = item.value as ObjectNumericFilter;
                                            return <span>{min}</span>;
                                        } else if (meta?.type === "date") {
                                            const { start } = item.value as ObjectDateFilter;
                                            return <span>{start}</span>;
                                        }
                                    }
                                    return <span>{String(item.value)}</span>;
                                };

                                return (
                                    <div style={containerStyle}>
                                        <span>
                                            <strong>{item.id}</strong>
                                        </span>
                                        {renderValue()}
                                    </div>
                                );
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
