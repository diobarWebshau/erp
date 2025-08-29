
import {
    type Table, type Row
} from "@tanstack/react-table";
import StyleModule
    from "./row-options-toggler.module.css";
import {
    type RefObject
} from "react"


interface IRowOptionsTogglerProps<T> {
    ref: RefObject<HTMLDivElement | null>,
    className?: string,
    table: Table<T>,
    row: Row<T>,
    onEdit: ({ row, table }:
        { row: Row<T>, table: Table<T> }) => void,
    onDelete: ({ row, table }:
        { row: Row<T>, table: Table<T> }) => void
}


const RowOptionsToggler = <T,>(
    { ref, className,
        table, row,
        onDelete, onEdit }: IRowOptionsTogglerProps<T>
) => {
    return (
        < div
            ref={ref}
            className={`${StyleModule.options} ${className}`}
            style={
                {
                    position: "absolute",
                    top: "100%",
                    marginTop: "3%",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 10
                }
            }
        >
            <button
                onClick={() => { onEdit({ row, table }) }}
            >Edit</button>
            <button
                onClick={() => { onDelete({ row, table }) }}
            >Delete</button>
        </div>
    );
}
export default RowOptionsToggler;