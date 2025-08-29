import {
    useEffect, useState
} from "react";
import {
    defaultValuePurchasedOrder,
    defaultValuePartialPurchasedOrder
} from "./../../interfaces/purchasedOrder";
import type {
    IPartialPurchasedOrder,
    IPurchasedOrder,
} from "./../../interfaces/purchasedOrder";
import type {
    AppDispatchRedux
} from "../../store/store";
import {
    fetchPurchasedOrdersFromDB,
    deletePurchasedOrderInDB,
    updatePurchasedOrderInDB,
    createBatchPurchasedOrderInDB,
} from "./../../queries/purchaseOrderQueries";
import GenericTable
    from "../../components/ui/table/Table copy";
import {
    useDispatch
} from "react-redux";
import {
    columnsPurchasedOrders
} from "./structure/columns"
import {
    AddModal,
    DeleteModal
} from "./modals";
import type {
    RowAction
} from "../../components/ui/table/types";
import {
    Edit, Trash2
} from "lucide-react";
import EditModal
    from "./modals/edit/EditModal";
import usePurchasedOrderProducts
    from "./hooks/purchased-orders-products/usePurchasedOrdersProducts";
import type {
    IPartialPurchasedOrderProduct,
    IPurchasedOrderProduct
} from "../../interfaces/purchasedOrdersProducts";
import {
    createPurchasedOrderProductInDB,
    deletePurchasedOrderProductInDB,
    revertProductionOrderOfProductOrderProductFromDB
} from "../../queries/purchasdedOrderProductQueries";
import {
    diffObjects,
    diffObjectArrays
} from "../../utils/validation-on-update/validationOnUpdate";

const PurchasedOrderModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [purchasedOrders, setPurchasedOrders] =
        useState<IPurchasedOrder[]>([]);
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [purchasedOrderRecord, setPurchasedOrderRecord
    ] = useState<IPartialPurchasedOrder>(defaultValuePartialPurchasedOrder);
    const [
        purchasedOrderRecordDelete,
        setPurchasedOrderRecordDelete
    ] = useState<IPurchasedOrder>(defaultValuePurchasedOrder);
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [originalProductsInOrder, setOriginalProductsInOrder] =
        useState<IPurchasedOrderProduct[]>([]);

    const {
        purchasedOrderProducts,
        refetchPurchasedOrderProducts
    } = usePurchasedOrderProducts(purchasedOrderRecord?.id);

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchPurchasedOrdersFromDB(dispatch);
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

    const handleCreate = async (purchased: IPartialPurchasedOrder) => {
        setLoading(true);

        console.log(purchased);
        try {
            const response = await createBatchPurchasedOrderInDB(
                purchased,
                dispatch
            );
            if (response) {
                setServerError(null);
                fetchs();
                setIsActiveAddModal(false);
            }
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (
        purchased: IPartialPurchasedOrder,
        pops: IPartialPurchasedOrderProduct[]
    ) => {
        setLoading(true);
        setServerError(null);
        try {
            let flag_po = false;

            // Detectar diferencias en la orden principal
            const update_values_po = diffObjects(purchasedOrderRecord, purchased);
            if (Object.keys(update_values_po).length > 0) {
                flag_po = true;
            }

            // Detectar diferencias en productos
            const update_values_pop = diffObjectArrays(
                purchasedOrderProducts,
                pops
            );

            // Ejecutar actualizaciones según cambios detectados
            if (flag_po && purchasedOrderRecord.id) {
                await updatePurchasedOrderInDB(purchasedOrderRecord.id, purchased, dispatch);
            }

            if (update_values_pop.deleted.length > 0) {
                await Promise.all(
                    update_values_pop.deleted.map((pop) =>
                        deletePurchasedOrderProductInDB(pop.id, dispatch)
                    )
                );
            }

            if (update_values_pop.modified.length > 0) {
                await Promise.all(
                    update_values_pop.modified.map(async (pop) => {
                        await revertProductionOrderOfProductOrderProductFromDB(
                            pop.id,
                            dispatch
                        );
                        await deletePurchasedOrderProductInDB(
                            pop.id,
                            dispatch
                        );
                        await createBatchPurchasedOrderInDB(
                            purchased,
                            dispatch
                        );
                    })
                );
            }


            if (update_values_pop.added.length > 0) {
                await Promise.all(
                    update_values_pop.added.map((pop) =>
                        createPurchasedOrderProductInDB(pop, dispatch)
                    )
                );
            }
            setServerError(null);
            fetchs();
            setIsActiveEditModal(false);
        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
                console.log(error.message)
            }
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async () => {
        setLoading(true);
        setServerError(null);
        try {
            const response = await
                deletePurchasedOrderInDB(
                    purchasedOrderRecordDelete.id,
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

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    }

    const toggleActiveEditModal = async (record: IPurchasedOrder) => {
        setServerError(null);
        setPurchasedOrderRecord({
            ...record,
            total_price:
                Number(record.total_price)
        });
        const updatedProducts =
            await refetchPurchasedOrderProducts(record.id);
        setOriginalProductsInOrder(updatedProducts);
        setIsActiveEditModal(true);

    };

    const toggleActiveDeleteModal = (record: IPurchasedOrder) => {
        setServerError(null);
        setPurchasedOrderRecordDelete(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const rowActions: RowAction<IPurchasedOrder>[] = [
        {
            label: "Edit",
            onClick: toggleActiveEditModal,
            icon: <Edit size={15} />
        },
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 size={15} />
        },
    ];

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsPurchasedOrders}
                data={purchasedOrders}
                onAdd={toggleActiveAddModal}
                rowActions={rowActions}
                onDeleteSelected={
                    () => console.log("borrado selectivo")}
                modelName="Purchased orders"
            />
            {isActiveAddModal && <AddModal
                onClose={setIsActiveAddModal}
                onCreate={(value) => handleCreate(value)}
            />}
            {isActiveDeleteModal && <DeleteModal
                onClose={setIsActiveDeleteModal}
                onDelete={handleDelete}
            />}
            {isActiveEditModal && <EditModal
                onClose={setIsActiveEditModal}
                onEdit={handleUpdate}
                pop={purchasedOrderRecord}
                pops={[...originalProductsInOrder]}
            />}
        </>
    );
}

export default PurchasedOrderModel;