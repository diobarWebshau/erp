import {
    useEffect, useState
} from "react";
import {
    defaultValuePartialShippingOrder
} from "./../../interfaces/shippingOrder";
import type {
    IPartialShippingOrder,
    IShippingOrder,
    LoadEvidenceItem,
    LoadEvidenceManager,
    PartialLoadEvidenceItem
} from "./../../interfaces/shippingOrder";
import type {
    AppDispatchRedux
} from "../../store/store";
import {
    deleteShippingOrderInDB,
    fetchShippingOrderFromDB,
    createCompleteShippingOrderInDB,
    updateCompleteShippingOrderInDB,
} from "./../../queries/shippingOrderQueries";
import GenericTable
    from "../../components/ui/table/Table copy";
import {
    useDispatch
} from "react-redux";
import {
    columnsShippingOrders
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
import useShippingOrderDetailById
    from "./hooks/useShippingOrderDetailById";
import EditModal
    from "./modals/edit/EditModal";
import {
    diffObjectArrays,
    diffObjects
} from "../../utils/validation-on-update/validationOnUpdate"
import type {
    IPartialShippingOrderPurchasedOrderProduct,
    IShippingOrderPurchasedOrderProduct,
    IShippingOrderPurchasedOrderProductManager
} from "../../interfaces/shippingPurchasedProduct";



const ShippingOrderModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [ShippingOrders, setShippingOrders] =
        useState<IShippingOrder[]>([]);
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [
        ShippingOrderRecord,
        setShippingOrderRecord
    ] = useState<IPartialShippingOrder>(
        defaultValuePartialShippingOrder
    );
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchShippingOrderFromDB(dispatch);
            if (response.length > 0) {
                setShippingOrders(response);
            } else {
                setShippingOrders([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (shipping: IPartialShippingOrder) => {
        setLoading(true);
        try {

            const new_shipping = { ...shipping }
            const evidences =
                shipping.load_evidence as LoadEvidenceItem[] || [];
            const has_evidences =
                evidences?.length > 0 || false;
            delete new_shipping.load_evidence;

            if (has_evidences) {
                new_shipping.load_evidence = evidences.map(
                    (e) => e.path as File
                );
            }

            const responseCreate =
                await createCompleteShippingOrderInDB(
                    new_shipping,
                    dispatch
                );
            if (!responseCreate) {
                return;
            }

            setServerError(null);
            fetchs();
            setIsActiveAddModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (shipping: IPartialShippingOrder) => {
        setLoading(true);
        try {

            const shipping_old = {
                ...shippingOrderDetailById,
                delivery_cost:
                    Number(shippingOrderDetailById?.delivery_cost)
            };


            const shipping_new = shipping;

            const sopops_old =
                shipping_old.shipping_order_purchase_order_product || [];
            const evidences_old =
                shipping_old.load_evidence || [];

            delete shipping_old.load_evidence;
            delete shipping_old.shipping_order_purchase_order_product;


            const sopops_new =
                shipping_new.shipping_order_purchase_order_product || [];
            const evidences_new =
                shipping_new.load_evidence || [];

            delete shipping_new.load_evidence;
            delete shipping_new.shipping_order_purchase_order_product;

            const diff_shipping: IPartialShippingOrder =
                await diffObjects(
                    shipping_old,
                    shipping_new
                );

            const diff_sopops:
                IShippingOrderPurchasedOrderProductManager =
                diffObjectArrays(
                    sopops_old,
                    sopops_new
                );

            const hasChangesSopops: boolean = [
                diff_sopops.added,
                diff_sopops.deleted,
                diff_sopops.modified
            ].some(
                (arr: (
                    IShippingOrderPurchasedOrderProduct |
                    IPartialShippingOrderPurchasedOrderProduct)[]
                ) => arr.length > 0);

            const diff_evidences: LoadEvidenceManager =
                diffObjectArrays(
                    evidences_old,
                    evidences_new
                );

            const hasChangesEvidences: boolean = [
                diff_evidences.added,
                diff_evidences.deleted,
                diff_evidences.modified
            ].some((arr: (
                LoadEvidenceItem |
                PartialLoadEvidenceItem
            )[]) => arr.length > 0);

            if (
                Object.keys(diff_shipping).length > 0 ||
                hasChangesSopops ||
                hasChangesEvidences
            ) {

                const excludedIds = new Set<string>(
                    [
                        ...diff_evidences.added,
                        ...diff_evidences.deleted,
                        ...diff_evidences.modified
                    ].map(item => item.id)
                );

                const load_evidence_old =
                    shippingOrderDetailById?.load_evidence?.filter(
                        (evidence) => {
                            if (evidence instanceof File) return false;
                            return !excludedIds.has(evidence.id);
                        }
                    ) as LoadEvidenceItem[];

                const new_shipping: IPartialShippingOrder = {
                    ...diff_shipping,
                    shipping_order_purchase_order_product_manager:
                        diff_sopops,
                    load_evidence:
                        diff_evidences.added.map(
                            (e) => e.path as File
                        ) || [],
                    load_evidence_deleted:
                        diff_evidences.deleted.map(
                            (e) => { return { id: e.id } }
                        ) as PartialLoadEvidenceItem[] || [],
                    load_evidence_old:
                        load_evidence_old.map(
                            (e) => { return { id: e.id } }
                        ) as PartialLoadEvidenceItem[] || [],
                }

                const response =
                    await updateCompleteShippingOrderInDB(
                        ShippingOrderRecord.id as number,
                        new_shipping,
                        dispatch
                    );

                if (!response) {
                    return;
                }
                await fetchs();
                await refetchShippingOrderDetailById();
            }
            setServerError(null);
            setIsActiveEditModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteShippingOrderInDB(
                ShippingOrderRecord.id,
                dispatch
            );
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
    const toggleActiveEditModal = (record: IShippingOrder) => {
        setServerError(null);
        setShippingOrderRecord(record);
        setIsActiveEditModal(!isActiveEditModal);
    }
    const toggleActiveDeleteModal = (record: IShippingOrder) => {
        setServerError(null);
        setShippingOrderRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const rowActions: RowAction<IShippingOrder>[] = [
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


    const {
        shippingOrderDetailById,
        loadingShippingOrderDetailById,
        refetchShippingOrderDetailById
    } = useShippingOrderDetailById(
        ShippingOrderRecord.id
    );

    return (
        <>
            <GenericTable
                columns={columnsShippingOrders}
                data={ShippingOrders}
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
            {
                isActiveEditModal &&
                !loadingShippingOrderDetailById &&
                <EditModal
                    onClose={setIsActiveEditModal}
                    onUpdate={handleUpdate}
                    record={{ ...shippingOrderDetailById }}
                />}
            {/* <PurchasedOrdersTable /> */}
        </>
    );
}

export default ShippingOrderModel;