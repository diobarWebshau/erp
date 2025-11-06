
import MultiSelectCheckSearchMemo from "../base/MultiSelectCheckSearch";
import StyleModule from "./MultiSelectCheckSearchCustom.module.css"
import { memo, type ReactNode } from "react";

interface MultiSelectCheckSearchCustomProps<T> {
    options?: T[];
    selected: T[];
    setSelected: (selected: T[]) => void;
    rowId: keyof T;
    colorMain?: string;
    initialOpen?: boolean;
    placeholder?: string;
    maxHeight?: string;
    emptyMessage?: ReactNode;
    loadOptions?: (query: string | number) => Promise<T[]>;
}

const MultiSelectCheckSearchCustom = <T,>({
    options,
    selected,
    setSelected,
    rowId,
    colorMain,
    initialOpen = false,
    placeholder,
    maxHeight,
    emptyMessage,
    loadOptions,
}: MultiSelectCheckSearchCustomProps<T>) => {
    return <MultiSelectCheckSearchMemo
        options={options}
        selected={selected}
        setSelected={setSelected}
        rowId={rowId}
        colorMain={colorMain}
        initialOpen={initialOpen}
        emptyMessage={emptyMessage}
        loadOptions={loadOptions}
        classNameContainerPopover={StyleModule.containerPopover}
        classNameContainerCheckBoxesMain={StyleModule.containerCheckBoxesMain}
        classNameContainerCheckBoxesNoSelected={StyleModule.containerCheckBoxesNoSelected}
        classNameCheckBoxItemSelected={StyleModule.checkBoxItemSelected}
        classNameCheckBoxItem={StyleModule.checkBoxItem}
        classNameContainerEmptyMessage={`nunito-regular ${StyleModule.containerEmptyMessage}`}
        classNameCheckBox={StyleModule.checkBox}
        placeholder={placeholder}
        maxHeight={maxHeight}
    />
};

const MultiSelectCheckSearchCustomMemo = memo(MultiSelectCheckSearchCustom) as typeof MultiSelectCheckSearchCustom;

export default MultiSelectCheckSearchCustomMemo;