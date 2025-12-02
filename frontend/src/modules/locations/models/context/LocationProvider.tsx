import type { LocationState } from "./locationTypes";
import { LocationDispatchContext, LocationStateContext, LocationCommandsContext } from "./locationContext";
import { set_location } from "./locationActions";
import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../../store/store";
import { setError } from "../../../../store/slicer/errorSlicer";
import useLocationsWithAllInformation from "../../../../modelos/locations/hooks/useLocationsWithAllInformation";
import locationReducer from "./locationReducer";
import { initialLocationState } from "./locationTypes";
import type { IPartialLocation } from "../../../../interfaces/locations";

interface ILocationModuleProvider {
    id: number | null;
    children: ReactNode;
    initialData?: IPartialLocation;
    currentStep: number;
    totalSteps: number;
}

const init = (arg: {
    currentStep: number;
    totalSteps: number;
    baseData?: IPartialLocation;
}): LocationState => ({
    ...initialLocationState,
    current_step: arg.currentStep,
    total_steps: arg.totalSteps,
    data: { ...initialLocationState.data, ...(arg.baseData ?? {}) },
    draft: { ...initialLocationState.draft },
});

const LocationProvider = ({
    id,
    children,
    initialData,
    currentStep,
    totalSteps,
}: ILocationModuleProvider) => {

    const { locationWithAllInformation, refetchLocationWithAllInformation } = useLocationsWithAllInformation(id);
    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();

    const initialArg = useMemo(() => ({
        currentStep,
        totalSteps,
        baseData: initialData ?? {},
    }), [currentStep, totalSteps, initialData]);

    const [state, dispatch] = useReducer(locationReducer, initialArg, init);


    const refetch = useCallback(async () => {
        if (!id) return;
        await refetchLocationWithAllInformation();
    }, [id, refetchLocationWithAllInformation]);

    const reset = useCallback(() => {
        const base = locationWithAllInformation ?? initialData ?? {};
        dispatch(set_location(base));
    }, [locationWithAllInformation, initialData, dispatch]);

    const commands = useMemo(() => ({ refetch, reset }), [refetch, reset]);

    useEffect(() => {
        if (id === null || !locationWithAllInformation) return;
        let cancelled = false;
        (async () => {
            try {
                if (!cancelled) {
                    dispatch(set_location(locationWithAllInformation));
                }
            } catch (e) {
                if (e instanceof Error) {
                    dispatchRedux(setError({
                        key: 'processLocationById',
                        message: { validation: e.message }
                    }));
                } else {
                    console.error('processLocationById failed:', e);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, locationWithAllInformation, dispatch, dispatchRedux]);

    return (
        <LocationDispatchContext.Provider value={dispatch}>
            <LocationStateContext.Provider value={state}>
                <LocationCommandsContext.Provider value={commands}>
                    {children}
                </LocationCommandsContext.Provider>
            </LocationStateContext.Provider>
        </LocationDispatchContext.Provider>
    );
};


export default LocationProvider;