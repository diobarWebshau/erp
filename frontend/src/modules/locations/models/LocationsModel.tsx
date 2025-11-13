import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useTableDispatch, useTableState } from "../../../comp/primitives/table/tableContext/tableHooks";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import GenericTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import useAllLocations from "./../../../modelos/locations/hooks/useAllLocations";
import { Search, Download, Eraser, PlusIcon, Trash2 } from "lucide-react";
import type { RowAction } from "../../../comp/primitives/table/types";
import { columnsLocations } from "./structure/LocationColumns";
import { useCallback, useMemo, useState } from "react";
import type { ILocation } from "interfaces/locations";
import StyleModule from "./LocationModel.module.css";
import LocationModuleProvider from "./context/LocationModuleProvider";
import AddWizardLocation from "./wizards/add/AddWizardLocation";

const LocationsModel = () => {

    // ********** States ********** 

    const getRowId = useMemo(() => (row: ILocation, index: number) => row?.id.toString() ?? index.toString(), []);
    const [search, setSearch] = useState<string>("");
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);

    // ********** Hooks **********

    const { locations, loadingLocations } = useAllLocations({ debounce: 500, like: search });

    // ********** Functions **********

    const toggleIsActiveAddModal = useCallback(() => {
        setIsActiveAddModal(prev => !prev);
    }, []);

    // ********** ExtraComponents **********

    const actionsRow: RowAction<ILocation>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: () => { },
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], []);

    const ExtraComponents = useCallback(() => {
        const state = useTableState();
        const dispatch = useTableDispatch();

        const handleClearFilters = useCallback(() => {
            dispatch(reset_column_filters());
        }, [dispatch]);

        const handleExportTable = useCallback(() => {
            console.log("exporting table")
        }, []);

        return (
            <div className={StyleModule.containerExtraComponents}>
                <div className={StyleModule.searchSection}>
                    <InputTextCustom
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar"
                        icon={<Search />}
                        classNameInput={StyleModule.inputTextCustom}
                        classNameContainer={StyleModule.containerInputSearch}
                        withValidation={false}
                    />
                </div>
                <div className={StyleModule.containerButtons}>
                    <SecundaryActionButtonCustom
                        label="Limpiar filtros"
                        onClick={handleClearFilters}
                        icon={<Eraser />}
                        disabled={state.columnFiltersState.length === 0}
                    />
                    <SecundaryActionButtonCustom
                        label="Exportar tabla"
                        onClick={handleExportTable}
                        icon={<Download />}
                        disabled={Object.keys(state.rowSelectionState).length === 0}
                    />
                </div>
            </div>
        );
    }, [search]);

    // ********** Render **********

    return (
        <div className={StyleModule.locationModelContainer}>
            <div className={StyleModule.locationModelHeader}>
                <h1 className="nunito-bold">Ubicaciones</h1>
                <MainActionButtonCustom
                    icon={<PlusIcon />}
                    label="Ubicación"
                    onClick={toggleIsActiveAddModal}
                />
            </div>
            <GenericTableMemo
                // modelo e indentificador 
                modelName="Ubicaciones"
                getRowId={getRowId}

                // data y columnas */
                columns={columnsLocations}
                data={locations}
                isLoadingData={loadingLocations}

                // funcionalidades
                enablePagination
                enableFilters
                enableSorting
                enableOptionsColumn
                enableRowEditClick
                typeRowActions='icon'
                noResultsMessage="No se encontraron ubicaciones o no existen ubicaciones que coincidan con la búsqueda"

                // extra components
                extraComponents={ExtraComponents}
                rowActions={actionsRow}

                // estilos 
                classNameGenericTableContainer={StyleModule.genericTableContainer}
            />
            {isActiveAddModal && (
                <LocationModuleProvider currentStep={0} totalSteps={2}>
                    <AddWizardLocation
                        onClose={toggleIsActiveAddModal}
                    />
                </LocationModuleProvider>
            )}
        </div>
    )
}

export default LocationsModel;
