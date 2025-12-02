import { createCompleteLocationInDB, deleteLocationInDB, updateCompleteLocationInDB } from "../../../modelos/locations/queries/locationsQueries";
import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import type { IPartialLocationProductionLine, LocationProductionLineManager } from "../../../interfaces/locationsProductionLines";
import type { LocationLocationTypeManager, IPartialLocationLocationType } from "../../../interfaces/locationLocationType";
import type { IInventoryLocationItemManager, IPartialInventoryLocationItem } from "interfaces/inventoriesLocationsItems";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useTableDispatch, useTableState } from "../../../comp/primitives/table/tableContext/tableHooks";
import { diffObjects, diffObjectArrays } from "../../../utils/validation-on-update/ValidationOnUpdate2";
import FeedBackModal from "../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import GenericTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import { Search, Download, Eraser, PlusIcon, Trash2, CircleCheck } from "lucide-react";
import ToastMantine from "../../../comp/external/mantine/toast/base/ToastMantine";
import useAllLocations from "./../../../modelos/locations/hooks/useAllLocations";
import DeleteModal from "../../../comp/primitives/modal/deleteModal/DeleteModal";
import type { ILocation, IPartialLocation } from "interfaces/locations";
import type { RowAction } from "../../../comp/primitives/table/types";
import LocationModuleProvider from "./context/LocationModuleProvider";
import AddWizardLocation from "./wizards/add/AddWizardLocation";
import EditWizardLocation from "./wizards/edit/EditWizardLocation";
import { columnsLocations } from "./structure/LocationColumns";
import type { IApiError } from "../../../interfaces/errorApi";
import { memo, useCallback, useMemo, useState } from "react";
import { setError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import StyleModule from "./LocationModel.module.css";
import { useDispatch } from "react-redux";

const LocationsModel = () => {

    // const dispatchRedux = useDispatch();

    const dispatchRedux: AppDispatchRedux = useDispatch();

    // ********** States ********** 

    const getRowId = useMemo(() => (row: ILocation, index: number) => row?.id.toString() ?? index.toString(), []);
    const [search, setSearch] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<IPartialLocation | null>(null);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] = useState<boolean>(false);

    const toggleIsActiveFeedBackModal = useCallback(() => setIsActiveFeedBackModal(prev => !prev), []);
    const toggleIsActiveDeleteModal = useCallback(() => setIsActiveDeleteModal(prev => !prev), []);
    const toggleIsActiveEditModal = useCallback(() => setIsActiveEditModal(prev => !prev), []);

    const handleOnClickActionDeleteRow = useCallback((row: IPartialLocation) => {
        setSelectedLocation(row);
        setIsActiveDeleteModal(prev => !prev);
    }, []);

    const handleOnClickRowEdit = useCallback((row: IPartialLocation) => {
        setSelectedLocation(row);
        setIsActiveEditModal(prev => !prev);
    }, []);

    // ********** Hooks **********

    const { locations, loadingLocations, refetchLocations } = useAllLocations({ debounce: 500, like: search ?? "" });
    const ExtraComponents = useCallback(() => <ExtraComponentMemo search={search} setSearch={setSearch} />, [search, setSearch]);

    // ********** Functions **********

    const toggleIsActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);

    // ********** ExtraComponents **********

    const actionsRow: RowAction<ILocation>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickActionDeleteRow,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickActionDeleteRow]);

    // ********** Render **********

    const handleCreate = useCallback(async (location: IPartialLocation): Promise<boolean> => {
        try {
            console.log(location);
            await createCompleteLocationInDB({ location });
            refetchLocations();
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: "createCompleteLocation", message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }

            return false;
        }
    }, [dispatchRedux, refetchLocations]);


    const handleDelete = useCallback(async (): Promise<boolean> => {
        if (!selectedLocation) return false;
        try {
            await deleteLocationInDB({ id: selectedLocation.id as number });
            refetchLocations();
            setIsActiveFeedBackModal(prev => !prev);
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: "deleteLocation", message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }
            return false;
        }
    }, [dispatchRedux, selectedLocation, refetchLocations]);

    const handleUpdate = useCallback(async ({ original, update }: { original: IPartialLocation, update: IPartialLocation }): Promise<boolean> => {
        if (!selectedLocation) return false;
        try {
            const originalBase = structuredClone(original);
            const updateBase = structuredClone(update);
            const inventoriesLocationItemsOriginal: IPartialInventoryLocationItem[] = originalBase?.inventories_locations_items ?? [];
            const inventoriesLocationItemsUpdate: IPartialInventoryLocationItem[] = updateBase?.inventories_locations_items ?? [];
            const locationLocationTypeOriginal: IPartialLocationLocationType[] = originalBase?.location_location_type ?? [];
            const locationLocationTypeUpdate: IPartialLocationLocationType[] = updateBase?.location_location_type ?? [];
            const locationProductionLineOriginal: IPartialLocationProductionLine[] = originalBase?.location_production_line ?? [];
            const locationProductionLineUpdate: IPartialLocationProductionLine[] = updateBase?.location_production_line ?? [];

            delete originalBase.inventories_locations_items;
            delete updateBase.inventories_locations_items;
            delete originalBase.location_location_type;
            delete updateBase.location_location_type;
            delete originalBase.location_production_line;
            delete updateBase.location_production_line;

            const diffObjectLocation: IPartialLocation = await diffObjects(originalBase, updateBase);
            const diffObjectInventoriesLocationsItems = await diffObjectArrays(inventoriesLocationItemsOriginal, inventoriesLocationItemsUpdate) as IInventoryLocationItemManager;
            const diffObjectLocationLocationType = await diffObjectArrays(locationLocationTypeOriginal, locationLocationTypeUpdate) as LocationLocationTypeManager;
            const diffObjectLocationProductionLine = await diffObjectArrays(locationProductionLineOriginal, locationProductionLineUpdate) as LocationProductionLineManager;

            const hasChangesInventoriesLocationsItems: boolean = [diffObjectInventoriesLocationsItems.added, diffObjectInventoriesLocationsItems.deleted, diffObjectInventoriesLocationsItems.modified].some((arr: IPartialInventoryLocationItem[]) => arr.length > 0);
            const hasChangesLocationLocationType: boolean = [diffObjectLocationLocationType.added, diffObjectLocationLocationType.deleted, diffObjectLocationLocationType.modified].some((arr: IPartialLocationLocationType[]) => arr.length > 0);
            const hasChangesLocationProductionLine: boolean = [diffObjectLocationProductionLine.added, diffObjectLocationProductionLine.deleted, diffObjectLocationProductionLine.modified].some((arr: IPartialLocationProductionLine[]) => arr.length > 0);

            if (Object.keys(diffObjectLocation).length || hasChangesInventoriesLocationsItems || hasChangesLocationLocationType || hasChangesLocationProductionLine) {
                const updateValues: IPartialLocation = {
                    ...diffObjectLocation,
                    inventories_locations_items_updated: diffObjectInventoriesLocationsItems,
                    location_production_line_updated: diffObjectLocationProductionLine,
                    location_location_type_updated: diffObjectLocationLocationType
                    
                }
                await updateCompleteLocationInDB({ id: selectedLocation?.id as number, location: updateValues });
                refetchLocations();
            }
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: "updateLocation", message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }
            return false;
        }
    }, [dispatchRedux, selectedLocation, refetchLocations]);

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
                enableRowEditClickHandler={handleOnClickRowEdit}
                // extra components
                extraComponents={ExtraComponents}
                rowActions={actionsRow}

                // estilos 
                classNameGenericTableContainer={StyleModule.genericTableContainer}
            />
            {isActiveAddModal && (
                <LocationModuleProvider currentStep={0} totalSteps={2}>
                    <AddWizardLocation
                        onCreate={handleCreate}
                        onClose={toggleIsActiveAddModal}
                    />
                </LocationModuleProvider>
            )}
            {isActiveEditModal &&
                <LocationModuleProvider totalSteps={3} currentStep={2} data={selectedLocation ?? undefined}>
                    <EditWizardLocation onClose={toggleIsActiveEditModal} onUpdate={handleUpdate} />
                </LocationModuleProvider>
            }
            {isActiveDeleteModal && <DeleteModal
                title={"¿Seguro que desea eliminar esta ubicación?"}
                message={"Este proceso no se puede deshacer."}
                onClose={toggleIsActiveDeleteModal}
                onDelete={handleDelete}
            />}
            {isActiveFeedBackModal && <FeedBackModal
                onClose={toggleIsActiveFeedBackModal}
                title={"La ubicación se ha eliminado correctamente"}
                icon={<CircleCheck className={StyleModule.iconFeedBackModal} />}
            />}
        </div>
    )
}

export default LocationsModel;


interface IExtraComponentProps {
    search: string | null,
    setSearch: (value: string | null) => void
}

const ExtraComponent = ({ search, setSearch }: IExtraComponentProps) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

    const handleClearFilters = useCallback(() => dispatch(reset_column_filters()), [dispatch]);
    const handleExportTable = useCallback(() => { console.log("exporting table") }, []);

    return (
        <div className={StyleModule.containerExtraComponents}>
            <div className={StyleModule.searchSection}>
                <InputTextCustom
                    value={search ?? ""}
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
}

const ExtraComponentMemo = memo(ExtraComponent) as typeof ExtraComponent;