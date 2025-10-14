import { useDispatch } from "react-redux";
import { clearError } from "../../../store/slicer/errorSlicer";
import { fetchPurchasedOrdersFromDB } from "../queries/purchaseOrderQueries";
import useDebouncedFetch from "../../../hooks/useDebounce";
import type { AppDispatchRedux } from "../../../store/store";
import type { IPurchasedOrder } from "../../../interfaces/purchasedOrder";
import { useCallback, useMemo } from "react";
import type { IPartialPurchasedOrder } from "../../../interfaces/purchasedOrder";

interface UsePurchasedOrdersResult {
  purchasedOrders: IPurchasedOrder[];
  loadingPurchasedOrders: boolean;
}

const usePurchasedOrders = ({
  like,
  debounce,
  conditionalExclude
}: {
  like?: string | undefined;
  debounce?: number;
  conditionalExclude?: IPartialPurchasedOrder;
}): UsePurchasedOrdersResult => {
  const dispatch = useDispatch<AppDispatchRedux>();

  // Normaliza el query (trim) para evitar peticiones por espacios
  const normalizedQuery = useMemo(() => (like ?? "").trim(), [like]);

  // OJO: no metas el objeto en las deps sin una clave estable;
  // aquí solo lo pasamos hacia abajo; el hook hijo lo estabiliza con excludeKey
  const stableExclude = useMemo(() => conditionalExclude, [conditionalExclude]);

  // fetch estable: NO usar `like` del cierre; usar SIEMPRE el `query` que llega
  const stableFetch = useCallback(
    async ({ query, signal, conditionalExclude }: { query?: string; signal: AbortSignal; conditionalExclude?: IPartialPurchasedOrder }): Promise<IPurchasedOrder[]> => {
      dispatch(clearError("purchasedOrdersHook"));
      return fetchPurchasedOrdersFromDB({
        dispatch,
        like: query,                 // <- usa el query recibido
        signal,                // <- abort/cancel
        conditionsExclude: conditionalExclude     // <- lo que te pasen (opcional)
      });
    },
    [dispatch] // <- deps mínimas; NO dependas de exclude ni de like
  );

  const { data, loading } = useDebouncedFetch<IPurchasedOrder[], IPartialPurchasedOrder>({
    query: normalizedQuery,
    fetchFn: stableFetch,
    delay: debounce ?? 0,
    conditionalExclude: stableExclude
  });

  return {
    purchasedOrders: data ?? [],
    loadingPurchasedOrders: loading
  };
};

export default usePurchasedOrders;
