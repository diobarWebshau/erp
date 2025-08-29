import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchPurchasedOrdersFromDB
} from "./../../../../../../queries/purchaseOrderQueries";
import type {
    AppDispatchRedux
} from "../../../../../../store/store";
import {
    setError,
    clearError
} from "../../../../../../store/slicer/errorSlicer";
import type {
    IPurchasedOrder
} from "../../../../../../interfaces/purchasedOrder";

const usePurchasedOrders = () => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [purchasedOrders, setPurchasedOrders] =
        useState<IPurchasedOrder[]>([]);
    const [loadingPurchasedOrders, setLoadingPurchasedOrders] =
        useState<boolean>(true);

    const fetchPurchasedOrders = async () => {
        setLoadingPurchasedOrders(true);
        dispatch(clearError("PurchasedOrders"));
        try {
            const data =
                await fetchPurchasedOrdersFromDB(dispatch);
            setPurchasedOrders(data);
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
            dispatch(setError({
                key: "PurchasedOrders",
                message: msg
            }));
        } finally {
            setLoadingPurchasedOrders(false);
        }
    };

    useEffect(() => {
        fetchPurchasedOrders();
    }, []);

    return {
        purchasedOrders,
        loadingPurchasedOrders,
        refetchPurchasedOrders:
            fetchPurchasedOrders,
    };
};

export default usePurchasedOrders;
