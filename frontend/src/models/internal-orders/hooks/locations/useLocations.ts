import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchLocationsFromDB } from "./fetchs";
import type { AppDispatchRedux } from "../../../../store/store";
import { setError, clearError } from "../../../../store/slicer/errorSlicer";
import type {  ILocation} from "../../../../interfaces/locations";

const useLocations = () => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [locations, setLocations] = useState<ILocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState<boolean>(true);

    const fetchLocations = async () => {
        setLoadingLocations(true);
        dispatch(clearError("Locations"));
        try {
            const data = await fetchLocationsFromDB(dispatch);
            setLocations(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? { validation: err.message } : { validation: "Unknown error" };
            dispatch(setError({ key: "Locations", message: msg }));
        } finally {
            setLoadingLocations(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    return {
        locations,
        loadingLocations,
        refetchLocations: fetchLocations,
    };
};

export default useLocations;
