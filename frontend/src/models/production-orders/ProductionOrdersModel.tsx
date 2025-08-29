import {
    useEffect, useState
} from "react";
import type {
    IPartialProductionOrder,
    IProductionOrder
} from "./../../interfaces/productionOrder";
import {
    defaultValuePartialProductionOrder,
    defaultValueProductionOrder
} from "./../../interfaces/productionOrder";

import {
    createProductionOrderInDB,
    deleteProductionOrderInDB,
    fetchProductionOrdersFromDB,
    updateProductionOrderInDB
} from "./queries/productionOrderQueries";
import {
    createProductionInDB
} from "../../queries/productionQueries"
import GenericTable
    from "../../components/ui/table/Table copy";
import {
    useDispatch
} from "react-redux";
import {
    columnsProductionOrders
} from "./structure/columns"
import {
    AddModal
} from "./modals";
import {
    Edit, Trash2, CheckCheck
} from "lucide-react";
import type {
    RowAction
} from "../../components/ui/table/types";
import {
    DeleteModal
} from "../purchased-orders/modals";
import CheckModal from "./modals/check/CheckModal";
import type {
    IPartialProduction
} from "../../interfaces/production";
import {
    clearAllErrors
} from "../../store/slicer/errorSlicer"
import type {
    AppDispatchRedux
} from "../../store/store";
import EditModal from "./modals/edit/EditModal";
import {
    diffObjects
} from "../../utils/validation-on-update/validationOnUpdate";

const ProductionOrderModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [productionOrders, setProductionOrders] =
        useState<IProductionOrder[]>([])
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [
        productionOrderRecord,
        setproductionOrderRecord
    ] = useState<IPartialProductionOrder>(
        defaultValuePartialProductionOrder);
    const [
        originalproductionOrderRecord,
        setOriginalproductionOrderRecord
    ] = useState<IProductionOrder>(
        defaultValueProductionOrder);
    const [
        productionOrderRecordDelete,
        setproductionOrderRecordDelete
    ] = useState<IProductionOrder>(
        defaultValueProductionOrder);

    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveCheckPointModal, setIsActiveCheckPointModal] =
        useState<boolean>(false);

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchProductionOrdersFromDB(dispatch);
            if (response.length > 0) {
                setProductionOrders(response);
            } else {
                setProductionOrders([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (productionOrder: IPartialProductionOrder) => {
        try {
            const result =
                await createProductionOrderInDB(
                    productionOrder,
                    dispatch
                );
            if (!result) {
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

    const handleUpdate = async (productionOrder: IPartialProduction) => {
        setLoading(true);
        try {
            const update_values_po =
                await diffObjects(
                    originalproductionOrderRecord,
                    productionOrder
                );
            if (Object.keys(update_values_po).length > 0) {
                const response = await updateProductionOrderInDB(
                    originalproductionOrderRecord.id,
                    update_values_po,
                    dispatch
                );
                if (!response) {
                    return;
                }
            }
            setServerError(null);
            fetchs();
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
            const response =
                await deleteProductionOrderInDB(
                    productionOrderRecordDelete.id,
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

    const handleCreateCheckPoint = async (production: IPartialProduction) => {
        setLoading(true);
        try {
            const response =
                await createProductionInDB(
                    production,
                    dispatch
                );
            console.log(response);
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveCheckPointModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const toggleActiveAddModal = () => {
        dispatch(clearAllErrors());
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    }
    const toggleActiveEditModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setproductionOrderRecord({ ...record, qty: Number(record.qty) });
        setOriginalproductionOrderRecord({ ...record, qty: Number(record.qty) });
        setIsActiveEditModal(!isActiveEditModal);
    }
    const toggleActiveDeleteModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setproductionOrderRecordDelete(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }
    const toggleActiveCheckPointModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setOriginalproductionOrderRecord(record);
        setIsActiveCheckPointModal(!isActiveCheckPointModal);
    }

    const rowActions: RowAction<IProductionOrder>[] = [
        {
            label: "Edit",
            onClick: toggleActiveEditModal,
            icon: <Edit color="yellow" size={15} />
        },
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 color="red" size={15} />
        },
        {
            label: "Check point",
            onClick: toggleActiveCheckPointModal,
            icon: <CheckCheck size={15} />
        }
    ];

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsProductionOrders}
                data={productionOrders}
                onAdd={toggleActiveAddModal}
                rowActions={rowActions}
                onDeleteSelected={
                    () => console.log("borrado selectivo")}
                modelName="Internal order"
            />
            {
                isActiveAddModal && < AddModal
                    onClose={setIsActiveAddModal}
                    onCreate={(value) => handleCreate(value)}
                />
            }
            {
                isActiveDeleteModal && <DeleteModal
                    onClose={setIsActiveDeleteModal}
                    onDelete={handleDelete}
                />
            }
            {
                isActiveCheckPointModal && <CheckModal
                    onClose={setIsActiveCheckPointModal}
                    onCreate={(value) => handleCreateCheckPoint(value)}
                    value={originalproductionOrderRecord}
                />
            }
            {
                isActiveEditModal && <EditModal
                    onClose={setIsActiveEditModal}
                    onEdit={(value) => handleUpdate(value)}
                    po={originalproductionOrderRecord}
                />
            }
        </>
    );
}

export default ProductionOrderModel;