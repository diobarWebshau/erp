import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchLocationTypesFromDB } from "../query/locationTypesQueries";
import type { ILocationType } from "../../../interfaces/locationTypes";
import type { AppDispatchRedux } from "../../../store/store";
import { setError, clearError } from "../../../store/slicer/errorSlicer";

interface IUseLocationTypes {
    locationTypes: ILocationType[];
    loadingLocationTypes: boolean;
    refetchLocationTypes: () => Promise<void>;
}

const useLocationTypes = (): IUseLocationTypes => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const [locationTypes, setLocationTypes] = useState<ILocationType[]>([]);
    const [loadingLocationTypes, setLoadingLocationTypes] = useState<boolean>(true);

    const controllerRef = useRef<AbortController | null>(null);

    const refetchLocationTypes = useCallback(async () => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoadingLocationTypes(true);
        dispatch(clearError("locationTypes"));
        try {
            const data = await fetchLocationTypesFromDB({ signal: controller.signal, dispatch });
            if (controller.signal.aborted) return;
            setLocationTypes(data);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            const msg =
                err instanceof Error ? { validation: err.message } : { validation: "Unknown error" };
            dispatch(setError({ key: "locationTypes", message: msg }));
        } finally {
            if (!controller.signal.aborted) setLoadingLocationTypes(false);
        }
    }, [dispatch]);

    useEffect(() => {
        refetchLocationTypes();
        return () => {
            controllerRef.current?.abort();
        };
    }, [refetchLocationTypes]);

    return {
        locationTypes,
        loadingLocationTypes,
        refetchLocationTypes
    };
}

export default useLocationTypes;