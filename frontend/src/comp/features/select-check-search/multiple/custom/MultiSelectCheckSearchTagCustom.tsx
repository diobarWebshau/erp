
import MultiSelectCheckSearchTagMemo from "../base/MultiSelectCheckSearchTag";
import StyleModule from "./MultiSelectCheckSearchTagCustom.module.css"
import { memo, type ReactNode } from "react";

interface MultiSelectCheckSearchTagCustomProps<T> {
    options?: T[];
    selected: T[];
    setSelected: (selected: T[]) => void;
    rowId: (data: T) => string;
    colorMain?: string;
    initialOpen?: boolean;
    placeholder?: string;
    maxHeight?: string;
    emptyMessage?: ReactNode;
    loadOptions?: (query: string | number) => Promise<T[]>;
    label?: string
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
    label
}: MultiSelectCheckSearchTagCustomProps<T>) => {
    return <MultiSelectCheckSearchTagMemo
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
        classNameTagObjectInput={StyleModule.tagObjectInput}
        classNameFieldSearch={StyleModule.containerFieldSearch}
        classNameInputTagsContainer={StyleModule.inputTagsContainer}
        classNameContainerEmptyMessage={`nunito-regular ${StyleModule.containerEmptyMessage}`}
        classNameCheckBox={StyleModule.checkBox}
        placeholder={placeholder}
        maxHeight={maxHeight}
        label={label}
    />
};

const MultiSelectCheckSearchCustomMemo = memo(MultiSelectCheckSearchCustom) as typeof MultiSelectCheckSearchCustom;

export default MultiSelectCheckSearchCustomMemo;