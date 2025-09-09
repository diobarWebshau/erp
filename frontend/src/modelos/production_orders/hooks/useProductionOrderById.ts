import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import type { IPartialProductionOrder } from "../../../interfaces/productionOrder";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import { useEffect, useState } from "react";
import { fetchProductionOrderByIdFromDB } from "../queries/productionOrdersQueries";


const useProductionOrderById = (
    id: number | undefined | null
) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [productionOrderById, setProductionOrderById] =
        useState<IPartialProductionOrder | null | undefined>(null);
    const [loadingProductionOrderById, setLoadingProductionOrderById] =
        useState<boolean>(true);

    const fetchProductionOrderByIdFunction = async () => {
        setLoadingProductionOrderById(true);
        dispatch(
            clearError("productionOrderByIdHook")
        );
        try {
            if (id) {
                const data =
                    await fetchProductionOrderByIdFromDB(
                        id,
                        dispatch
                    );

                console.log(`data`, data);
                setProductionOrderById(data ? { ...data } : null);
            } else {
                setProductionOrderById(null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "productionOrderByIdHook",
                    message: msg
                }));
        } finally {
            setLoadingProductionOrderById(false);
        }
    }


    useEffect(() => {
        fetchProductionOrderByIdFunction();
    }, [id]);

    return {
        productionOrderById,
        loadingProductionOrderById,
        refetchProductionOrderById:
            fetchProductionOrderByIdFunction,
    };
}

export default useProductionOrderById;
