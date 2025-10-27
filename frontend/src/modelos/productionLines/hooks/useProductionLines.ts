import type { IPartialProductionLine, IProductionLine } from "../../../interfaces/productionLines";
import type { AppDispatchRedux } from "../../../store/store";
import { useDispatch } from "react-redux";
import { fetchproductionLinesFromDB } from "../query/productionLinesQueries";
import { clearError } from "../../../store/slicer/errorSlicer";
import { useCallback, useMemo } from "react";
import useDebouncedFetch from "../../../hooks/useDebounce";

interface IuseProductionLinesProps {
    like?: string | undefined;
    debounce?: number;
    conditionsExclude?: IPartialProductionLine;
}

interface IFetchProductionLinesFromDB {
    query?: string;
    signal: AbortSignal;
    conditionsExclude?: IPartialProductionLine;
}

interface IuseProductionLineResult {
    productionLines: IProductionLine[];
    loadingProductionLines: boolean;
    refetchProductionLines: (options?: { immediate?: boolean }) => void;
}

const useProductionLines = ({
    like,
    debounce,
    conditionsExclude
}: IuseProductionLinesProps): IuseProductionLineResult => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const normalizedQuery = useMemo(() => (like ?? "").trim(), [like]);
    const stableExclude = useMemo(() => conditionsExclude, [conditionsExclude]);

    const stableFetch = useCallback(
        async ({ query, signal, conditionsExclude }: IFetchProductionLinesFromDB): Promise<IProductionLine[]> => {
            dispatch(clearError("productionLinesHook"));
            return fetchproductionLinesFromDB({
                dispatch,
                like: query,
                signal,
                conditionsExclude
            });
        },
        [dispatch]
    );

    const { data, loading, refetch } = useDebouncedFetch<IProductionLine[], IPartialProductionLine>({
        query: normalizedQuery,
        fetchFn: stableFetch,
        delay: debounce ?? 0,
        conditionalExclude: stableExclude
    });

    const refetchProductionLines = useCallback(
        (options?: { immediate?: boolean }) => {
            refetch(options);
        },
        [refetch]
    );

    return {
        productionLines: data ?? [],
        loadingProductionLines: loading,
        refetchProductionLines
    };
};

export default useProductionLines;


