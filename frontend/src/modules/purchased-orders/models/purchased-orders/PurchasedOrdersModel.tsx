import { fetchPurchasedOrdersFromDB, deletePurchasedOrderInDB, updatePurchasedOrderInDB, createBatchPurchasedOrderInDB } from "./../../../../modelos/purchased_orders/queries/purchaseOrderQueries";
import type { IPurchasedOrderProductManager } from "./../../../../interfaces/purchasedOrdersProducts";
import { diffObjects, diffObjectArrays } from "./../../../../utils/validation-on-update/ValidationOnUpdate2";
import { useTableDispatch, useTableState } from "../../../../components/ui/table/tableContext/tableHooks";
import type { IPartialPurchasedOrder, IPurchasedOrder } from "./../../../../interfaces/purchasedOrder";
import { reset_column_filters } from "../../../../components/ui/table/tableContext/tableActions";
import DeleteModal from "../../../../comp/primitives/modal/deleteModal/DeleteModal";
import type { RowAction } from "../../../../components/ui/table/types";
import ModalEditGeneric from "./wizards/edit2/context/ModalEditGeneric";
import GenericTableMemo from "../../../../comp/primitives/table/tableContext/GenericTable";
import { Download, Eraser, Search, Trash2 } from "lucide-react";
import ModalAddGeneric from "./wizards/add2/context/ModalAddGeneric";
import type { AppDispatchRedux } from "./../../../../store/store";
import { columnsPurchasedOrders } from "./structure/columns"
import StyleModule from "./PurchasedOrdersModel.module.css";
import { memo, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import SecundaryActionButtonCustom from "../../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import InputTextCustom from "../../../../comp/primitives/input/text/custom/InputTextCustom";

const PurchasedOrderModel = () => {

    const dispatch: AppDispatchRedux = useDispatch();
    const [purchasedOrders, setPurchasedOrders] = useState<IPurchasedOrder[]>([]);
    const [purchasedOrderRecord, setPurchasedOrderRecord] = useState<IPartialPurchasedOrder | null>(null);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] = useState<boolean>(false);
    const [search, setSearch] = useState<string | null>(null);

    // * ******************** Funciones de operaciones CRUD ******************** 

    const fetchs = useCallback(async () => {
        try {
            const response =
                await fetchPurchasedOrdersFromDB({
                    dispatch,
                });
            if (response.length > 0) {
                setPurchasedOrders(response);
            } else {
                setPurchasedOrders([])
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    const handleCreate = async (purchased: IPartialPurchasedOrder) => {
        try {
            const response = await createBatchPurchasedOrderInDB(purchased, dispatch);
            if (response) {
                fetchs();
                setPurchasedOrderRecord(response);
                return;
            }
        } catch (error) {
            if (error instanceof Error) console.log(error);
        }
    };

    const handleUpdate = useCallback(async ({ original, update }: { original: IPartialPurchasedOrder, update: IPartialPurchasedOrder }) => {
        if (!purchasedOrderRecord?.id) return;
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
                    fetchs();
                }
            }
        } catch (error) {
            if (error instanceof Error) console.log(error);
        }
    }, [dispatch, fetchs, purchasedOrderRecord])

    const handleDelete = useCallback(async (): Promise<boolean> => {
        if (!purchasedOrderRecord?.id) return false;
        try {
            const response = await deletePurchasedOrderInDB(purchasedOrderRecord.id as number, dispatch);
            if (!response) {
                return false;
            }
            fetchs();
            setIsActiveDeleteModal(false);
            return true;
        } catch (error: unknown) {
            if (error instanceof Error) console.log(error.message);
            return false;
        }
    }, [purchasedOrderRecord, dispatch, fetchs])

    // * ******************** Funciones para control de modales ******************** 

    const toggleActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);
    const toggleActiveViewModal = useCallback(() => setIsActiveEditModal(prev => !prev), []);
    const toggleActiveDeleteModalClose = useCallback(() => setIsActiveDeleteModal(prev => !prev), []);

    const handleOnClickRowEdit = useCallback((row: IPartialPurchasedOrder) => {
        setPurchasedOrderRecord(row);
        setIsActiveEditModal(prev => !prev);
    }, []);
    const handleOnClickRowDelete = useCallback((row: IPartialPurchasedOrder) => {
        setPurchasedOrderRecord(row);
        setIsActiveDeleteModal(prev => !prev);
    }, []);

    // * ******************** Funciones para control de acciones de la tabla ******************** 

    const rowActions: RowAction<IPurchasedOrder>[] = [
        {
            label: "Delete",
            onClick: handleOnClickRowDelete,
            icon: <Trash2 className={StyleModule.trash2IconShippingOrderModel} />
        }
    ];

    const ExtraComponents = useCallback(() => <ExtraComponent search={search} setSearch={setSearch} />, [search]);

    const getRowId = useCallback((row: IPartialPurchasedOrder, index: number) => row?.id?.toString() ?? index.toString(), []);

    /* ******************** Efectos ******************** */

    return (
        <div className={StyleModule.containerPurchasedOrdersModel}>
            <GenericTableMemo

                // modelo e indentificador 
                modelName="Ventas"
                getRowId={getRowId}

                // data y columnas
                columns={columnsPurchasedOrders}
                data={purchasedOrders}

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
                extraComponents={ExtraComponents}
                classNameGenericTableContainer={StyleModule.genericTableContainer}

            />
            {isActiveAddModal && <ModalAddGeneric
                onClose={toggleActiveAddModal}
                onCreate={handleCreate}
                onEdit={toggleActiveViewModal}
            />}
            {isActiveDeleteModal && <DeleteModal
                title="¿Seguro que desea eliminar esta orden?"
                message="Este proceso no se puede deshacer."
                onClose={toggleActiveDeleteModalClose}
                onDelete={handleDelete}
            />}
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

interface IExtraComponentsProps {
    search: string | null,
    setSearch: (value: string | null) => void
}

const ExtraComponent = memo(({ search, setSearch }: IExtraComponentsProps) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

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
});