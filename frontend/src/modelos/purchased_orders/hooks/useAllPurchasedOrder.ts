import { fetchPurchasedOrdersFromDB } from "../../../modelos/purchased_orders/queries/purchaseOrderQueries";
import { clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import useDebouncedFetch from "../../../hooks/useDebounce";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import type { IPartialPurchasedOrder, IPurchasedOrder } from "interfaces/purchasedOrder";

interface IuseAllPurchasedOrdersProps {
    like?: string | undefined;
    debounce?: number;
    conditionsExclude?: IPartialPurchasedOrder;
}

interface IFetchAllPurchasedOrdersFromDB {
    query?: string;
    signal: AbortSignal;
    conditionsExclude?: IPartialPurchasedOrder;
}

interface IuseAllPurchasedOrderResult {
    purchasedOrders: IPurchasedOrder[];
    loadingPurchasedOrder: boolean;
    refetchPurchasedOrder: (options?: { immediate?: boolean }) => void;
}

const useAllLocations = ({
    like,
    debounce,
    conditionsExclude
}: IuseAllPurchasedOrdersProps): IuseAllPurchasedOrderResult => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const normalizedQuery: string = useMemo(() => (like ?? "").trim(), [like]);
    const stableExclude: IPartialPurchasedOrder | undefined = useMemo(() => conditionsExclude, [conditionsExclude]);

    const stableFetch = useCallback(
        async ({ query, signal, conditionsExclude }: IFetchAllPurchasedOrdersFromDB): Promise<IPurchasedOrder[]> => {
            dispatch(clearError("allPurchasedOrderHook"));
            return fetchPurchasedOrdersFromDB({
                dispatch,
                like: query,
                signal,
                conditionsExclude
            });
        },
        [dispatch]
    );

    const { data, loading, refetch } = useDebouncedFetch<IPurchasedOrder[], IPartialPurchasedOrder>({
        query: normalizedQuery,
        fetchFn: stableFetch,
        delay: debounce ?? 0,
        conditionalExclude: stableExclude
    });

    const refetchPurchasedOrder = useCallback(
        (options?: { immediate?: boolean }) => {
            refetch(options);
        },
        [refetch]
    );

    return {
        purchasedOrders: data ?? [],
        loadingPurchasedOrder: loading,
        refetchPurchasedOrder
    };
};

export default useAllLocations;


