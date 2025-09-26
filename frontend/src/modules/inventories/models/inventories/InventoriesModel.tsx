import { useEffect, useState, type ReactNode } from "react";
import type { AppDispatchRedux } from "../../../../store/store";
import type { IInventoryDetails, IPartialInventoryDetails } from "../../../../interfaces/inventories";
import GenericTable from "../../../../components/ui/table/tableContext/GenericTable";
import { useDispatch } from "react-redux";
import { columnsInventoryDetails } from "./structure/columns.tsx"
import { fetchInventoriesDetailsFromDB } from "../../../../queries/inventoriesQueries"
import { createInventoryMovementInDB } from "../../../../queries/inventoryMovementsQueries"
import type { RowAction } from "../../../../components/ui/table/types";
import { Plus, Search, Eraser, Download, Pencil, Check, CircleCheck } from "lucide-react";
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
import { createInventoryInBatchDB } from "../../../../modelos/inventories/query/inventoriesQueries.ts";
import OptionsModal from "./modals/options/OptionsModal.tsx";
import AddModal from "./modals/options/operations/add/AddModal.tsx";
import RemoveModal from "./modals/options/operations/remove/RemoveModal.tsx";
import TransferModal from "./modals/options/operations/transfer/TransferModal.tsx";
import FeedBackModal from "../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal.tsx";
import { createScrapInDB } from "../../../../modelos/scrap/query/scrapQueries.ts";
import type { IPartialScrap } from "../../../../interfaces/scrap";

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

    const [isActiveAddBatchModal, setIsActiveAddBatchModal] =
        useState<boolean>(false);
    const [isActiveOptionsModal, setIsActiveOptionsModal] =
        useState<boolean>(false);
    const [isActiveTransferModal, setIsActiveTransferModal] =
        useState<boolean>(false);
    const [isActiveRemoveModal, setIsActiveRemoveModal] =
        useState<boolean>(false);
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] =
        useState<boolean>(false);
    const [feedbackNode, setFeedbackNode] =
        useState<ReactNode>(null);


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

    const handleCreateBatch = async (inventory: IPartialInventoryDetails[]) => {
        setLoading(true);
        try {
            const response = await createInventoryInBatchDB(
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

    const handleStockIn = async (inventory: IPartialInventoryMovement) => {
        setLoading(true);
        try {
            const response = await createInventoryMovementInDB(
                inventory,
                dispatch
            );
            if (!response) {
                return;
            }
            const messageStockIn = (
                <h2 className={`nunito-bold ${StyleModule.feedBackMessage}`}>
                        Se han agregado a tu inventario{" "}
                        <span>{inventory.qty}</span>{" "}
                        unidades de{" "}
                        <span>{inventory.item_name}</span>{" "}
                        a{" "}
                        <span>{inventory.location_name}</span>{" "}
                </h2>
            );
            setServerError(null);
            fetchs();
            setIsActiveAddModal(false);
            setFeedbackNode(messageStockIn);
            toggleActiveFeedBackModal();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStockOut = async (scrap: IPartialScrap) => {
        setLoading(true);
        try {
            const response = await createScrapInDB(
                scrap,
                dispatch
            );
            if (!response) {
                return;
            }
            const messageScrap = (
                <h2 className={`nunito-bold ${StyleModule.feedBackMessage}`}>
                        Se han dado de baja{" "}
                        <span>{scrap.qty}</span>{" "}
                        unidades de{" "}
                        <span>{scrap.item_name}</span>{" "}
                        a la{" "}
                        <span>{scrap.location_name}</span>{" "}
                </h2>
            );
            setServerError(null);
            fetchs();
            setIsActiveRemoveModal(false);
            setFeedbackNode(messageScrap);
            toggleActiveFeedBackModal();
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
            const response = await createInventoryTransferInDB(
                transfer,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveTransferModal(false);
            const messageTransfer = (
                <h2 className={`nunito-bold ${StyleModule.feedBackMessage}`}>
                    Se ha programado el movimiento de inventario de{" "}
                    <span>{transfer.qty}</span>{" "}
                    unidades de{" "}
                    <span>{transfer.item_name}</span>{" "}
                    de{" "}
                    <span>{transfer.source_location?.name}</span>{" "}
                    a{" "}
                    <span>{transfer.destination_location?.name}</span>.
                </h2>
            );
            setFeedbackNode(messageTransfer);
            toggleActiveFeedBackModal();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const toggleActiveAddBatchModal = () => {
        setServerError(null);
        setIsActiveAddBatchModal(!isActiveAddBatchModal);
    }

    const toggleActiveOptionsModalSetup = (inventory: IInventoryDetails) => {
        setServerError(null);
        setInventoriesRecord(inventory);
        setIsActiveOptionsModal(!isActiveOptionsModal);
    }

    const toggleActiveOptionsModal = () => {
        setServerError(null);
        setIsActiveOptionsModal(!isActiveOptionsModal);
    }

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
        if (isActiveOptionsModal) {
            setIsActiveOptionsModal(false);
            return;
        }
    }

    const toggleActiveRemoveModal = () => {
        setServerError(null);
        setIsActiveRemoveModal(!isActiveRemoveModal);
        if (isActiveOptionsModal) {
            setIsActiveOptionsModal(false);
            return;
        }
    }

    const toggleActiveTransferModal = () => {
        setServerError(null);
        setIsActiveTransferModal(!isActiveTransferModal);
        if (isActiveOptionsModal) {
            setIsActiveOptionsModal(false);
            return;
        }
    }

    const toggleActiveFeedBackModal = () => {
        setServerError(null);
        if (feedbackNode) {
            setFeedbackNode(null);
        }
        setIsActiveFeedBackModal(!isActiveFeedBackModal);
    }

    const rowActions: RowAction<IInventoryDetails>[] = [
        {
            label: "Editar",
            onClick: (row) => toggleActiveOptionsModalSetup(row),
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
                        onClick={toggleActiveAddBatchModal}
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
                getRowId={
                    (row: IInventoryDetails) =>
                        `temp-inv_id-${row.inventory_id.toString()}` +
                        `-locationId-${row?.location_id?.toString()}` +
                        `-prod_id-${row?.item_type?.toString()}` +
                        `${row?.item_type?.toString()}`}
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
                classNameGenericTableContainer={StyleModule.containerGenericTableContainer}

            />
            {
                isActiveAddBatchModal &&
                <InventoriesModuleProvider
                    initialStep={1}
                    totalSteps={3}
                >
                    <AddInventoryModal
                        onClose={toggleActiveAddBatchModal}
                        onCreate={handleCreateBatch}
                    />
                </InventoriesModuleProvider>
            }
            {
                isActiveOptionsModal &&
                <OptionsModal
                    onClose={toggleActiveOptionsModal}
                    inventory={inventoriesRecord as IInventoryDetails}
                    toggleAddModal={toggleActiveAddModal}
                    toggleRemoveModal={toggleActiveRemoveModal}
                    toggleTransferModal={toggleActiveTransferModal}
                />
            }
            {
                isActiveAddModal &&
                <AddModal
                    onClose={toggleActiveAddModal}
                    inventory={inventoriesRecord as IInventoryDetails}
                    onAdd={handleStockIn}
                />
            }
            {
                isActiveRemoveModal &&
                <RemoveModal
                    onClose={toggleActiveRemoveModal}
                    inventory={inventoriesRecord as IInventoryDetails}
                    onRemove={handleStockOut}
                />
            }
            {
                isActiveTransferModal &&
                <TransferModal
                    onClose={toggleActiveTransferModal}
                    inventory={inventoriesRecord as IInventoryDetails}
                    onTransfer={handleTransfer}
                />
            }
            {
                isActiveFeedBackModal &&
                <FeedBackModal
                    onClose={toggleActiveFeedBackModal}
                    icon={<CircleCheck />}
                    messageCustom={
                        feedbackNode
                    }
                />
            }
        </div>
    );
}

export default InventoriesModel;