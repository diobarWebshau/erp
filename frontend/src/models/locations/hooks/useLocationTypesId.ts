import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    getLocationsByIdFromDB
} from "../../../queries/locationTypesQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError, clearError
} from "../../../store/slicer/errorSlicer";
import type {
    ILocationType
} from "../../../interfaces/locationTypes";

const useLocationTypes = (id: number | undefined) => {
    const dispatch: AppDispatchRedux =
        useDispatch();
    const [locationTypesOfLocation, setLocationTypesOfLocation] =
        useState<ILocationType[]>([]);
    const [loadingLocationTypesOfLocation, setLoadingLocationTypesOfLocation] =
        useState<boolean>(true);

    const fetchLocationTypes = async () => {
        setLoadingLocationTypesOfLocation(true);
        dispatch(clearError("LocationTypes"));
        try {
            const data = await getLocationsByIdFromDB(id, dispatch);
            setLocationTypesOfLocation(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "LocationTypes",
                    message: msg
                }));
        } finally {
            setLoadingLocationTypesOfLocation(false);
        }
    }

    useEffect(() => {
        fetchLocationTypes();
    }, [id]);

    return {
        locationTypesOfLocation,
        loadingLocationTypesOfLocation,
        refetchLocationTypes: fetchLocationTypes
    };

}


export default useLocationTypes;