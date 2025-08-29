import React, { useState } from "react";
import { MultiSelectSearchCheck } from "./prueba/MultiSelectSearchCheck";
import { SingleSelectSearchCheck } from "./prueba/SingleSelectSearchCheck";
import styleModule from "./papi.module.css";

type Item = {
    id: string;
    name: string;
};

const loadOptions = async (input: string): Promise<Item[]> => {
    if (input.trim() === "") {
        return []; // No mostrar nada si no hay texto
    }
    return [
        { id: "1", name: "Opción 1" },
        { id: "2", name: "Opción 2" },
    ].filter((item) => item.name.toLowerCase().includes(input.toLowerCase()));
};


export function ExampleParent() {
    // Para single
    const [selectedSingle, setSelectedSingle] = useState<Item | null>(null);
    const [searchSingle, setSearchSingle] = useState("");
    const [openSingle, setOpenSingle] = useState(false);

    // Para multi
    const [selectedMulti, setSelectedMulti] = useState<Item[]>([]);
    const [searchMulti, setSearchMulti] = useState("");
    const [openMulti, setOpenMulti] = useState(false);

    return (
        <>
            <h2>Single select</h2>
            <SingleSelectSearchCheck<Item>
                rowId="name"
                selected={selectedSingle}
                setSelected={setSelectedSingle}
                search={searchSingle}
                setSearch={setSearchSingle}
                open={openSingle}
                setOpen={setOpenSingle}
                emptyMessage="No hay resultados"
                labelSelect="Seleccionados"
                labelSearch="Buscar"
                loadOptions={loadOptions}
                placeholder="Buscar opción única..."
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

            />

            <h2>Multi select</h2>
            <MultiSelectSearchCheck<Item>
                rowId="name"
                selected={selectedMulti}
                setSelected={setSelectedMulti}
                search={searchMulti}
                setSearch={setSearchMulti}
                open={openMulti}
                setOpen={setOpenMulti}
                emptyMessage="No hay resultados"
                labelSelect="Seleccionados"
                labelSearch="Buscar"
                loadOptions={loadOptions}
                placeholder="Buscar múltiples opciones..."
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
            />
        </>
    );
}
