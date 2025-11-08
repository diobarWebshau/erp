import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchClientById2 } from "../queries/clientsQueries";
import type { AppDispatchRedux } from "../../../store/store";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { IClient } from "../../../interfaces/clients";

const useClientById = (id: number | undefined | null) => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const [clientById, setClientById] = useState<IClient | null>(null);
    const [loadingClientById, setLoadingClientById] = useState<boolean>(true);
    const isMounted = useRef(true);
    const refetchAbortController = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!id) return;

        isMounted.current = true;

        const controller = new AbortController();
        const { signal } = controller;

        const fetchClientByIdFunction = async () => {
            /* Activamos el estado de carga */
            setLoadingClientById(true);
            /* Limpiamos el error previo */
            dispatch(clearError("clientByIdHook"));
            try {
                const data = await fetchClientById2({
                    id,
                    dispatch,
                    signal
                });
                /*
                    Si el componente sigue montado, actualizamos el estado (Esto 
                    evita warnings y memory leaks)
                */
                /*
                    Los leaks ocurren cuando se intenta actualizar el estado de un 
                    componente que ya no está montado. Por ejemplo, si el usuario 
                    hace un refetch muy rápido, la petición anterior puede intentar
                    actualizar el estado de un componente que ya no está montado. 
                    Por lo tanto, antes de actualizar el estado, verificamos si el
                    componente sigue montado. El termino "memory leaks" se refiere
                    a fugas de memoria, que ocurren cuando se pierde la referencia
                    a un objeto que ya no se necesita.
                */
                if (isMounted.current) setClientById(data || null);
            } catch (err: unknown) {
                if (!isMounted.current) return;
                if ((err as any).name === "AbortError") {
                    // petición abortada, silencioso
                    return;
                }
                const msg = err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
                dispatch(setError({
                    key: "clientByIdHook",
                    message: msg
                }));
            } finally {
                if (isMounted.current)
                    setLoadingClientById(false);
            }
        };

        fetchClientByIdFunction();

        return () => {
            isMounted.current = false;
            controller.abort();
            // Abortamos cualquier fetch pendiente de refetch
            if (refetchAbortController.current) {
                refetchAbortController.current.abort();
                refetchAbortController.current = null;
            }
        };
        // cuando cambia el id o el dispatch( el dispatch es para cuando se refetch ya que este es el que )

    }, [id]);

    const refetchClientById = async () => {
        if (!id) return;

        // Abortamos cualquier fetch anterior de refetch en curso
        if (refetchAbortController.current) {
            refetchAbortController.current.abort();
        }

        const controller = new AbortController();
        refetchAbortController.current = controller;
        const signal = controller.signal;

        setLoadingClientById(true);
        dispatch(clearError("clientByIdHook"));
        try {
            const data = await fetchClientById2({
                id,
                dispatch,
                signal
            });
            if (isMounted.current) setClientById(data || null);
        } catch (err: unknown) {
            if (!isMounted.current) return;
            if ((err as any).name === "AbortError") {
                // petición abortada, silencioso
                return;
            }
            const msg =
                err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
            dispatch(setError({
                key: "clientByIdHook",
                message: msg
            }));
        } finally {
            if (isMounted.current)
                setLoadingClientById(false);
            refetchAbortController.current = null;
        }
    };
    return {
        clientById,
        loadingClientById,
        refetchClientById,
    };
};

export default useClientById;
