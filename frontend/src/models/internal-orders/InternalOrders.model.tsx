import {
    useEffect, useState
} from "react";
import {
    defaultValueInternalProductProductionOrder,
    defaultValuePartialInternalProductProductionOrder
} from "./structure/types";
import type {
    IInternalProductProductionOrder,
    IPartialInternalProductProductionOrder,
} from "./structure/types";
import type {
    AppDispatchRedux
} from "../../store/store";
import {
    createInternalOrderInDB,
    deleteInternalOrderInDB,
    fetchInternalOrdersFromDB,
    updateInternalOrderInDB,
    revertProductionOrderOfInternalOrderFromDB
} from "../../queries/internalOrderQueries";
import GenericTable
    from "../../components/ui/table/Table";
import {
    useDispatch
} from "react-redux";
import {
    columnsInternalProductProductionOrders
} from "./structure/columns"
import {
    getChangedFields
} from "../locations-types/utils/getChangedFields";
import { AddModal, DeleteModal, EditModal } from "./modals";
import { Underline } from "lucide-react";

const InternalOrderModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [internalOrders, setInternalOrders] =
        useState<IInternalProductProductionOrder[]>([])
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [
        internalOrderRecord,
        setInternalOrderRecord
    ] = useState<IInternalProductProductionOrder>(defaultValueInternalProductProductionOrder);
    const [
        originalInternalOrderRecord,
        setOriginalInternalOrderRecord
    ] = useState<IInternalProductProductionOrder>(defaultValueInternalProductProductionOrder);
    const [
        InternalOrderRecordDelete,
        setInternalOrderRecordDelete
    ] = useState<IInternalProductProductionOrder>(defaultValueInternalProductProductionOrder);
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
                await fetchInternalOrdersFromDB(dispatch);
            if (response.length > 0) {
                setInternalOrders(response);
            } else {
                setInternalOrders([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (internalOrder: IPartialInternalProductProductionOrder) => {
        setLoading(true);
        try {
            const result = await createInternalOrderInDB(
                internalOrder,
                dispatch
            );
            console.log(result)
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

    function diffObjects(obj1: any, obj2: any): Record<string, any> {
        const result: Record<string, any> = {};

        if (
            typeof obj1 !== "object" || obj1 === null ||
            typeof obj2 !== "object" || obj2 === null
        ) {
            return obj1 !== obj2 ? obj1 : {};
        }

        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        for (const key of keys) {
            const val1 = obj1[key];
            const val2 = obj2[key];

            const bothObjects = typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null;

            if (bothObjects) {
                const nestedDiff = diffObjects(val1, val2);
                if (Object.keys(nestedDiff).length > 0) {
                    result[key] = nestedDiff;
                }
            } else if (val1 !== val2) {
                result[key] = val1;
            }
        }

        return result;
    }


    const handleUpdate = async (internalOrder: IPartialInternalProductProductionOrder) => {
        setLoading(true);
        try {
            const update_values_internal =
                diffObjects(internalOrderRecord, internalOrder);
            if (Object.keys(update_values_internal).length > 0) {
                console.log(update_values_internal);
                await revertProductionOrderOfInternalOrderFromDB(
                    internalOrderRecord.id,
                    dispatch
                );
                await deleteInternalOrderInDB(
                    internalOrderRecord.id,
                    dispatch
                );
                await createInternalOrderInDB(
                    {
                        product_id: internalOrder.product_id,
                        location_id: internalOrder.location_id,
                        qty: internalOrder.qty
                    },
                    dispatch
                );
                setServerError(null);
                fetchs();
                setIsActiveEditModal(false);

            }
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
            await deleteInternalOrderInDB(
                InternalOrderRecordDelete.id,
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
    const toggleActiveEditModal = (record: IInternalProductProductionOrder) => {
        setServerError(null);
        setInternalOrderRecord({ ...record, qty: Number(record.qty) });
        setInternalOrderRecord({ ...record, qty: Number(record.qty) });
        setIsActiveEditModal(!isActiveEditModal);
    }
    const toggleActiveDeleteModal = (record: IInternalProductProductionOrder) => {
        setServerError(null);
        setInternalOrderRecordDelete(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsInternalProductProductionOrders}
                data={internalOrders}
                onAdd={toggleActiveAddModal}
                onDelete={toggleActiveDeleteModal}
                onEdit={toggleActiveEditModal}
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
                    onDelete={handleDelete} />
            }
            {
                isActiveEditModal && <EditModal
                    onClose={setIsActiveEditModal}
                    onEdit={handleUpdate}
                    ippo={internalOrderRecord}
                />
            }
        </>
    );
}

export default InternalOrderModel;