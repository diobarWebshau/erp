
import SingleSelectCheckSearchMemo from "../base/SingleSelectCheckSearch";
import StyleModule from "./SingleSelectCheckSearchCustom.module.css"
import { memo, type ReactNode } from "react";

interface SingleSelectCheckSearchCustomProps<T> {
    options?: T[];
    selected: T | null;
    setSelected: (selected: T | null) => void;
    rowId: (data: T) => string;
    colorMain?: string;
    initialOpen?: boolean;
    placeholder?: string;
    maxHeight?: string;
    emptyMessage?: ReactNode;
    loadOptions?: (query: string | number) => Promise<T[]>;
}

const SingleSelectCheckSearchCustom = <T,>({
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
}: SingleSelectCheckSearchCustomProps<T>) => {
    return <SingleSelectCheckSearchMemo
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

const SingleSelectCheckSearchCustomMemo = memo(SingleSelectCheckSearchCustom) as typeof SingleSelectCheckSearchCustom;

export default SingleSelectCheckSearchCustomMemo;