// Popover.tsx
import { ScanSearch, ShieldCheck } from "lucide-react";
import { type Column, } from "@tanstack/react-table";
import StyleModule from "./column-visibility-toggler.module.css";
import type { ChangeEvent, RefObject, MouseEvent } from "react";

interface ColumnVisibilityPopoverProps<T> {
  className?: string
  popoverRef: RefObject<HTMLDivElement | null>,
  valueTextFieldColumnHide: string,
  onChangeTextFieldColumnHide: (e: ChangeEvent<HTMLInputElement>) => void,
  columns: Column<T, unknown>[],
  onClickButtonHideColumn: (e: MouseEvent<HTMLButtonElement>, currentColumn: Column<T>) => void
}

const ColumnVisibilityPopover = <T,>({
  className = "",
  popoverRef,
  valueTextFieldColumnHide,
  onChangeTextFieldColumnHide,
  columns,
  onClickButtonHideColumn,
}: ColumnVisibilityPopoverProps<T>) => {
  return (
    <div
      className={`${StyleModule.container} ${className}`}
      ref={popoverRef}
      style={{
        position: "absolute",
        marginTop: "3%",
        top: "100%",
        zIndex: 10
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "black",
        }}
      >
        <ScanSearch />
        <input
          type="text"
          value={valueTextFieldColumnHide}
          onChange={onChangeTextFieldColumnHide}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100px",
          overflow: "auto",
        }}
      >
        {columns.map((column) => (
          <div key={column.id}

          >
            {(column.id
              .toLowerCase()
              .startsWith(valueTextFieldColumnHide.toLowerCase())
              && column.getCanHide()
            ) && (
                <button
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: column.getIsVisible() ? "#fff" : "#aaa",
                    gap: "1.5rem"
                  }}
                  onClick={(e) => onClickButtonHideColumn(e, column)}
                >
                  <small>{column.id}</small>
                  {column.getIsVisible() && <ShieldCheck size={15} color="green" />}
                </button>
              )}
          </div>
        ))}
      </div>
    </div >
  );
};

export default ColumnVisibilityPopover;
