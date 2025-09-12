import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    getLocationWithAllInformation
} from "./../queries/locationsQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    ILocation
} from "../../../interfaces/locations";

const useLocationWithAllInformation = (
    location_id: number | undefined | null
) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [locationWithAllInformation, setLocationWithAllInformation] =
        useState<ILocation | null>(null);
    const [loadingLocationWithAllInformation, setLoadingLocationWithAllInformation] =
        useState<boolean>(true);

    const fetchClientByIdFunction = async () => {
        setLoadingLocationWithAllInformation(true);
        dispatch(
            clearError("locationWithAllInformationHook")
        );
        try {
            if (location_id) {
                const data =
                    await getLocationWithAllInformation(
                        location_id,
                        dispatch
                    );
                setLocationWithAllInformation(data);
            } else {
                setLocationWithAllInformation(null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "locationWithAllInformationHook",
                    message: msg
                }));
        } finally {
            setLoadingLocationWithAllInformation(false);
        }
    };

    useEffect(() => {
        fetchClientByIdFunction();
    }, [location_id]);

    return {
        locationWithAllInformation,
        loadingLocationWithAllInformation,
        refetchLocationWithAllInformation:
            fetchClientByIdFunction,
    };
};

export default useLocationWithAllInformation;
