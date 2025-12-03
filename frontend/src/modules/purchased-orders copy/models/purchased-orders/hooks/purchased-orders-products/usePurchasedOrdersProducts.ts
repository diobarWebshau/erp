import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    getPurchasedOrderProductsByPOFromDB
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

const usePurchasedOrderProducts = (purchase_order_id: number | undefined
) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [purchasedOrderProducts, setPurchasedOrderProducts] =
        useState<IPurchasedOrderProduct[]>([]);
    const [loadingPurchasedOrderProducts, setLoadingPurchasedOrderProducts] =
        useState<boolean>(true);

    const fetchPurchasedOrderProducts = async (
        idOverride?: number
    ): Promise<IPurchasedOrderProduct[]> => {
        const id = idOverride ?? purchase_order_id;
        if (id === undefined) return [];

        setLoadingPurchasedOrderProducts(true);
        dispatch(clearError("PurchasedOrderProducts"));
        try {
            const data = await getPurchasedOrderProductsByPOFromDB(dispatch, id);
            setPurchasedOrderProducts(data);
            return data; // ✅ retorno explícito
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({
                key: "PurchasedOrderProducts",
                message: msg
            }));
            return [];
        } finally {
            setLoadingPurchasedOrderProducts(false);
        }
    };

    useEffect(() => {
        fetchPurchasedOrderProducts();
    }, [purchase_order_id]);

    return {
        purchasedOrderProducts,
        loadingPurchasedOrderProducts,
        refetchPurchasedOrderProducts:
            fetchPurchasedOrderProducts,
    };
};

export default usePurchasedOrderProducts;
