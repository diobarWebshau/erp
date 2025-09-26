import type { Column, ColumnSort } from "@tanstack/react-table";
import stylesModules from "./CheckBoxButtonOptions.module.css";
import { useTableDispatch, useTableState } from "../../../tableContext/tableHooks";
import { add_sorting, remove_sorting } from "../../../tableContext/tableActions";

interface Option {
    label: string;
    icon: React.ReactNode;
}

interface RadioButtonOptionsProps<T> {
    column: Column<T>;
    options: Option[];
    typeOrderIcon?: "first" | "last";
    classNameContainer?: string;
    classNameButton?: string;
    classNameIcon?: string;
    classNameLabel?: string;
    classNameSelected?: string;
}

export default function RadioButtonsWithIcons<T>({
    column,
    options,
    typeOrderIcon = "first",
    classNameContainer = "",
    classNameButton = "",
    classNameIcon = "",
    classNameLabel = "",
    classNameSelected = "",
}: RadioButtonOptionsProps<T>) {

    const state =
        useTableState();
    const dispatch =
        useTableDispatch();

    console.log(state.sortingState);

    const onHandleChange = (value: string) => {

        const valueBoolean =
            value === "Ascending Order" ? false : true;

        const stateColumns: ColumnSort | undefined =
            state.sortingState.find(
                (c) => c.id === column.id
            );

        const desc = stateColumns?.desc;

        if (desc === undefined) {
            dispatch(add_sorting({
                id: column.id,
                desc: valueBoolean
            }));
        } else {
            if (desc === valueBoolean) {
                dispatch(remove_sorting(column.id));
            } else {
                dispatch(add_sorting({
                    id: column.id,
                    desc: valueBoolean
                }));
            }
        }
    }

    return (
        <div className={`${stylesModules.container} ${classNameContainer}`}>
            {options.map(({ label, icon }) => {
                const sortValue: boolean | undefined = state.sortingState.find(
                    (c) => c.id === column.id
                )?.desc;

                let stringValue: string = sortValue === undefined
                    ? ""
                    : sortValue ? "Descending Order" : "Ascending Order";

                let isSelected: boolean =
                    stringValue === label;

                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onHandleChange(label)}
                        className={`${stylesModules.label} ${classNameButton} ${isSelected ? classNameSelected : ""}`}
                    >
                        {typeOrderIcon === "first" && (
                            <span className={classNameIcon}>{icon}</span>
                        )}
                        <span className={classNameLabel}>{label}</span>
                        {typeOrderIcon === "last" && (
                            <span className={classNameIcon}>{icon}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
