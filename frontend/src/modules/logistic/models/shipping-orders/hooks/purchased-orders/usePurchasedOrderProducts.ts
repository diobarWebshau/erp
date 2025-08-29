import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchPurchasedOrderProductsByClientAddressFromDB
} from "./../../../../../../queries/purchasdedOrderProductQueries";
import type {
    AppDispatchRedux
} from "../../../../../../store/store";
import {
    setError, clearError
} from "../../../../../../store/slicer/errorSlicer";
import type {
    IPurchasedOrderProduct
} from "../../../../../../interfaces/purchasedOrdersProducts";

const usePurchasedOrderProductsByClientAddress = (client_address_id: number | undefined) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [purchasedOrdersProducts, setPurchasedOrdersProducts] =
        useState<IPurchasedOrderProduct[]>([]);
    const [loadingPurchasedOrdersProducts, setLoadingPurchasedOrdersProducts] =
        useState<boolean>(true);

    const fetchPurchasedOrders = async () => {
        setLoadingPurchasedOrdersProducts(true);
        dispatch(clearError("PurchasedOrdersProductsByAddress"));
        try {
            const data =
                await fetchPurchasedOrderProductsByClientAddressFromDB(
                    dispatch, client_address_id
                );

            setPurchasedOrdersProducts(data);
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
            dispatch(setError({
                key: "PurchasedOrdersProductsByAddress",
                message: msg
            }));
        } finally {
            setLoadingPurchasedOrdersProducts(false);
        }
    };

    useEffect(() => {
        fetchPurchasedOrders();
    }, []);

    return {
        purchasedOrdersProducts,
        loadingPurchasedOrdersProducts,
        refetchPurchasedOrders:
            fetchPurchasedOrders,
    };
};

export default usePurchasedOrderProductsByClientAddress;
