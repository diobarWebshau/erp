import { createCompleteClientInDB, updateCompleteClientInDB, deleteClientInDB } from "../../../modelos/clients/queries/clientsQueries";
import type { IPartialProductDiscountClient, IProductDiscountClientManager } from "../../../interfaces/product-discounts-clients";
import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useTableDispatch, useTableState } from "../../../comp/primitives/table/tableContext/tableHooks";
import type { IClientAddressesManager, IPartialClientAddress } from "../../../interfaces/clientAddress";
import { diffObjectArrays, diffObjects } from "../../../utils/validation-on-update/ValidationOnUpdate2";
import FeedBackModal from "../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import { deepNormalizeDecimals } from "../../../utils/fromatted_decimals_mysql/deepNormalizeDecimals";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import GenericTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import DeleteModal from "../../../comp/primitives/modal/deleteModal/DeleteModal"
import type { IClient, IPartialClient } from "../../../interfaces/clients";
import { Search, Download, Eraser, PlusIcon, Trash2, CircleCheck } from "lucide-react";
import ToastMantine from "../../../comp/external/mantine/toast/base/ToastMantine";
import useClients from "../../../modelos/clients/react-hooks/useClients";
import type { RowAction } from "../../../components/ui/table/types";
import ClientModuleProvider from "../context/clientModuleProvider";
import EditWizardClients from "./wizards/edit/EditWizardClients";
import { defaultValueClient } from "../../../interfaces/clients";
import AddWizardClients from "./wizards/add/AddWizardClients";
import type { IApiError } from "../../../interfaces/errorApi";
import { setError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import { memo, useCallback, useMemo, useState } from "react";
import StyleModule from "./ClientsModel.module.css";
import ColumnsClients from "./structure/columns";
import { useDispatch } from "react-redux";

const ClientsModel = () => {

    const dispatchRedux: AppDispatchRedux = useDispatch();

    const [clientsRecord, setClientsRecord] = useState<IClient>(defaultValueClient);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] = useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);
    const [search, setSearch] = useState<string | null>(null);
    const getRowId = useMemo(() => (row: IClient) => row?.id.toString(), [])
    const { clients, loadingClients, refetchClients } = useClients({ like: search ?? "", debounce: 500 })

    const toggleActiveEditModalSetup = useCallback((record: IClient) => {
        setClientsRecord(record);
        setIsActiveEditModal(prev => !prev);
    }, []);
    const toggleActiveDeleteModalSetup = useCallback((record: IClient) => {
        setClientsRecord(record);
        setIsActiveDeleteModal(true);
    }, []);

    const toggleIsActiveFeedBackModal = useCallback(() => setIsActiveFeedBackModal(prev => !prev), []);
    const toggleActiveEditModal = useCallback(() => setIsActiveEditModal(prev => !prev), []);
    const toggleActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);
    const toggleActiveDeleteModal = useCallback(() => setIsActiveDeleteModal(prev => !prev), []);

    const rowActions: RowAction<IClient>[] = [{
        label: "Eliminar",
        onClick: toggleActiveDeleteModalSetup,
        icon: <Trash2 className={StyleModule.iconRowDeleteAction} />
    }];

    const handleDelete = useCallback(async (): Promise<boolean> => {
        if (!clientsRecord?.id) return false;
        try {
            await deleteClientInDB({ id: clientsRecord?.id as number });
            refetchClients();
            setIsActiveFeedBackModal(prev => !prev);
            return true;
        } catch (err: unknown) {
            if (err instanceof Error)
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            else {
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
    }, [clientsRecord, refetchClients, dispatchRedux]);

    const handleCreate = useCallback(async (record: IPartialClient) => {
        try {
            await createCompleteClientInDB({ client: record });
            refetchClients();
            return true;
        } catch (err: unknown) {
            if (err instanceof Error)
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            else {
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
    }, [refetchClients, dispatchRedux]);

    const handleUpdate = useCallback(async ({ original, updated }: { original: IPartialClient, updated: IPartialClient }) => {
        if (!clientsRecord?.id) return false;
        try {
            // obtenemos la entidad base original y la entidad base actualizada
            const baseOriginal = deepNormalizeDecimals(structuredClone(original), ["discount_percentage"]);
            const baseUpdated = deepNormalizeDecimals(structuredClone(updated), ["discount_percentage"]);

            // obtenemos las relaciones de la entidad base original y la entidad base actualizada
            const original_pdc: IPartialProductDiscountClient[] = baseOriginal.product_discounts_client ?? [];
            const updated_pdc: IPartialProductDiscountClient[] = baseUpdated.product_discounts_client ?? [];
            const original_addresses: IPartialClientAddress[] = baseOriginal.addresses ?? [];
            const updated_addresses: IPartialClientAddress[] = baseUpdated.addresses ?? [];

            // eliminamos las relaciones de la entidad base(original y actualizada)
            delete baseOriginal.product_discounts_client;
            delete baseUpdated.product_discounts_client;
            delete baseOriginal.addresses;
            delete baseUpdated.addresses;

            // Obtenemos las diferencias de la entidad base(original y actualizada)
            const diffObject = await diffObjects(baseOriginal, baseUpdated);

            // Obtenemos las diferencias entre las relaciones de la entidad base con respecto a sus demas relaciones
            const diffObjectPDC: IProductDiscountClientManager = await diffObjectArrays(original_pdc, updated_pdc);
            const diffObjectAddresses: IClientAddressesManager = await diffObjectArrays(original_addresses, updated_addresses);

            // verificamos si existe cambios tanto en la entidad base como en sus relaciones 

            const hasChangesPDC: boolean = [
                diffObjectPDC.added,
                diffObjectPDC.deleted,
                diffObjectPDC.modified
            ].some((arr: IPartialProductDiscountClient[]) => arr.length > 0);

            const hasChangesAddresses: boolean = [
                diffObjectAddresses.added,
                diffObjectAddresses.deleted,
                diffObjectAddresses.modified
            ].some((arr: IPartialClientAddress[]) => arr.length > 0);

            const hasChangesBase: boolean = (Object.keys(diffObject).length > 0);

            // Si existen cambios, se ejecuta la siguiente logica
            if (hasChangesBase || hasChangesPDC || hasChangesAddresses) {
                // creamos el objeto de actualizacion
                const update_values: IPartialClient = {
                    ...diffObject,
                    product_discounts_client_manager: diffObjectPDC,
                    addresses_update: diffObjectAddresses
                }
                // actualizamos el cliente en la base de datos
                await updateCompleteClientInDB({ id: clientsRecord.id, client: update_values });
                // refrescamos la lista de clientes
                refetchClients();
            }
            return true;
        } catch (err: unknown) {
            if (err instanceof Error)
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            else {
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
    }, [dispatchRedux, clientsRecord, refetchClients]);

    const ExtraComponents = useCallback(() => <ExtraComponent search={search ?? ""} setSearch={setSearch} />, [search]);

    return (
        <div className={StyleModule.clientsModelContainer}>
            <div className={StyleModule.clientsModelHeader}>
                <h1 className='nunito-bold'>Clientes</h1>
                <MainActionButtonCustom
                    icon={<PlusIcon />}
                    label="Cliente"
                    onClick={toggleActiveAddModal}
                />
            </div>
            <GenericTableMemo
                /* modelo e identificador */
                modelName="client"
                getRowId={getRowId}

                /* data y columnas */
                columns={ColumnsClients}
                data={clients}
                isLoadingData={loadingClients}

                /* funcionalidades */
                enablePagination
                enableFilters
                enableSorting
                enableOptionsColumn
                enableRowEditClick
                typeRowActions='icon'
                noResultsMessage="No se encontraron clientes o no existen clientes que coincidan con la búsqueda"

                /* Extracomponents */
                extraComponents={ExtraComponents}

                /* acciones al hacer click en la fila */
                enableRowEditClickHandler={toggleActiveEditModalSetup}

                /* acciones de filas */
                rowActions={rowActions}

                classNameGenericTableContainer={StyleModule.genericTableContainer}
            />
            {isActiveDeleteModal && (
                <DeleteModal
                    title="¿Estás seguro de eliminar este cliente?"
                    message="Esta acción no se puede deshacer."
                    onClose={toggleActiveDeleteModal}
                    onDelete={handleDelete}
                />)
            }
            {isActiveAddModal && (
                <ClientModuleProvider totalSteps={3} currentStep={0} >
                    <AddWizardClients onClose={toggleActiveAddModal} onCreate={handleCreate} />
                </ClientModuleProvider>
            )}
            {isActiveEditModal && (
                <ClientModuleProvider totalSteps={3} currentStep={2} data={clientsRecord}>
                    <EditWizardClients onClose={toggleActiveEditModal} onUpdate={handleUpdate} />
                </ClientModuleProvider>
            )}
            {isActiveDeleteModal && (
                <DeleteModal
                    title="¿Estás seguro de eliminar este cliente?"
                    message="Esta acción no se puede deshacer."
                    onClose={toggleActiveDeleteModal}
                    onDelete={handleDelete}
                />
            )}
            {isActiveFeedBackModal && <FeedBackModal
                onClose={toggleIsActiveFeedBackModal}
                title={"El cliente se ha eliminado correctamente"}
                icon={<CircleCheck className={StyleModule.iconFeedBackModal} />}

            />}
        </div>
    );

};

export default ClientsModel;

interface IExtraComponentProp {
    search: string,
    setSearch: (value: string) => void
}

const ExtraComponent = memo(({ search, setSearch }: IExtraComponentProp) => {

    const state = useTableState();
    const dispatch = useTableDispatch();
    const handleClearFilters = useCallback(() => dispatch(reset_column_filters()), [dispatch]);
    const handleExportTable = useCallback(() => console.log("exporting table"), []);

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
});