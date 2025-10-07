import StandardDayPickedMantineCustomTable from "../../../../external/mantine/date/standar/custom/table/StandardDayPickedMantineCustomTable";
import RangeDayPickerMantineCustomTable from "../../../../external/mantine/date/range/custom/table/RangeDayPickerMantineCustomTable";
import CheckBoxWithSearch from "../../../checkbox/list-search/base/checkBoxWithSearch/CheckBoxWithSearch";
import RangeSlicerMantineTable from "../../../../external/mantine/slicer/range/table/custom/RangeSlicerMantineTable";
import ToggleRadioButtonGroup, { type Option } from "../../../radio-button/custon-radio-button/ToggleRadioButtonGroup";
import CheckBoxListAutoSize from "../../../checkbox/list-checbox-auto-size/base/CheckBoxListAutoSize";
import MainActionButtonCustom from "../../../button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import TransparentButtonCustom from "../../../button/custom-button/transparent/TransparentButtonCustom";
import PopoverFloating from "../../../../external/floating/pop-over/PopoverFloating"
import { getDefaultResetValue, getEnumLabel, getEnumValue } from "../../tableContext/tableTypes";
import type { BooleanFilter, ColumnTypeDataFilter, EnumFilter, ObjectDateFilter, ObjectNumericFilter } from "../../tableContext/tableTypes";
import { ChevronLeft, MoreVertical, Plus, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react";
import type { Column, ColumnSort, Table } from "@tanstack/react-table";
import { useTableDispatch, useTableState } from "../../tableContext/tableHooks";
import stylesModules from "./HeaderPopoverOptions.module.css"
import { add_column_filter, add_sorting, remove_column_filter, remove_sorting } from "../../tableContext/tableActions";
import { Divider } from "@mantine/core";

const options: [Option, Option] = [
    { label: "Orden ascendente", icon: <ChevronUp /> },
    { label: "Orden descendente", icon: <ChevronDown /> },
];

interface PopoverComponentHeaderProps<T> {
    column: Column<T>;
    table: Table<T>;
    enableSorting: boolean;
    onClose: () => void;
}

const PopoverComponentHeader = <T,>({
    column,
    table,
    enableSorting,
    onClose,
}: PopoverComponentHeaderProps<T>) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

    const meta = column.columnDef.meta;
    const columnId = column.id;

    const [filteredValueLocal, setFilteredValueLocal] = useState<ColumnTypeDataFilter | undefined>(
        state.columnFiltersState.find((filter) => filter.id === column.id)?.value as
        | ColumnTypeDataFilter
        | undefined
    );

    const handleOnClickResetChanges = () => {
        dispatch(remove_column_filter(column.id));
        dispatch(remove_sorting(column.id));
        setFilteredValueLocal(getDefaultResetValue(meta?.type as string));
    };

    // ************** LOGICA DE ORDENACION **************

    const handleOnChangeToggleRadioButton = (optionLabel: string, columnId: string) => {

        const valueBoolean =
            optionLabel === options[0].label ? false : true;

        const stateColumns: ColumnSort | undefined =
            state.sortingState.find((c) => c.id === columnId);

        const desc = stateColumns?.desc;

        if (desc === undefined) {
            dispatch(add_sorting({
                id: columnId,
                desc: valueBoolean
            }));
        } else {
            if (desc === valueBoolean) {
                dispatch(remove_sorting(columnId));
            } else {
                dispatch(add_sorting({ id: columnId, desc: valueBoolean }));
            }
        }
    }

    const isOptionSelectedFunction = (optionLabel: string, columnId: string): boolean => {
        const desc = state.sortingState.find((c) => c.id === columnId)?.desc;
        if (desc === undefined) return false;
        return desc ? optionLabel === options[1].label : optionLabel === options[0].label;
    };

    // ************** LOGICA DE FILTRADO **************

    const isButtonAddFilterDisabled = () => {
        let value: ColumnTypeDataFilter;
        switch (meta?.type) {
            case "boolean":
                value = filteredValueLocal as BooleanFilter;
                return value === undefined;
            case "string":
                value = (filteredValueLocal as string[]) || [];
                return value.length === 0;
            case "number":
                value = filteredValueLocal as ObjectNumericFilter;
                return value?.max === undefined && value?.min === undefined;
            case "date":
                value = filteredValueLocal as ObjectDateFilter;
                return value?.from === undefined && value?.to === undefined;
            case "enum":
                value = filteredValueLocal as EnumFilter;
                return value === undefined || value.length === 0;
            default:
                return true;
        }
    };

    const applyFilterInColumn = () => {
        let valueInput: ColumnTypeDataFilter;
        switch (meta?.type) {
            case "string":
                valueInput = filteredValueLocal as string[];
                valueInput = valueInput.map((el) => el.trim());
                if (valueInput.length > 0)
                    dispatch(add_column_filter({
                        id: column.id,
                        value: valueInput
                    }));
                break;
            case "boolean":
                valueInput = filteredValueLocal as BooleanFilter;
                if (valueInput !== undefined)
                    dispatch(add_column_filter({
                        id: column.id,
                        value: valueInput
                    }));
                break;
            case "number":
                valueInput = filteredValueLocal as ObjectNumericFilter;
                if (valueInput?.max !== undefined
                    || valueInput?.min !== undefined)
                    dispatch(add_column_filter({
                        id: column.id,
                        value: {
                            min: valueInput?.min,
                            max: valueInput?.max
                        }
                    }));
                break;
            case "date":
                valueInput = filteredValueLocal as ObjectDateFilter;
                if (valueInput?.from || valueInput?.to) {
                    dispatch(add_column_filter({
                        id: column.id,
                        value: {
                            from: valueInput?.from,
                            to: valueInput?.to
                        }
                    }));
                }
                break;
            case "enum":
                valueInput = filteredValueLocal as EnumFilter;
                dispatch(add_column_filter({
                    id: column.id,
                    value: valueInput
                }));
                break;
            default:
                break;
        }
        onClose();
    };

    // const convertEnumToArray = () => {

    //     let array: string[] = [];

    //     if (filteredValueLocal as EnumFilter){
    //         const enumValue = getEnumLabel(column.columnDef, filteredValueLocal as EnumFilter);
    //         if (enumValue !== undefined)
    //             array.push(enumValue);
    //     }
    //     return array;
    // }

    const convertEnumToArray = () => {
        const enumValue = getEnumLabel(column.columnDef, filteredValueLocal as EnumFilter);
        return [...enumValue];
    }

    const onChangeEnum = (value: string[]) => {
        console.log(value);
        const enumValue = getEnumValue(column.columnDef, value);
        console.log(enumValue);
        setFilteredValueLocal(enumValue);
    }

    // ************** EFECTOS **************

    useEffect(() => {
        const globalValue = state.columnFiltersState.find(
            (filter) => filter.id === column.id
        )?.value as ColumnTypeDataFilter | undefined;
        setFilteredValueLocal(globalValue);
    }, [column.id, state.columnFiltersState]);

    return (
        <div className={stylesModules.popoverContainer}>
            {enableSorting &&
                <div className={`nunito-semibold ${stylesModules.sortSection}`}>
                    <ToggleRadioButtonGroup
                        options={options}
                        columnId={column.id}
                        onChange={handleOnChangeToggleRadioButton}
                        isOptionSelectedFunction={isOptionSelectedFunction}
                        typeOrderIcon="first"
                        classNameContainer={stylesModules.containerToggleRadioButtonGroup}
                        classNameButton={stylesModules.buttonToggleRadioButtonGroup}
                    />
                </div>
            }

            {enableSorting && <Divider className={stylesModules.separator} orientation="horizontal" size="sm" />}

            <div className={`nunito-semibold ${stylesModules.filterSection}`}>
                {meta?.type === "string" && (
                    <CheckBoxWithSearch
                        options={table
                            .getPreFilteredRowModel()
                            .rows.map((row) => row.getValue(columnId))
                            .filter((v): v is string => typeof v === "string")
                            .filter((v, i, arr) => arr.indexOf(v) === i)}
                        value={filteredValueLocal}
                        onChange={setFilteredValueLocal}
                        classNameInputSearch={stylesModules.inputSearch}
                    />
                )}

                {meta?.type === "number" && (
                    <RangeSlicerMantineTable
                        max={1000}
                        min={100}
                        value={filteredValueLocal as ObjectNumericFilter}
                        onChange={setFilteredValueLocal}
                    />
                )}

                {meta?.type === "date" && (
                    <div>
                        {
                            meta.mode === "single" ? (
                                <StandardDayPickedMantineCustomTable
                                    value={filteredValueLocal as ObjectDateFilter}
                                    onChange={setFilteredValueLocal}
                                    className={stylesModules.smallCalendar}
                                />
                            ) : (
                                <RangeDayPickerMantineCustomTable
                                    value={filteredValueLocal as ObjectDateFilter}
                                    onChange={setFilteredValueLocal}
                                    className={stylesModules.smallCalendar}
                                />
                            )
                        }
                    </div>
                )}

                {meta?.type === "boolean" && (
                    <CheckBoxListAutoSize
                        options={meta.booleanLabels ?? ["true", "false"]}
                        value={filteredValueLocal as string[]}
                        onChange={setFilteredValueLocal}
                    />
                )}

                {meta?.type === "enum" && (
                    <CheckBoxListAutoSize
                        options={meta.enumOptions?.map((option) => option.label) ?? []}
                        value={convertEnumToArray()}
                        onChange={onChangeEnum}
                    />
                )}
            </div>

            <MainActionButtonCustom
                onClick={applyFilterInColumn}
                label="Aplicar"
                icon={<Plus />}
                classNameButton={isButtonAddFilterDisabled() ? stylesModules.applyButtonDisabled : stylesModules.applyButton}
            />
            <TertiaryActionButtonCustom
                onClick={onClose}
                label="Cancelar"
                icon={<XCircle />}
                classNameButton={stylesModules.cancelButton}
            />

            <div className={stylesModules.resetButtonContainer}>
                <TransparentButtonCustom
                    onClick={handleOnClickResetChanges}
                    label="Reiniciar cambios"
                    icon={<ChevronLeft />}
                    classNameButton={stylesModules.resetButton}
                    classNameSpan={stylesModules.resetButtonSpan}
                />
            </div>
        </div>
    )
}

interface HeaderPopoverOption2Props<T> {
    column: Column<T>;
    table: Table<T>;
    enableSorting: boolean;
}

const HeaderPopoverOption2 = <T,>({
    column,
    table,
    enableSorting,
}: HeaderPopoverOption2Props<T>) => {

    return (
        <PopoverFloating
            childrenFloating={
                ({ onClose }) => (
                    <PopoverComponentHeader
                        column={column}
                        table={table}
                        enableSorting={enableSorting}
                        onClose={onClose}
                    />
                )
            }
            childrenTrigger={
                <button
                    className={stylesModules.optionIconButton}
                    type="button"
                >
                    <MoreVertical className={stylesModules.optionIcon} />
                </button>
            }
        />
    )
}

export default HeaderPopoverOption2;
