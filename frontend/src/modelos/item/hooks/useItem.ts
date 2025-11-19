import { useDispatch } from "react-redux";
import type { IItem, IPartialItem } from "../../../interfaces/item";
import type { AppDispatchRedux } from "../../../store/store";
import { useCallback, useMemo } from "react";
import { clearError } from "../../../store/slicer/errorSlicer";
import { fetchItemsFromDB } from "../query/itemsQueries";
import useDebouncedFetch from "../../../hooks/useDebounce";

type IUseItemsResultProps = {
    like?: string | undefined,
    debounce?: number,
    conditionalExclude?: IPartialItem
}

type IUseItemsResult = {
    items: IItem[];
    loadingItems: boolean;
    refetchItems: (options?: { immediate?: boolean }) => Promise<void>;
}

type IStableFetchProps = {
    query?: string;
    signal: AbortSignal;
    conditionalExclude?: IPartialItem;
}

type IRefetchItemsProps = {
    immediate?: boolean;
}

const useItems = ({
    like,
    debounce,
    conditionalExclude
}: IUseItemsResultProps): IUseItemsResult => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const normalizedQuery = useMemo(() => (like ?? "").trim(), [like]);
    const stableExclude = useMemo(() => conditionalExclude, [conditionalExclude]);

    const stableFetch = useCallback(async ({ query, signal, conditionalExclude }: IStableFetchProps) => {
        dispatch(clearError("Items"));
        return fetchItemsFromDB({
            like: query ?? "",
            signal,
            conditionalExclude
        })
    }, [dispatch]);

    const { data, loading, refetch } = useDebouncedFetch<IItem[], IPartialItem>({
        query: normalizedQuery,
        fetchFn: stableFetch,
        delay: debounce ?? 0,
        conditionalExclude: stableExclude
    });

    const refetchItems = useCallback(async (options?: IRefetchItemsProps): Promise<void> => refetch(options), [refetch]);

    return ({
        items: data ?? [],
        loadingItems: loading,
        refetchItems
    });
};


export default useItems;