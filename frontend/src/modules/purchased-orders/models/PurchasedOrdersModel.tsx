import { deletePurchasedOrderInDB, updatePurchasedOrderInDB, createBatchPurchasedOrderInDB } from "../../../modelos/purchased_orders/queries/purchaseOrderQueries";
import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import type { RowAction, TableAction, TableState } from "../../../comp/primitives/table/tableContext/tableTypes";
import { diffObjects, diffObjectArrays } from "../../../utils/validation-on-update/ValidationOnUpdate2";
import useAllPurchasedOrder from "./../../../modelos/purchased_orders/hooks/useAllPurchasedOrder"
import type { IPurchasedOrderProductManager } from "../../../interfaces/purchasedOrdersProducts";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import GenericTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import type { IPartialPurchasedOrder } from "../../../interfaces/purchasedOrder";
import DeleteModal from "../../../comp/primitives/modal/deleteModal/DeleteModal";
import { Download, Eraser, PlusIcon, Search, Trash2 } from "lucide-react";
import ModalEditGeneric from "./wizards/edit2/context/ModalEditGeneric";
import ModalAddGeneric from "./wizards/add2/context/ModalAddGeneric";
import { memo, useCallback, useState, type Dispatch } from "react";
import type { AppDispatchRedux } from "../../../store/store";
import { columnsPurchasedOrders } from "./structure/columns"
import StyleModule from "./PurchasedOrdersModel.module.css";
import type { Table } from "@tanstack/react-table";
import { useDispatch } from "react-redux";

const PurchasedOrderModel = () => {

    const dispatch: AppDispatchRedux = useDispatch();
    const [purchasedOrderRecord, setPurchasedOrderRecord] = useState<IPartialPurchasedOrder | null>(null);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] = useState<boolean>(false);
    const [search, setSearch] = useState<string | null>(null);
    const toggleIsActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);

    const closeDeleteModal = useCallback(() => setIsActiveDeleteModal(false), []);
    const openDeleteModal = useCallback(() => setIsActiveDeleteModal(true), []);

    const { purchasedOrders, loadingPurchasedOrder, refetchPurchasedOrder } = useAllPurchasedOrder({ debounce: 500, like: search ?? "" });


    // * ******************** Funciones de operaciones CRUD ******************** 

    const handleCreate = async (purchased: IPartialPurchasedOrder) => {
        try {
            const response = await createBatchPurchasedOrderInDB(purchased, dispatch);
            if (response) {
                setPurchasedOrderRecord(response);
                refetchPurchasedOrder();
                return;
            }
        } catch (error) {
            if (error instanceof Error) console.log(error);
        }
    };

    const handleUpdate = useCallback(async ({ original, update }: { original: IPartialPurchasedOrder, update: IPartialPurchasedOrder }): Promise<boolean> => {
        if (!purchasedOrderRecord?.id) return false;
        try {
            const originalBase = structuredClone(original);
            const updateBase = structuredClone(update);

            const originalPurchaseOrderProducts = original?.purchase_order_products ?? [];
            const updatePurchaseOrderProducts = update?.purchase_order_products ?? [];

            delete originalBase.purchase_order_products;
            delete updateBase.purchase_order_products;

            const diff_purchased_order: IPartialPurchasedOrder = await diffObjects(originalBase, updateBase);
            const productDiffs: IPurchasedOrderProductManager = await diffObjectArrays(originalPurchaseOrderProducts, updatePurchaseOrderProducts);

            const hasChangesProducts: boolean = [
                productDiffs.added,
                productDiffs.deleted,
                productDiffs.modified
            ].some((p) => p.length);

            if (Object.keys(diff_purchased_order).length > 0 || hasChangesProducts) {

                const new_purchased_order: IPartialPurchasedOrder = {
                    ...diff_purchased_order,
                    purchase_order_product_manager: productDiffs
                };
                const response = await updatePurchasedOrderInDB(
                    purchasedOrderRecord?.id as number,
                    new_purchased_order,
                    dispatch
                );

                if (response) {
                    refetchPurchasedOrder();
                }
            }
            return true;
        } catch (error) {
            if (error instanceof Error) console.log(error);
            return false;
        }
    }, [dispatch, purchasedOrderRecord, refetchPurchasedOrder])

    const handleDelete = useCallback(async (): Promise<boolean> => {
        if (!purchasedOrderRecord?.id) return false;
        try {
            const response = await deletePurchasedOrderInDB(purchasedOrderRecord.id as number, dispatch);
            if (!response) {
                return false;
            }
            refetchPurchasedOrder();
            // 👇 ESTO ES LO QUE TE FALTABA
            setPurchasedOrderRecord(null);

            setIsActiveDeleteModal(false);
            return true;
        } catch (error: unknown) {
            if (error instanceof Error) console.log(error.message);
            return false;
        }
    }, [purchasedOrderRecord, dispatch, refetchPurchasedOrder])

    // * ******************** Funciones para control de modales ******************** 

    const toggleActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);
    const toggleActiveViewModal = useCallback(() => setIsActiveEditModal(prev => !prev), []);

    const handleOnClickRowEdit = useCallback((row: IPartialPurchasedOrder) => {
        setPurchasedOrderRecord(row);
        setIsActiveEditModal(prev => !prev);
    }, []);
    const handleOnClickRowDelete = useCallback((row: IPartialPurchasedOrder) => {
        setPurchasedOrderRecord(row);
        openDeleteModal();
    }, [openDeleteModal]);


    // * ******************** Funciones para control de acciones de la tabla ******************** 

    const rowActions: RowAction<IPartialPurchasedOrder>[] = [
        {
            label: "Delete",
            onClick: handleOnClickRowDelete,
            icon: <Trash2 className={StyleModule.trash2IconShippingOrderModel} />
        }
    ];

    const getRowId = useCallback((row: IPartialPurchasedOrder, index: number) => row?.id?.toString() ?? index.toString(), []);

    /* ******************** Efectos ******************** */

    return (
        <div className={StyleModule.purchasedOrdersContainer}>
            <div className={StyleModule.purchasedOrdersHeader}>
                <h1 className="nunito-bold">Ventas</h1>
                <MainActionButtonCustom
                    icon={<PlusIcon />}
                    label="Producto"
                    onClick={toggleIsActiveAddModal}
                />
            </div>
            <GenericTableMemo

                // modelo e indentificador 
                modelName="Ventas"
                getRowId={getRowId}

                // data y columnas
                columns={columnsPurchasedOrders}
                data={purchasedOrders}
                isLoadingData={loadingPurchasedOrder}

                // Funcionalidades
                enableFilters
                enablePagination
                enableSorting
                enableRowEditClick
                enableOptionsColumn

                // Actions rows
                typeRowActions="icon"
                enableRowEditClickHandler={handleOnClickRowEdit}
                rowActions={rowActions}

                noResultsMessage="No hay ventas existentes."
                extraComponents={({ table, state, dispatch }) => {
                    if (!table || !state || !dispatch) return null;
                    return (
                        <ExtraComponentMemo
                            search={search}
                            setSearch={setSearch}
                            table={table}
                            state={state}
                            dispatch={dispatch}
                        />
                    );
                }}
                classNameGenericTableContainer={StyleModule.containerTable}

            />
            {isActiveAddModal && <ModalAddGeneric
                onClose={toggleActiveAddModal}
                onCreate={handleCreate}
                onEdit={toggleActiveViewModal}
            />}
            {isActiveDeleteModal &&
                <DeleteModal
                    title="¿Seguro que desea eliminar esta orden?"
                    message="Este proceso no se puede deshacer."
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            }
            {
                isActiveEditModal && <ModalEditGeneric
                    record={{ ...purchasedOrderRecord }}
                    onClose={toggleActiveViewModal}
                    onEdit={handleUpdate}
                    onDelete={handleDelete}
                />
            }
        </div>
    );
}

export default PurchasedOrderModel;

type ExtraProps = {
    search: string | null;
    setSearch: (v: string | null) => void;
    state: TableState;
    dispatch: Dispatch<TableAction>;
    table: Table<IPartialPurchasedOrder>;
};
const ExtraComponent = ({ search, setSearch, dispatch, state }: ExtraProps) => {
    const handleClearFilters = useCallback(() => {
        dispatch(reset_column_filters());
    }, [dispatch]);
    const handleExportTable = useCallback(() => {
        console.log("exporting table");
    }, []);
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
};


const ExtraComponentMemo = memo(ExtraComponent) as typeof ExtraComponent;