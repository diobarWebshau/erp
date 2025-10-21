import {
    useState, useEffect,
    useRef
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchShippingOrderDetailByIdFromDB
} from "./../query/shippingOrderQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError, clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IShippingOrder
} from "../../../interfaces/shippingOrder";


const useShippingOrderDetailById = (id: number | null) => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const [shippingOrderDetailById, setShippingOrderDetailById] =
        useState<IShippingOrder | null>(null);
    const [loadingShippingOrderDetailById, setLoadingShippingOrderDetailById] =
        useState<boolean>(false);

    /*
        Este ref permite verificar si el componente sigue montado antes de hacer un 
        setState. Evita warnings y memory leaks como:
            "Can't perform a React state update on an unmounted component"
    */
    const isMounted = useRef(true);
    /*
        Permite abortar peticiones anteriores si el usuario hace un refetch
        muy rápido (por ejemplo, actualiza la vista antes de que termine la
        petición anterior).
    */
    const refetchAbortController =
        useRef<AbortController | null>(null);

    useEffect(() => {
        if (!id) return;

        /*
            Activamos el ref para indicar que el componente sigue montado.
        */
        isMounted.current = true;
        /*
            Creamos un AbortController local para cancelar esta petición si el 
            componente  se desmonta. Guardamos la señal en signal y la pasamos
            al fetch.
        */
        const controller = new AbortController();
        const { signal } = controller;

        const fetchShippingOrderDetailById = async () => {
            /* Activamos el estado de carga */
            setLoadingShippingOrderDetailById(true);
            /* Limpiamos el error previo */
            dispatch(clearError("ShippingOrderDetailById"));
            try {
                const data =
                    await fetchShippingOrderDetailByIdFromDB(
                        dispatch, id,
                        signal
                    );
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
                if (isMounted.current)
                    setShippingOrderDetailById(data || null);
            } catch (err: unknown) {
                /*
                    Como
                */
                if (!isMounted.current) return;

                if ((err as any).name === "AbortError") {
                    // petición abortada, silencioso
                    return;
                }

                const msg = err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
                dispatch(setError({
                    key: "ShippingOrderDetailById",
                    message: msg
                }));
            } finally {
                if (isMounted.current)
                    setLoadingShippingOrderDetailById(false);
            }
        };

        fetchShippingOrderDetailById();

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
    }, [id, dispatch]);

    const refetchShippingOrderDetailById = async () => {
        if (!id) return;

        // Abortamos cualquier fetch anterior de refetch en curso
        if (refetchAbortController.current) {
            refetchAbortController.current.abort();
        }

        const controller = new AbortController();
        refetchAbortController.current = controller;
        const signal = controller.signal;

        setLoadingShippingOrderDetailById(true);
        dispatch(clearError("ShippingOrderDetailById"));
        try {
            const data = await fetchShippingOrderDetailByIdFromDB(dispatch, id, signal);
            if (isMounted.current) setShippingOrderDetailById(data || null);
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
                key: "ShippingOrderDetailById",
                message: msg
            }));
        } finally {
            if (isMounted.current)
                setLoadingShippingOrderDetailById(false);
            refetchAbortController.current = null;
        }
    };

    return {
        shippingOrderDetailById,
        loadingShippingOrderDetailById,
        refetchShippingOrderDetailById,
    };
};

export default useShippingOrderDetailById;
