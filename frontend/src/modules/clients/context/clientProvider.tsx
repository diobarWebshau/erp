import { ClientDispatchContext, ClientCommandsContext, ClientStateContext } from "./clientContext";
import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import { setError } from "../../../store/slicer/errorSlicer";
import useClientById from "../../../modelos/clients/hooks/useClientsById";
import clientReducer from "./clientReducer";
import { initialClientState } from "./clientTypes";
import type { ClientState } from "./clientTypes";
import { set_client } from "./clientActions";
import type { IPartialClient } from "../../../interfaces/clients";

interface IClientModuleProvider {
    id: number | null;
    children: ReactNode;
    initialData?: IPartialClient;
    currentStep: number;
    totalSteps: number;
}

const init = (arg: {
    currentStep: number;
    totalSteps: number;
    baseData?: IPartialClient;
}): ClientState => ({
    ...initialClientState,
    current_step: arg.currentStep,
    total_steps: arg.totalSteps,
    data: { ...initialClientState.data, ...(arg.baseData ?? {}) },
    draft: { ...initialClientState.draft },
});

const ClientProvider = ({
    id,
    children,
    initialData,
    currentStep,
    totalSteps,
}: IClientModuleProvider) => {

    const { clientById, refetchClientById } = useClientById(id ?? null);
    const dispatchRedux: AppDispatchRedux = useDispatch();

    const initialArg = useMemo(
        () => ({
            currentStep,
            totalSteps,
            baseData: initialData ?? {},
        }),
        [currentStep, totalSteps, initialData]
    );

    const [state, dispatch] = useReducer(clientReducer, initialArg, init);

    const refetch = useCallback(async () => {
        if (!id) return;
        await refetchClientById();
    }, [id, refetchClientById]);

    const reset = useCallback(() => {
        const base = clientById ?? initialData ?? {};
        dispatch(set_client(base));
    }, [clientById, initialData, dispatch]);

    const commands = useMemo(() => ({ refetch, reset }), [refetch, reset]);

    useEffect(() => {
        if (id === null || !clientById) return;
        let cancelled = false;
        (async () => {
            try {
                if (!cancelled) {
                    dispatch(set_client(clientById));
                }
            } catch (e) {
                if (e instanceof Error) {
                    dispatchRedux(setError({
                        key: 'processClientById',
                        message: { validation: e.message }
                    }));
                } else {
                    console.error('processClientById failed:', e);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, clientById, dispatch]);

    return (
        <ClientDispatchContext.Provider value={dispatch}>
            <ClientStateContext.Provider value={state}>
                <ClientCommandsContext.Provider value={commands}>
                    {children}
                </ClientCommandsContext.Provider>
            </ClientStateContext.Provider>
        </ClientDispatchContext.Provider>
    );

}

export default ClientProvider;
