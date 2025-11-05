import { useCallback, useMemo } from "react";
import type { IClient, IPartialClient } from "../../../interfaces/clients";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import useDebouncedFetch from "../../../hooks/useDebounce";
import { clearError } from "../../../store/slicer/errorSlicer";
import { fetchClientsFromDB } from "../queries/clientsQueries";

interface IuseClientsProps {
    like?: string;
    debounce?: number;
    conditionsExclude?: IPartialClient;
}

interface IFetchClientsFromDB {
    query?: string;
    signal: AbortSignal;
    conditionsExclude?: IPartialClient;
}

interface IuseClientsResult {
    clients: IClient[];
    loadingClients: boolean;
    refetchClients: (options?: { immediate?: boolean }) => void;
}


const useClients = ({
    like,
    debounce,
    conditionsExclude
}: IuseClientsProps): IuseClientsResult => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const normalizedQuery = useMemo(() => (like ?? "").trim(), [like]);
    const stableExclude = useMemo(() => conditionsExclude, [conditionsExclude]);

    const stableFetch = useCallback(
        async ({ query, signal, conditionsExclude }: IFetchClientsFromDB): Promise<IClient[]> => {
            dispatch(clearError("clientsHook"));
            return fetchClientsFromDB({
                dispatch,
                like: query,
                conditionsExclude,
                signal,
            });
        },
        [dispatch]
    );

    const { data, loading, refetch } = useDebouncedFetch<IClient[], IPartialClient>({
        query: normalizedQuery,
        fetchFn: stableFetch,
        delay: debounce ?? 0,
        conditionalExclude: stableExclude
    });

    const refetchClients = useCallback(
        (options?: { immediate?: boolean }) => {
            refetch(options);
        },
        [refetch]
    );
    return {
        clients: data ?? [],
        loadingClients: loading,
        refetchClients
    }
}

export default useClients;
