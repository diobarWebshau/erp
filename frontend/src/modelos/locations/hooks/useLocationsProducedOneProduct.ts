import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    getLocationsProducedOneProduct
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

const useLocationsProducedOneProduct = (product_id: number | undefined | null) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [locationsProducedProduct, setLocationsProducedProduct] =
        useState<ILocation[]>([]);
    const [loadingLocationsProducedProduct, setLoadingLocationsProducedProduct] =
        useState<boolean>(true);

    const fetchClientByIdFunction = async () => {
        setLoadingLocationsProducedProduct(true);
        dispatch(
            clearError("locationsProducedProductHook")
        );
        try {
            if (product_id) {
                const data =
                    await getLocationsProducedOneProduct(
                        product_id,
                        dispatch
                    );
                setLocationsProducedProduct(data);
            } else {
                setLocationsProducedProduct([]);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "locationsProducedProductHook",
                    message: msg
                }));
        } finally {
            setLoadingLocationsProducedProduct(false);
        }
    };

    useEffect(() => {
        fetchClientByIdFunction();
    }, [product_id]);

    return {
        locationsProducedProduct,
        loadingLocationsProducedProduct,
        refetchLocationsProducedProduct:
            fetchClientByIdFunction,
    };
};

export default useLocationsProducedOneProduct;
