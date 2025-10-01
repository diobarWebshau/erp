import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    getPurchasedOrderByIdInDB
} from "./../queries/purchaseOrderQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IPurchasedOrder
} from "../../../interfaces/purchasedOrder";

const usePurchasedOrderById = (id: number | undefined | null) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [purchasedOrderById, setPurchasedOrderById] =
        useState<IPurchasedOrder | null>(null);
    const [loadingPurchasedOrderById, setLoadingPurchasedOrderById] =
        useState<boolean>(true);

    const fetchPurchasedOrderByIdFunction = async () => {
        setLoadingPurchasedOrderById(true);
        dispatch(
            clearError("purchasedOrderByIdHook")
        );
        try {
            if (id) {
                const data =
                    await getPurchasedOrderByIdInDB(
                        dispatch,
                        id
                    );
                console.log("dasdsds")
                console.log(data);
                setPurchasedOrderById(data);
            } else {
                setPurchasedOrderById(null);
            }
        } catch (err: unknown) {
            console.log(err);
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "purchasedOrderByIdHook",
                    message: msg
                }));
        } finally {
            setLoadingPurchasedOrderById(false);
        }
    };

    useEffect(() => {
        fetchPurchasedOrderByIdFunction();
    }, [id]);

    return {
        purchasedOrderById,
        loadingPurchasedOrderById,
        refetchPurchasedOrderById:
            fetchPurchasedOrderByIdFunction,
    };
};

export default usePurchasedOrderById;
