// import { useEffect, useState } from "react";
// import { clearError, setError } from "../../../store/slicer/errorSlicer";
// import { fetchPurchasedOrdersFromDB } from "../queries/purchaseOrderQueries";
// import { useDispatch } from "react-redux";
// import type { AppDispatchRedux } from "../../../store/store";
// import type { IPurchasedOrder } from "../../../interfaces/purchasedOrder";


// const usePurchasedOrders = (
//     like: string | undefined,
// ) => {
//     const dispatch = useDispatch<AppDispatchRedux>();
//     const [purchasedOrders, setPurchasedOrders] = useState<IPurchasedOrder[]>([]);
//     const [loadingPurchasedOrders, setLoadingPurchasedOrders] = useState<boolean>(true);

//     const fetchPurchasedOrdersFunction = async () => {
//         setLoadingPurchasedOrders(true);
//         dispatch(
//             clearError("purchasedOrdersHook")
//         );
//         try {
//             const data = await fetchPurchasedOrdersFromDB(dispatch, like);
//             setPurchasedOrders(data);
//         } catch (err: unknown) {
//             console.log(err);
//             const msg = err instanceof Error
//                 ? { validation: err.message }
//                 : { validation: "Error al obtener las ordenes de compra" };
//             dispatch(
//                 setError({
//                     key: "purchasedOrdersHook",
//                     message: msg
//                 })
//             );
//         } finally {
//             setLoadingPurchasedOrders(false);
//         }
//     }

//     useEffect(() => {
//         fetchPurchasedOrdersFunction();
//     }, [like]);

//     return {
//         purchasedOrders,
//         loadingPurchasedOrders,
//         refetchPurchasedOrders:
//             fetchPurchasedOrdersFunction
//     }
// }
// export default usePurchasedOrders


import { useDispatch } from "react-redux";
import { clearError } from "../../../store/slicer/errorSlicer";
import { fetchPurchasedOrdersFromDB } from "../queries/purchaseOrderQueries";
import useDebouncedFetch from "../../../hooks/useDebounce";
import type { AppDispatchRedux } from "../../../store/store";
import type { IPurchasedOrder } from "../../../interfaces/purchasedOrder";
import { useCallback } from "react";

interface UsePurchasedOrdersResult {
    purchasedOrders: IPurchasedOrder[];
    loadingPurchasedOrders: boolean;
}

/**
 * Hook para obtener las órdenes de compra con debounce.
 * Usa Redux para manejo de errores y useDebouncedFetch para debounce y cancelación.
 *
 * @param like Texto a buscar en las órdenes de compra
 * @returns { purchasedOrders, loadingPurchasedOrders }
 */
const usePurchasedOrders = (like: string | undefined, debounce: number): UsePurchasedOrdersResult => {
    const dispatch = useDispatch<AppDispatchRedux>();

    const stableFetch = useCallback(
        async (query: string, signal: AbortSignal): Promise<IPurchasedOrder[]> => {
            // Limpiamos errores previos en Redux
            dispatch(clearError("purchasedOrdersHook"));
            // Ejecutamos la petición a DB
            return await fetchPurchasedOrdersFromDB(dispatch, query, signal);
        },
        [dispatch] // como usamos una variable externa (dispatch), debemos agregarla a las deps
    );

    // 1️⃣ Usamos useDebouncedFetch y pasamos la lógica de fetch
    const { data, loading } = useDebouncedFetch<IPurchasedOrder[]>(
        like ?? "", // query
        stableFetch,
        debounce // debounce en ms
    );

    // 2️⃣ Retornamos datos y estado de carga
    return {
        purchasedOrders: data ?? [],
        loadingPurchasedOrders: loading,
    };
};

export default usePurchasedOrders;
