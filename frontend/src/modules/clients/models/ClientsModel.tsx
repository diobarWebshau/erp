import GenericTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import type { RowAction } from "../../../components/ui/table/types";
import type { IClient, IPartialClient } from "../../../interfaces/clients";
import type { AppDispatchRedux } from "../../../store/store";
import { useDispatch } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { defaultValueClient } from "../../../interfaces/clients";
import ColumnsClients from "./structure/columns";
import { Search, Download, Eraser, PlusIcon, Trash2 } from "lucide-react";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import { useTableDispatch, useTableState } from "../../../comp/primitives/table/tableContext/tableHooks";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import StyleModule from "./ClientsModel.module.css";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import useClients from "../../../modelos/clients/react-hooks/useClients";
import DeleteModal from "../../../comp/primitives/modal/deleteModal/DeleteModal"
import ClientModuleProvider from "../context/clientModuleProvider";
import AddWizardClients from "./wizards/add/AddWizardClients";
import { createCompleteClientInDB, updateCompleteClientInDB } from "../../../queries/clientsQueries";
import EditWizardClients from "./wizards/edit/EditWizardClients";
import type { IPartialProductDiscountClient, IProductDiscountClientManager } from "../../../interfaces/product-discounts-clients";
import type { IClientAddressesManager, IPartialClientAddress } from "../../../interfaces/clientAddress";
import { diffObjectArrays, diffObjects } from "../../../utils/validation-on-update/ValidationOnUpdate2";
import { deleteClientInDB } from "../../../modelos/clients/queries/clientsQueries";

const ClientsModel = () => {

    const dispatch: AppDispatchRedux = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [clientsRecord, setClientsRecord] = useState<IClient>(defaultValueClient);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] = useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const getRowId = useMemo(() => (row: IClient) => row?.id.toString(), [])
    const { clients, loadingClients, refetchClients } = useClients({ like: search, debounce: 500 })

    const toggleActiveEditModalSetup = useCallback((record: IClient) => {
        setServerError(null);
        setClientsRecord(record);
        setIsActiveEditModal(prev => !prev);
    }, []);

    const toggleActiveEditModal = useCallback(() => {
        setServerError(null);
        setIsActiveEditModal(prev => !prev);
    }, []);

    const toggleActiveDeleteModal = useCallback(() => {
        setServerError(null);
        setIsActiveDeleteModal(prev => !prev);
    }, []);

    const toggleActiveDeleteModalSetup = useCallback((record: IClient) => {
        setServerError(null);
        setClientsRecord(record);
        setIsActiveDeleteModal(true);
    }, []);

    const toggleActiveAddModal = useCallback(() => {
        setServerError(null);
        setIsActiveAddModal(prev => !prev);
    }, []);

    const rowActions: RowAction<IClient>[] = [
        {
            label: "Eliminar",
            onClick: toggleActiveDeleteModalSetup,
            icon: <Trash2 className={StyleModule.iconRowDeleteAction} />
        },
    ];

    const handleDelete = useCallback(async () => {
        if (!clientsRecord?.id) {
            return;
        }
        setLoading(true);
        try {
            const response = await deleteClientInDB(
                clientsRecord?.id,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            refetchClients();
            toggleActiveDeleteModal();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [clientsRecord, refetchClients, dispatch]);


    const handleCreate = useCallback(async (record: IPartialClient) => {
        setLoading(true);
        try {
            const response = await createCompleteClientInDB(record, dispatch);
            if (!response) {
                return;
            }
            setServerError(null);
            refetchClients();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [dispatch, refetchClients]);


    const handleUpdate = useCallback(async ({ original, updated }: { original: IPartialClient, updated: IPartialClient }) => {
        setLoading(true);
        try {

            // obtenemos la entidad base original y la entidad base actualizada
            const baseOriginal = { ...original, };
            const baseUpdated = { ...updated };

            // obtenemos las relaciones de la entidad base original y la entidad base actualizada
            const original_pdc: IPartialProductDiscountClient[] =
                baseOriginal.product_discounts_client?.map(it => ({ ...it, discount_percentage: Number(it.discount_percentage) })) ?? [];
            const updated_pdc: IPartialProductDiscountClient[] =
                baseUpdated.product_discounts_client?.map(it => ({ ...it, discount_percentage: Number(it.discount_percentage) })) ?? [];
            const original_addresses: IPartialClientAddress[] =
                baseOriginal.addresses ?? [];
            const updated_addresses: IPartialClientAddress[] =
                baseUpdated.addresses ?? [];

            // eliminamos las relaciones de la entidad base(original y actualizada)
            delete baseOriginal.product_discounts_client;
            delete baseUpdated.product_discounts_client;
            delete baseOriginal.addresses;
            delete baseUpdated.addresses;

            // Obtenemos las diferencias de la entidad base(original y actualizada)
            const diffObject = await diffObjects(baseOriginal, baseUpdated);

            // Obtenemos las diferencias entre las relaciones de la entidad base con respecto a sus demas relaciones
            const diffObjectPDC: IProductDiscountClientManager =
                await diffObjectArrays(original_pdc, updated_pdc);
            const diffObjectAddresses: IClientAddressesManager =
                await diffObjectArrays(original_addresses, updated_addresses);

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
                const object_update: IPartialClient = {
                    ...diffObject,
                    product_discounts_client_manager: diffObjectPDC,
                    addresses_update: diffObjectAddresses
                }

                // actualizamos el cliente en la base de datos
                const response = await updateCompleteClientInDB(
                    clientsRecord?.id,
                    object_update,
                    dispatch
                );

                // verificamos si la actualizacion fue exitosa
                if (!response) {
                    return;
                }

                // refrescamos la lista de clientes
                refetchClients();
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [dispatch, refetchClients, clientsRecord]);

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
            {
                isActiveDeleteModal && (
                    <DeleteModal
                        title="¿Estás seguro de eliminar este cliente?"
                        message="Esta acción no se puede deshacer."
                        onClose={toggleActiveDeleteModal}
                        onDelete={handleDelete}
                    />
                )
            }
            {
                isActiveAddModal && (
                    <ClientModuleProvider totalSteps={3} currentStep={0} >
                        <AddWizardClients onClose={toggleActiveAddModal} onCreate={handleCreate} />
                    </ClientModuleProvider>
                )
            }
            {
                isActiveEditModal && (
                    <ClientModuleProvider totalSteps={3} currentStep={2} data={clientsRecord}>
                        <EditWizardClients onClose={toggleActiveEditModal} onUpdate={handleUpdate} />
                    </ClientModuleProvider>
                )
            }
            {
                isActiveDeleteModal && (
                    <DeleteModal
                        title="¿Estás seguro de eliminar este cliente?"
                        message="Esta acción no se puede deshacer."
                        onClose={toggleActiveDeleteModal}
                        onDelete={handleDelete}
                    />
                )
            }
        </div>
    );

};

export default ClientsModel;