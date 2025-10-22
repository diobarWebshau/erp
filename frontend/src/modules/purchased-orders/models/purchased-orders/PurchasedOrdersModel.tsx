import {
    useEffect, useState,
} from "react";
import {
    defaultValuePurchasedOrder,
    defaultValuePartialPurchasedOrder
} from "./../../../../interfaces/purchasedOrder";
import type {
    IPartialPurchasedOrder,
    IPurchasedOrder,
} from "./../../../../interfaces/purchasedOrder";
import type {
    AppDispatchRedux
} from "./../../../../store/store";
import {
    fetchPurchasedOrdersFromDB,
    deletePurchasedOrderInDB,
    updatePurchasedOrderInDB,
    createBatchPurchasedOrderInDB,
} from "./../../../../modelos/purchased_orders/queries/purchaseOrderQueries";
import GenericTable
    from "../../../../components/ui/table/tableContext/GenericTable";
import {
    useDispatch
} from "react-redux";
import {
    columnsPurchasedOrders
} from "./structure/columns"
import type {
    RowAction
} from "../../../../components/ui/table/types";
import {
    Download, Eraser,
    Plus, Search, Trash2
} from "lucide-react";
import usePurchasedOrderProducts
    from "./hooks/purchased-orders-products/usePurchasedOrdersProducts";
import type {
    IPartialPurchasedOrderProduct,
    IPurchasedOrderProduct,
    IPurchasedOrderProductManager
} from "./../../../../interfaces/purchasedOrdersProducts";
import {
    diffObjects,
    diffObjectArrays,
} from "./../../../../utils/validation-on-update/validationOnUpdate";
import {
    reset_column_filters
} from "../../../../components/ui/table/tableContext/tableActions";
import InvertOnHoverButton
    from "../../../../components/ui/table/components/gui/button/Invert-on-hover-button/InvertOnHoverButton";
import FadeButton
    from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import type {
    Table
} from "@tanstack/react-table";
import {
    useTableDispatch,
    useTableState
} from "../../../../components/ui/table/tableContext/tableHooks";
import StyleModule
    from "./PurchasedOrdersModel.module.css";
import InputSearch
    from "../../../../components/ui/table/components/gui/input/input-text-search/input";
import ModalAddGeneric
    from "./wizards/add2/context/ModalAddGeneric";
import ModalEditGeneric
    from "./wizards/edit2/context/ModalEditGeneric";
import DeleteModal
    from "../../../../comp/primitives/modal/deleteModal/DeleteModal";


const PurchasedOrderModel = () => {

    // * ******************** Estados ******************** */

    // ? Estados para acceso a redux

    const dispatch: AppDispatchRedux =
        useDispatch();

    // ? Estados de control de errores y loading

    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);

    // ? Estados para los datos del modelo

    const [purchasedOrders, setPurchasedOrders] =
        useState<IPurchasedOrder[]>([]);
    const [purchasedOrderRecord, setPurchasedOrderRecord
    ] = useState<IPartialPurchasedOrder>(defaultValuePartialPurchasedOrder);
    const [
        purchasedOrderRecordDelete,
        setPurchasedOrderRecordDelete
    ] = useState<IPurchasedOrder>(defaultValuePurchasedOrder);
    const [originalProductsInOrder, setOriginalProductsInOrder] =
        useState<IPurchasedOrderProduct[]>([]);

    // ? Estados para los modales

    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);

    // * ******************** Hooks ******************** */

    const {
        purchasedOrderProducts,
        refetchPurchasedOrderProducts
    } = usePurchasedOrderProducts(purchasedOrderRecord?.id);

    // * ******************** Funciones de operaciones CRUD ******************** 

    const fetchs = async () => {
        setLoading(true);
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
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (
        purchased: IPartialPurchasedOrder
    ) => {
        setLoading(true);
        try {
            const response =
                await createBatchPurchasedOrderInDB(
                    purchased,
                    dispatch
                );
            if (response) {
                setServerError(null);
                fetchs();
                setPurchasedOrderRecord(response);
                return;
            }
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate2 = async (
        record: IPartialPurchasedOrder | null,
        updateRecord: IPartialPurchasedOrder | null
    ) => {
        setLoading(true);
        try {
            const original = { ...record };
            const update = { ...updateRecord };
            
            const original_purchase_order_products =
                original?.purchase_order_products;
            const update_purchase_order_products =
                update?.purchase_order_products;

            delete original.purchase_order_products;
            delete update.purchase_order_products;

            const diff_purchased_order: IPartialPurchasedOrder =
                await diffObjects(original, update);

            const productDiffs: IPurchasedOrderProductManager = 
                await diffObjectArrays(
                    original_purchase_order_products || [],
                    update_purchase_order_products || []
                );

            const hasChangesProducts: boolean = [
                productDiffs.added,
                productDiffs.deleted,
                productDiffs.modified
            ].some(
                (arr: (
                    IPurchasedOrderProduct |
                    IPartialPurchasedOrderProduct)[]
                ) => arr.length > 0);

            if (
                Object.keys(diff_purchased_order).length > 0 ||
                hasChangesProducts
            ) {

                const new_purchased_order: IPartialPurchasedOrder = {
                    ...diff_purchased_order,
                    purchase_order_product_manager: productDiffs
                };
                const response = await updatePurchasedOrderInDB(
                    record?.id,
                    new_purchased_order,
                    dispatch
                );

                if (response) {
                    setServerError(null);
                    fetchs();
                }
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        setLoading(true);
        setServerError(null);
        try {
            const response = await
                deletePurchasedOrderInDB(
                    purchasedOrderRecord.id,
                    dispatch
                );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveDeleteModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // * ******************** Funciones para control de modales ******************** 

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    }

    const toggleActiveEditModal = async (record: IPurchasedOrder) => {
        setServerError(null);
        setPurchasedOrderRecord(record);
        const updatedProducts =
            await refetchPurchasedOrderProducts(record.id);
        setOriginalProductsInOrder(updatedProducts);
        setIsActiveEditModal(true);
    };

    const toggleActiveViewModal = () => {
        setServerError(null);
        setIsActiveEditModal(prev => !prev);
    }

    const toggleActiveDeleteModal = (record: IPurchasedOrder) => {
        setServerError(null);
        setPurchasedOrderRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const toggleActiveDeleteModalClose = () => {
        setIsActiveDeleteModal(false);
    }

    // * ******************** Funciones para control de acciones de la tabla ******************** 

    const rowActions: RowAction<IPurchasedOrder>[] = [
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 className={StyleModule.trash2IconShippingOrderModel} />
        }
    ];

    // * ******************** Componentes extra para inyectar como props en el GenericTable ******************** 

    const ExtraComponents = (table: Table<IPurchasedOrder>) => {
        const state = useTableState();
        const dispatch = useTableDispatch();
        return (
            <div
                className={StyleModule.containerExtraComponents}
            >
                <div
                    className={`nunito-medium ${StyleModule.firstBlock}`}
                >
                    <h1 className="nunito-bold">Ventas</h1>
                    <FadeButton
                        label="Orden de envio"
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

    /* ******************** Efectos ******************** */

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <div className={StyleModule.containerPurchasedOrdersModel}>
            <GenericTable

                modelName="Ventas"
                columns={columnsPurchasedOrders}
                data={purchasedOrders}

                rowActions={rowActions}
                typeRowActions="icon"
                
                enableFilters
                enablePagination
                enableRowEditClick

                enableRowEditClickHandler={toggleActiveEditModal}
                onDeleteSelected={
                    () => console.log("borrado selectivo")}
                noResultsMessage="No hay ventas existentes."
                
                extraComponents={
                    (table) => ExtraComponents(table)}
                getRowId={(row: IPurchasedOrder) => row.id.toString()}
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
                    record={{...purchasedOrderRecord}}
                    onClose={toggleActiveViewModal}
                    onEdit={handleUpdate2}
                    onDelete={handleDelete}
                />
            }
        </div>
    );
}

export default PurchasedOrderModel;