
import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    getProductionLinesForProductAtLocation
} from "./../queries/locationsQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IProductionLine
} from "../../../interfaces/productionLines";



const useProductionLinesForProductAtLocation = (
    product_id: number | undefined | null,
    location_id: number | undefined | null
) => {

    const dispatchRedux = useDispatch<AppDispatchRedux>();
    const [productionLinesForProductAtLocation, setProductionLinesForProductAtLocation] =
        useState<IProductionLine[]>([]);
    const [loadingProductionLinesForProductAtLocation, setLoadingProductionLinesForProductAtLocation] =
        useState<boolean>(true);


    const fetchProductionLinesForProductAtLocation = async () => {
        setLoadingProductionLinesForProductAtLocation(true);
        dispatchRedux(
            clearError("productionLinesForProductAtLocation")
        );
        try {
            if (product_id && location_id) {
                const data = await getProductionLinesForProductAtLocation(
                    product_id,
                    location_id,
                    dispatchRedux
                );
                setProductionLinesForProductAtLocation(data);
            } else {
                setProductionLinesForProductAtLocation([]);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatchRedux(
                setError({
                    key: "productionLinesForProductAtLocation",
                    message: msg
                }));
        } finally {
            setLoadingProductionLinesForProductAtLocation(false);
        }
    };

    useEffect(() => {
        fetchProductionLinesForProductAtLocation();
    }, [product_id, location_id]);

    return {
        productionLinesForProductAtLocation,
        loadingProductionLinesForProductAtLocation,
        refetchProductionLinesForProductAtLocation:
            fetchProductionLinesForProductAtLocation,
    };
}


export default useProductionLinesForProductAtLocation;