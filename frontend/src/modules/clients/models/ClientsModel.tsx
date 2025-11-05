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

const ClientsModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [loading, setLoading] =
        useState<boolean>(false);
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [clientsRecord, setClientsRecord] =
        useState<IClient>(defaultValueClient);
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [search, setSearch] = useState<string>("");

    const getRowId = useMemo(() => (row: IClient) => row?.id.toString(), [])
    const { clients, loadingClients } = useClients({ like: search, debounce: 500 })

    const toggleActiveEditModal = useCallback((record: IClient) => {
        setServerError(null);
        setClientsRecord(record);
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

    }, []);

    const handleCreate = useCallback(async ({
        original,
        updated
    }: { original: IPartialClient, updated: IPartialClient }) => {
        console.log(original, updated)
    }, []);

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
                enableRowEditClickHandler={toggleActiveEditModal}

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
        </div>
    );

};

export default ClientsModel;