import { useEffect, useState } from "react";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import { fetchLocationsFromDB } from "../queries/locationsQueries";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import type { ILocation } from "../../../interfaces/locations";


const useAllLocations = () => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [locations, setLocations] = useState<ILocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState<boolean>(false);

    const fetchLocationsFromDBFunction = async () => {
        setLoadingLocations(true);
        dispatch(
            clearError("getLocationsHook")
        );
        try {
            const data = await fetchLocationsFromDB(dispatch);
            setLocations(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "getLocationsHook",
                    message: msg
                }));
        } finally {
            setLoadingLocations(false);
        }
    };

    useEffect(() => {
        fetchLocationsFromDBFunction();
    }, []);

    return {
        locations,
        loadingLocations,
        fetchLocationsFromDBFunction
    };
}


export default useAllLocations;
