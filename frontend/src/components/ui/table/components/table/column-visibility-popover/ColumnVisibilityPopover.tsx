import type {
    Column
} from "@tanstack/react-table";
import type {
    ChangeEvent, MouseEvent,
    RefObject
} from "react";
import ColumnVisibilityPopover
    from "../column-visibility-toggler/ColumnVisibilityToggler";

interface ColumnVisibilityToggleProps<T> {
    isVisible: boolean;
    onToggle: (
        e: MouseEvent<HTMLButtonElement>
    ) => void;
    columns: Column<T, unknown>[];
    valueTextFieldColumnHide: string;
    onChangeTextFieldColumnHide: (
        e: ChangeEvent<HTMLInputElement>
    ) => void;
    onClickButtonHideColumn: (
        e: MouseEvent<HTMLButtonElement>,
        currentColumn: Column<T>
    ) => void
    triggerRef: RefObject<HTMLButtonElement | null>;
    popoverRef: RefObject<HTMLDivElement | null>;
}

const ColumnVisibilityToggle = <T,>({
    isVisible,
    onToggle,
    columns,
    valueTextFieldColumnHide,
    onChangeTextFieldColumnHide,
    onClickButtonHideColumn,
    triggerRef,
    popoverRef
}: ColumnVisibilityToggleProps<T>) => {

    return (
        <div className="hide_container" style={{ position: "relative" }}>
            <button onClick={onToggle} ref={triggerRef}>
                Views
            </button>
            {isVisible && (
                <ColumnVisibilityPopover
                    popoverRef={popoverRef}
                    valueTextFieldColumnHide={valueTextFieldColumnHide}
                    onChangeTextFieldColumnHide={onChangeTextFieldColumnHide}
                    onClickButtonHideColumn={onClickButtonHideColumn}
                    columns={columns}
                />
            )}
        </div>
    );
}

export default ColumnVisibilityToggle;
