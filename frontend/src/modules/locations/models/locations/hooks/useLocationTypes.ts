import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchLocationTypesFromDB
} from "../../../../../queries/locationTypesQueries";
import type {
    AppDispatchRedux
} from "../../../../../store/store";
import {
    setError, clearError
} from "../../../../../store/slicer/errorSlicer";
import type {
    ILocationType
} from "../../../../../interfaces/locationTypes";

const useLocationTypes = () => {
    const dispatch: AppDispatchRedux =
        useDispatch();
    const [locationTypes, setLocationTypes] =
        useState<ILocationType[]>([]);
    const [loadingLocationTypes, setLoadingLocationTypes] =
        useState<boolean>(true);

    const fetchLocationTypes = async () => {
        setLoadingLocationTypes(true);
        dispatch(clearError("LocationTypes"));
        try {
            const data = await fetchLocationTypesFromDB(dispatch);
            setLocationTypes(data);
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
            setLoadingLocationTypes(false);
        }
    }

    useEffect(() => {
        fetchLocationTypes();
    }, []);

    return {
        locationTypes,
        loadingLocationTypes,
        refetchLocationTypes: fetchLocationTypes
    };

}


export default useLocationTypes;