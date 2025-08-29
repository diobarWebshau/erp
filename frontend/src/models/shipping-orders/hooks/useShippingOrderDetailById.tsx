import {
    useState, useEffect
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchShippingOrderDetailByIdFromDB
} from "./../../../queries/shippingOrderQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError, clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IShippingOrder
} from "../../../interfaces/shippingOrder";

const useShippingOrderDetailById = (id: number | undefined) => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [shippingOrderDetailById, setShippingOrderDetailById] =
        useState<IShippingOrder | null>(null);
    const [loadingShippingOrderDetailById,
        setLoadingShippingOrderDetailById] =
        useState<boolean>(true);

    const fetchShippingOrderDetailById = async () => {
        setLoadingShippingOrderDetailById(true);
        dispatch(
            clearError("ShippingOrderDetailById")
        );
        try {
            const data =
                await fetchShippingOrderDetailByIdFromDB(
                    dispatch,
                    id
                );
            setShippingOrderDetailById(data || null);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({
                key:
                    "ShippingOrderDetailById",
                message: msg
            }));
        } finally {
            setLoadingShippingOrderDetailById(false);
        }
    };

    useEffect(() => {
        fetchShippingOrderDetailById();
    }, [id]);

    return {
        shippingOrderDetailById,
        loadingShippingOrderDetailById,
        refetchShippingOrderDetailById:
            fetchShippingOrderDetailById,
    };
};

export default useShippingOrderDetailById;
