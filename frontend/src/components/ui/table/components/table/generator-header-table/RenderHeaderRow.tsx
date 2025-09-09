import {
    flexRender,
    type HeaderGroup,
    type Table
} from "@tanstack/react-table";
import {
    type Column,
} from "@tanstack/react-table"
import {
    useMemo,
    type Dispatch,
    type MouseEvent,
    type RefObject,
    type SetStateAction
} from "react";
import stylesModules
    from "./RenderHeaderRow.module.css"
import type {
    ColumnTypeDataFilter,
    BaseRow
} from "../../../types";
import HeaderPopoverOptions
    from "./HeaderPopoverOptions";


interface renderHeaderRowProps<T> {
    group: HeaderGroup<T>
    table: Table<T>,
    enableSorting?: boolean;
    enableFilters?: boolean;
    isVisibleFilterPopover: string | null;
    setIsVisibleFilterPopover: Dispatch<
        SetStateAction<string | null>
    >,
    filterTriggerRefs: RefObject<
        Record<string, HTMLButtonElement | null>
    >; // referencias de los botones de los filtros
    filterPopoverRef: RefObject<
        HTMLDivElement | null>; // referencia del popover de los filtros
    handlerOnClickButtonFilter: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>
    ) => void, // handler para el click del boton de filtro(cambia el estado del popover)
    handlerOnClickButtonAddFilterColumn: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>,
        value: ColumnTypeDataFilter
    ) => void, // handler para el click del boton de agregar filtro(columna)
    typeRowActions?: "ellipsis" | "icon";
}



const RenderHeaderRow = <T,>({
    group,
    table,
    enableSorting,
    enableFilters,
    isVisibleFilterPopover,
    setIsVisibleFilterPopover,
    filterTriggerRefs,
    filterPopoverRef,
    handlerOnClickButtonFilter,
    handlerOnClickButtonAddFilterColumn,
    typeRowActions,
}: renderHeaderRowProps<T>) => {

    const rowCount = table?.getRowModel()?.rows?.length ?? 0;

    return (
        <tr
            className={`nunito-bold ${stylesModules.rowTableHeader}`}
            key={group.id}
        >
            {group.headers.map((header) => {
                return (
                    <th key={header.id}
                        className={`  ${stylesModules.thTableHeader}`}
                        style={{
                            backgroundColor: rowCount > 0
                                ? "var(--color-theme-primary-light)"
                                : "var(--color-theme-secondary-light)",
                        }}
                    >
                        {
                            header.id === "select" ? (
                                <div
                                    className={stylesModules.containerTableHeaderSelect}

                                >
                                    <div>
                                        <label>
                                            {
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            }
                                        </label>
                                    </div>
                                </div>
                            ) : header.id === "options" ? (
                                <div
                                    className={stylesModules.containerTableHeaderOptions}
                                >
                                    {
                                        typeRowActions === "icon" ? (
                                            <div>
                                                <label>
                                                    {
                                                        flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )
                                                    }
                                                </label>
                                            </div>
                                        ) : (
                                            null
                                        )
                                    }
                                </div>
                            ) : (
                                <div
                                    className={
                                        header.column.getIsFiltered()
                                            ? stylesModules.containerTableHeaderFilter
                                            : stylesModules.containerTableHeader
                                    }
                                >
                                    <div>
                                        <label>
                                            {
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            }
                                        </label>
                                        {enableFilters && (

                                            <HeaderPopoverOptions<T>
                                                header={header}
                                                column={header.column}
                                                table={table}
                                                setIsVisibleFilterPopover={setIsVisibleFilterPopover}
                                                filterTriggerRefs={filterTriggerRefs}
                                                filterPopoverRef={filterPopoverRef}
                                                isVisibleFilterPopover={isVisibleFilterPopover}
                                                onClickFilter={handlerOnClickButtonFilter}
                                                onClickAddFilter={handlerOnClickButtonAddFilterColumn}
                                            />
                                        )}
                                    </div>
                                </div>
                            )
                        }
                    </th>
                );
            })}
        </tr >
    );
}


export default RenderHeaderRow;


// <div style={{ position: "relative" }}>
//     <button
//         style={
//             {
//                 border: "none",
//                 background: "transparent",
//                 cursor: "pointer"
//             }
//         }
//         disabled={!isFilterable}
//         ref={(el) => {
//             if (el) filterTriggerRefs.current[header.column.id] = el;
//         }}
//         onClick={(e) => handlerOnClickButtonFilter(e, header.column)}
//     >
//         {header.column.getIsFiltered() ? (
//             <MoreVertical
//                 width={25}
//                 height={25}
//                 color="red"
//             />
//         ) : (
//             <MoreVertical
//                 width={25}
//                 height={25}
//                 color="white"
//             />
//         )}
//     </button>

//     {isVisibleFilterPopover === header.column.id && (
//         <div
//             ref={filterPopoverRef}
//             style={{
//                 position: "absolute",
//                 top: "100%",
//                 marginTop: "3%",
//                 zIndex: 10,
//                 backgroundColor: "black",
//             }}
//         >
//             {/* Valor activo */}
//             {header.column.getIsFiltered() && (
//                 <div style={{ display: "flex", flexDirection: "column" }}>
//                     <small>Active filter:</small>
//                     <div>
//                         <small>{JSON.stringify(getValueFieldColumnFilter(header.column.id))}</small>
//                         <button
//                             onClick={(e) => handleOnClickButtonDeleteFilter(e, header.column.id)}
//                         >
//                             <Delete size={15} color="red" />
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Inputs según tipo */}
//             {meta?.type === "string" && (
//                 <>
//                     <StringInput
//                         label={header.id}
//                         type="text"
//                         value={String(filterInputValues[header.column.id] ?? "")}
//                         defaultValue={getValueFieldColumnFilter(header.column.id)}
//                         onChange={(value) => handlerOnChangeInputTextFilterColumn(value, header.column)}
//                     />
//                     <div>
//                         <small>Common values</small>
//                         <div style={{ maxHeight: "100px", overflowY: "auto" }}>
//                             {table
//                                 ?.getFilteredRowModel()
//                                 ?.rows?.map((row) => row.getValue(header.column.id))
//                                 ?.filter((val): val is string => typeof val === "string")
//                                 ?.filter((v, i, arr) => arr.indexOf(v) === i)
//                                 ?.filter((v) =>
//                                     String(filterInputValues[header.column.id] ?? "").length === 0
//                                     || v.toLowerCase().startsWith(String(filterInputValues[header.column.id]).toLowerCase())
//                                 )
//                                 .map((val, i) => (
//                                     <button
//                                         key={i}
//                                         type="button"
//                                         onClick={(e) => handleOnClickButtonCommonValuesFilter(e, val, header.column)}
//                                     >
//                                         <small>{val}</small>
//                                     </button>
//                                 ))}
//                         </div>
//                     </div>
//                 </>
//             )}

//             {meta?.type === "number" && (
//                 <NumberSlice
//                     min={1}
//                     max={Math.max(
//                         ...table
//                             ?.getFilteredRowModel()
//                             ?.rows?.map((row) => Number(row.getValue(header.column.id)))
//                             ?.filter((n) => !isNaN(n))
//                     )}
//                     step={1}
//                     value={filterInputValues[header.column.id]}
//                     label={header.id}
//                     onChange={(val) => handlerOnChangeInputTextFilterColumn(val, header.column)}
//                     mode={meta.mode ?? "single"}
//                 />
//             )}

//             {meta?.type === "date" && (
//                 <DateSlicer
//                     value={filterInputValues[header.column.id]}
//                     label={header.id}
//                     onChange={(val) => handlerOnChangeInputTextFilterColumn(val, header.column)}
//                     mode={meta.mode ?? "single"}
//                 />
//             )}

//             {meta?.type === "boolean" && (
//                 <BooleanInput
//                     value={filterInputValues[header.column.id]}
//                     options={meta.booleanLabels ?? ["false", "true"]}
//                     onChange={(val) => handlerOnChangeInputTextFilterColumn(val, header.column)}
//                     label={header.id}
//                 />
//             )}

//             {meta?.type === "enum" && (
//                 <EnumSelectInput
//                     options={meta.options ?? []}
//                     value={filterInputValues[header.column.id]}
//                     onChange={(val) => handlerOnChangeInputTextFilterColumn(val, header.column)}
//                     label={header.id}
//                 />
//             )}

//             <button
//                 onClick={(e) => handlerOnClickButtonAddFilterColumn(e, header.column)}
//             >
//                 Add filter
//             </button>
//         </div>
//     )}
// </div>