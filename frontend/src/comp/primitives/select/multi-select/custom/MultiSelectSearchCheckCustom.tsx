import { Search } from "lucide-react";
import { MultiSelectSearchCheck } from "../base/MultiSelectSearchCheck"
import type { StrictStringKeys } from "../types";
import styleModule from "./MultiSelectSearchCheckCustom.module.css";

interface MultiProps<T> {
    attribute: StrictStringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    emptyMessage: string;
    labelSelect?: string;
    labelSearch?: string;
    placeholder?: string;
    loadOptions: (inputValue: string) => Promise<T[]>;
    selected: T[];
    setSelected: (selected: T[]) => void;
}

const MultiSelectSearchCheckCustom = <T,>(props: MultiProps<T>) => {
    return (
        <MultiSelectSearchCheck
            rowId={props.attribute}
            search={props.search}
            setSearch={props.setSearch}
            open={props.open}
            setOpen={props.setOpen}
            emptyMessage={props.emptyMessage}
            labelSelect={props.labelSelect}
            labelSearch={props.labelSearch}
            icon={<Search className={styleModule.selectSearchMultiCheckButtonInputIcon}/>}
            placeholder={props.placeholder}
            classNameDropDownSelectItemInput={styleModule.selectSearchMultiCheckDropDownSelectItemInput}
            classNameContainer={styleModule.selectSearchMultiCheckContainer}
            classNameInputContainer={styleModule.selectSearchMultiCheckInputContainer}
            classNameDropDown={styleModule.selectSearchMultiCheckDropDown}
            classNameDropDownSelect={styleModule.selectSearchMultiCheckDropDownSelect}
            classNameButtonInput={styleModule.selectSearchMultiCheckButtonInput}
            classNameInput={`nunito-semibold ${styleModule.selectSearchMultiCheckInput}`}
            classNameDropDownSelectItemSelected={`nunito-semibold ${styleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
            classNameDropDownSearch={styleModule.selectSearchMultiCheckDropDownSearch}
            classNameDropDownSearchItem={`nunito-semibold ${styleModule.selectSearchMultiCheckDropDownSearchItem}`}
            classNameSeparator={styleModule.selectSearchMultiCheckSeparator}
            classNameDropDownHeader={`nunito-bold ${styleModule.selectSearchMultiCheckDropDownHeader}`}
            classNameEmptyMessage={`nunito-semibold ${styleModule.selectSearchMultiCheckEmptyMessage}`}
            loadOptions={props.loadOptions}
            selected={props.selected}
            setSelected={props.setSelected}
        />
    )
}

export default MultiSelectSearchCheckCustom
