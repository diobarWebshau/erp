import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchInternalOrdersFromDB
} from "./internalOrderQueries";
import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    setError, clearError
} from "../../../../store/slicer/errorSlicer";
import type {
    IInternalProductProductionOrder
} from "../../../../interfaces/internalOrder";

const useInternalOrders = () => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [internalOrders, setInternalOrders] =
        useState<IInternalProductProductionOrder[]>([]);
    const [loadingInternalOrders, setLoadingInternalOrders] =
        useState<boolean>(true);

    const fetchInternalOrders = async () => {
        setLoadingInternalOrders(true);
        dispatch(clearError("InternalOrders"));
        try {
            const data =
                await fetchInternalOrdersFromDB(dispatch);
            setInternalOrders(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "InternalOrders",
                    message: msg
                }));
        } finally {
            setLoadingInternalOrders(false);
        }
    };

    useEffect(() => {
        fetchInternalOrders();
    }, []);

    return {
        internalOrders,
        loadingInternalOrders,
        refetchInternalOrders:
            fetchInternalOrders,
    };
};

export default useInternalOrders;
