import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getProductsByIdsExclude } from "./../queries/productsQueries";
import type { AppDispatchRedux } from "../../../store/store";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { IProduct } from "../../../interfaces/product";

const useProductsByExcludeIds = (excludeIds: number[]) => {

    // Variable para el dispatch de redux
    const dispatch = useDispatch<AppDispatchRedux>();

    // Variables para obtencion de los datos y el estatus de carga
    const [productsByExcludeIds, setProductsByExcludeIds] = useState<IProduct[]>([]);
    const [loadingProductsByExcludeIds, setLoadingProductsByExcludeIds] = useState<boolean>(true);

    // Variables apra el montaje y abortar peticiones
    const isMounted = useRef(true);

    // Variable para abortar peticiones anteriores
    const refetchAbortController = useRef<AbortController | null>(null);

    useEffect(() => {

        // Activamos el ref para indicar que el componente sigue montado
        isMounted.current = true;

        // Creamos un AbortController local para cancelar esta petición si el 
        // componente se desmonta. Guardamos la señal en signal y la pasamos
        // al fetch.
        const controller = new AbortController();
        const { signal } = controller;

        // * Funcion para obtener los datos
        const fetchProductsByExcludeIds = async () => {
            // Activamos el estado de carga
            setLoadingProductsByExcludeIds(true);
            // Limpiamos el error previo
            dispatch(clearError("useProductByExcludeIds"));
            try {
                // Realizamos la petición
                const data = await getProductsByIdsExclude(dispatch, excludeIds, signal);
                // Si el componente sigue montado, actualizamos el estado
                if (isMounted.current) setProductsByExcludeIds(data);
            } catch (err: unknown) {
                // Ignora aborts; deja pasar otros errores
                if (!(err instanceof DOMException && err.name === "AbortError")) {
                    return;
                }
                // manejamos el error que no es un abort
                const msg = err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
                dispatch(setError({ key: "useProductByExcludeIds", message: msg }));
            } finally {
                // Si el componente sigue montado, desactivamos el estado de carga
                if (isMounted.current) setLoadingProductsByExcludeIds(false);
            }
        };

        fetchProductsByExcludeIds();

        return () => {
            isMounted.current = false;
            controller.abort();
            // Abortamos cualquier fetch pendiente de refetch
            if (refetchAbortController.current) {
                refetchAbortController.current.abort();
                refetchAbortController.current = null;
            }
        };
    }, [excludeIds, dispatch]);

    // * Funcion para refetch los datos
    const refetchProductsByExcludeIds = async () => {

        // Si hay una petición pendiente, la abortamos
        if (refetchAbortController.current) {
            refetchAbortController.current.abort();
        }

        // Creamos un AbortController local para cancelar esta petición si el 
        // componente se desmonta. Guardamos la señal en signal y la pasamos
        // al fetch.
        const controller = new AbortController();
        refetchAbortController.current = controller;
        const { signal } = controller;

        // Activamos el estado de carga
        setLoadingProductsByExcludeIds(true);
        // Limpiamos el error previo
        dispatch(clearError("useProductByExcludeIds"));
        try {
            // Realizamos la petición
            const data = await getProductsByIdsExclude(dispatch, excludeIds, signal);
            // Si el componente sigue montado, actualizamos el estado
            if (isMounted.current) setProductsByExcludeIds(data);
        } catch (err: unknown) {
            // Ignora aborts; deja pasar otros errores
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                return;
            }
            // manejamos el error que no es un abort
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({ key: "useProductByExcludeIds", message: msg }));
        } finally {
            // Si el componente sigue montado, desactivamos el estado de carga
            if (isMounted.current) setLoadingProductsByExcludeIds(false);
            // Limpiamos el abort controller
            refetchAbortController.current = null;
        }
    };

    return {
        productsByExcludeIds,
        loadingProductsByExcludeIds,
        refetchProductsByExcludeIds,
    };
};

export default useProductsByExcludeIds;
