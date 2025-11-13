import { getLocationWithAllInformationFromDB } from "../../../modelos/locations/queries/locationsQueries";
import type { ILocation, IPartialLocation } from "../../../interfaces/locations";
import { clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import useDebouncedFetch from "../../../hooks/useDebounce";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

interface IuseAllLocationsProps {
    like?: string | undefined;
    debounce?: number;
    conditionsExclude?: IPartialLocation;
}

interface IFetchAllLocationsFromDB {
    query?: string;
    signal: AbortSignal;
    conditionsExclude?: IPartialLocation;
}

interface IuseAllLocationsResult {
    locations: ILocation[];
    loadingLocations: boolean;
    refetchLocations: (options?: { immediate?: boolean }) => void;
}

const useAllLocations = ({
    like,
    debounce,
    conditionsExclude
}: IuseAllLocationsProps): IuseAllLocationsResult => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const normalizedQuery = useMemo(() => (like ?? "").trim(), [like]);
    const stableExclude = useMemo(() => conditionsExclude, [conditionsExclude]);

    const stableFetch = useCallback(
        async ({ query, signal, conditionsExclude }: IFetchAllLocationsFromDB): Promise<ILocation[]> => {
            dispatch(clearError("allLocationsHook"));
            return getLocationWithAllInformationFromDB({
                dispatch,
                like: query,
                signal,
                conditionsExclude
            });
        },
        [dispatch]
    );

    const { data, loading, refetch } = useDebouncedFetch<ILocation[], IPartialLocation>({
        query: normalizedQuery,
        fetchFn: stableFetch,
        delay: debounce ?? 0,
        conditionalExclude: stableExclude
    });

    const refetchLocations = useCallback(
        (options?: { immediate?: boolean }) => {
            refetch(options);
        },
        [refetch]
    );

    return {
        locations: data ?? [],
        loadingLocations: loading,
        refetchLocations
    };
};

export default useAllLocations;


