import { Search } from "lucide-react";
import type { StrictStringKeys } from "../../../../../interfaces/globalTypes";
import SingleSelectSearchCheck from "../base/SingleSelectSearchCheck";
import styleModule from "./SingleSelectSearchCheckCustom.module.css";


interface SingleSelectSearchCheckProps<T> {
    rowId: StrictStringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    emptyMessage: string;
    labelSelect?: string;
    labelSearch?: string;
    placeholder?: string;
    options?: T[]; // LOCAL
    loadOptions?: (inputValue: string) => Promise<T[]>; // REMOTO
    selected: T | null;
    setSelected: (selected: T | null) => void;
}

const SingleSelectSearchCheckCustom = <T,>(
    {
        rowId,
        search,
        setSearch,
        open,
        setOpen,
        emptyMessage,
        labelSelect,
        labelSearch,
        placeholder,
        options,
        loadOptions,
        selected,
        setSelected,
    }: SingleSelectSearchCheckProps<T>
) => {
    
    return (
        <SingleSelectSearchCheck
            rowId={rowId}
            search={search}
            setSearch={setSearch}
            open={open}
            setOpen={setOpen}
            emptyMessage={emptyMessage}
            icon={<Search className={styleModule.iconButton}/>}
            placeholder={placeholder}
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
            loadOptions={loadOptions}
            selected={selected}
            setSelected={setSelected}
        />

    );

}

export default SingleSelectSearchCheckCustom;
