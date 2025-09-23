import { useEffect, useState } from "react";
import type { AppDispatchRedux } from "../../../../store/store";
import type { IInventoryDetails } from "../../../../interfaces/inventories";
import GenericTable from "../../../../components/ui/table/tableContext/GenericTable";
import { useDispatch } from "react-redux";
import { columnsInventoryDetails } from "./structure/columns.tsx"
import { fetchInventoriesDetailsFromDB } from "../../../../queries/inventoriesQueries"
import { createInventoryMovementInDB } from "../../../../queries/inventoryMovementsQueries"
import type { RowAction } from "../../../../components/ui/table/types";
import { Plus, Search, Eraser, Download, Pencil } from "lucide-react";
import type { IPartialInventoryMovement } from "../../../../interfaces/inventoyMovements";
import type { IPartialInventoryTransfer } from "../../../../interfaces/inventoryTransfer";
import { createInventoryTransferInDB } from "../../../../queries/inventoryTransferQueries";
import { useTableDispatch, useTableState } from "../../../../components/ui/table/tableContext/tableHooks";
import StyleModule from "./InventoriesModel.module.css";
import InvertOnHoverButton from "../../../../components/ui/table/components/gui/button/Invert-on-hover-button/InvertOnHoverButton";
import FadeButton from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import InputSearch from "../../../../components/ui/table/components/gui/input/input-text-search/input";
import { reset_column_filters } from "../../../../components/ui/table/tableContext/tableActions";
import type { Table } from "@tanstack/react-table";
import AddInventoryModal from "./wizards/add/AddInventoryModal.tsx";
import InventoriesModuleProvider from "./context/InventoriesModuleProvider.tsx"

const InventoriesModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [inventories, setInventories] =
        useState<IInventoryDetails[]>([])
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [
        inventoriesRecord,
        setInventoriesRecord
    ] = useState<IInventoryDetails | null>(null);

    // const [isActiveStockInModal, setIsActiveStockInModal] =
    //     useState<boolean>(false);
    // const [isActiveStockOutModal, setIsActiveStockOutModal] =
    //     useState<boolean>(false);
    // const [isActiveTransferModal, setIsActiveTransferModal] =
    //     useState<boolean>(false);
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchInventoriesDetailsFromDB(dispatch);
            if (response.length > 0) {
                setInventories(response);
            } else {
                setInventories([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStockIn = async (inventory: IPartialInventoryMovement) => {
        setLoading(true);
        try {
            console.log(inventory);

            const response = await createInventoryMovementInDB(
                inventory,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStockOut = async (inventory: IPartialInventoryMovement) => {
        setLoading(true);
        try {
            console.log(inventory);
            const response = await createInventoryMovementInDB(
                inventory,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleTransfer = async (transfer: IPartialInventoryTransfer) => {
        setLoading(true);
        try {

            console.log(transfer);
            const response = await createInventoryTransferInDB(
                transfer,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // const toggleActiveTransferModal = () => {
    //     setServerError(null);
    //     console.log("entro");
    //     setIsActiveTransferModal(!isActiveTransferModal);
    // }

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    }

    // const toggleActiveStockInModal = (record: IInventoryDetails) => {
    //     setServerError(null);
    //     setInventoriesRecord(record);
    //     setIsActiveStockInModal(!isActiveStockInModal);
    // }

    // const toggleActiveStockOutModal = (record: IInventoryDetails) => {
    //     setServerError(null);
    //     setInventoriesRecord(record);
    //     setIsActiveStockOutModal(!isActiveStockOutModal);
    // }

    const rowActions: RowAction<IInventoryDetails>[] = [
        {
            label: "Editar",
            onClick: toggleActiveAddModal,
            icon: <Pencil className={StyleModule.pencilIconRowActions} />
        },
    ];

    const ExtraComponents = (table: Table<IInventoryDetails>) => {
        const state = useTableState();
        const dispatch = useTableDispatch();
        return (
            <div
                className={StyleModule.containerExtraComponents}
            >
                <div
                    className={`nunito-medium ${StyleModule.firstBlock}`}
                >
                    <h1 className="nunito-bold">Inventario</h1>
                    <FadeButton
                        label="Agregar inventario"
                        onClick={toggleActiveAddModal}
                        icon={<Plus className={StyleModule.plusIconShippingOrderModel} />}
                        typeOrderIcon="first"
                        classNameButton={StyleModule.fadeButtonExtraComponents}
                        classNameSpan={StyleModule.fadeButtonSpanExtraComponents}
                    />
                </div>
                <div
                    className={`nunito-semibold ${StyleModule.secondBlock}`}
                >
                    <InputSearch
                        type="text"
                        placeholder="Buscar"
                        value={""}
                        onChange={(e) => console.log(e.target.value)}
                        icon={<Search className={StyleModule.searchIconExtraComponents} />}
                        classNameContainer={StyleModule.InputSearchContainerExtraComponents}
                        classNameInput={StyleModule.InputSearchInputExtraComponents}
                        classNameButton={StyleModule.InputSearchButtonExtraComponents}
                    />
                    <div
                        className={`nunito-medium ${StyleModule.containerButtons}`}
                    >
                        <InvertOnHoverButton
                            label="Limpiar filtros"
                            onClick={() => {
                                console.log("clear filters")
                                console.log(state.columnFiltersState)
                                console.log(state.columnFiltersState.length <= 0)
                                dispatch(reset_column_filters())
                            }}
                            disabled={state.columnFiltersState.length <= 0}
                            icon={<Eraser className={StyleModule.trash2IconExtraComponents} />}
                            typeOrderIcon="first"
                            classNameButton={StyleModule.toggleInverseButtonExtraComponents}
                            classNameSpan={StyleModule.toggleInverseButtonSpanExtraComponents}
                            classNameLabel={StyleModule.toggleInverseButtonLabelExtraComponents}
                        />
                        <InvertOnHoverButton
                            label="Exportar tabla"
                            onClick={() => console.log("exporting table")}
                            icon={<Download className={StyleModule.downloadIconExtraComponents} />}
                            typeOrderIcon="first"
                            classNameButton={StyleModule.toggleInverseButtonExtraComponents}
                            classNameSpan={StyleModule.toggleInverseButtonSpanExtraComponents}
                            classNameLabel={StyleModule.toggleInverseButtonLabelExtraComponents}
                        />
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <div className={StyleModule.containerInventoriesModel}>
            <GenericTable
                modelName="Inventories"

                // distribucion de columnas y 
                columns={columnsInventoryDetails}
                data={inventories}
                getRowId={(
                    row: IInventoryDetails,
                ) => `temp-inv_id-${row.inventory_id.toString()}-locationId-${row?.location_id?.toString()}-prod_id-${row?.item_type?.toString()}${row?.item_type?.toString()}`}

                // funcionalidades habilitadas
                enableFilters={true}
                enablePagination={true}
                enableRowSelection={false}
                enableOptionsColumn={true}

                // acciones de la tabla
                onDeleteSelected={() => console.log("Delete selected")}
                typeRowActions="icon"
                rowActions={rowActions}

                // componentes extra
                extraComponents={(table) => ExtraComponents(table)}

                // estilos
                classNameGenericTableContainer={StyleModule.containerGenericTableContainer}

            />
            {/* {
                isActiveStockInModal && < StockInModal
                    onClose={setIsActiveStockInModal}
                    onStockIn={(value) => handleStockIn(value)}
                    record={inventoriesRecord}
                />
            }
            {
                isActiveStockOutModal && <StockOutModal
                    onClose={setIsActiveStockOutModal}
                    onStockOut={(value) => handleStockOut(value)}
                    record={inventoriesRecord}
                />
            }
            {
                isActiveTransferModal && <TransferModal
                    onClose={setIsActiveTransferModal}
                    onTransfer={(value) => handleTransfer(value)}
                />
            } */}
            {
                isActiveAddModal &&
                <InventoriesModuleProvider
                    initialStep={1}
                    totalSteps={2}
                >
                    <AddInventoryModal
                        onClose={() => setIsActiveAddModal(false)}
                    />
                </InventoriesModuleProvider>
            }
        </div>
    );
}

export default InventoriesModel;