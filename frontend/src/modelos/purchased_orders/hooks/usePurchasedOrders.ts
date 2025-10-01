import { useEffect, useState } from "react";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import { fetchPurchasedOrdersFromDB } from "../queries/purchaseOrderQueries";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import type { IPurchasedOrder } from "../../../interfaces/purchasedOrder";


const usePurchasedOrders = (
    like: string | undefined,
) => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [purchasedOrders, setPurchasedOrders] = useState<IPurchasedOrder[]>([]);
    const [loadingPurchasedOrders, setLoadingPurchasedOrders] = useState<boolean>(true);

    const fetchPurchasedOrdersFunction = async () => {
        setLoadingPurchasedOrders(true);
        dispatch(
            clearError("purchasedOrdersHook")
        );
        try {
            const data = await fetchPurchasedOrdersFromDB(dispatch, like);
            setPurchasedOrders(data);
        } catch (err: unknown) {
            console.log(err);
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Error al obtener las ordenes de compra" };
            dispatch(
                setError({
                    key: "purchasedOrdersHook",
                    message: msg
                })
            );
        } finally {
            setLoadingPurchasedOrders(false);
        }
    }

    useEffect(() => {
        fetchPurchasedOrdersFunction();
    }, [like]);

    return {
        purchasedOrders,
        loadingPurchasedOrders,
        refetchPurchasedOrders:
            fetchPurchasedOrdersFunction
    }
}

export default usePurchasedOrders
