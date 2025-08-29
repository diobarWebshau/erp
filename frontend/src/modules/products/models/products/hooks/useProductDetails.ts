import {
    fetchProductDetails,
} from "../../../../../queries/productsQueries";
import {
    setError,
    clearError,
} from "../../../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../../../store/store";
import {
    useDispatch
} from "react-redux";
import {
    useState, useEffect
} from "react";
import type {
    IProduct
} from "../../../../../interfaces/product";

const useProductDetails = (productId: number | undefined) => {

    const [loadingProductDetails, setLoadingProductDetails] =
        useState(false);
    const [productDetails, setProductDetails] =
        useState<IProduct | null>(null);
    const dispatch: AppDispatchRedux =
        useDispatch();

    const fetchProductDetailsFunction = async () => {
        setLoadingProductDetails(true);
        dispatch(
            clearError("useProductDetails")
        )
        try {
            if (productId) {
                const data =
                    await fetchProductDetails(
                        productId,
                        dispatch
                    );
                setProductDetails(data);
            } else {
                setProductDetails(null);
            }
        } catch (err) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useProductDetails",
                    message: msg
                }));
        } finally {
            setLoadingProductDetails(false);
        }
    }

    useEffect(() => {
        fetchProductDetailsFunction();
    }, [productId]);

    return {
        productDetails,
        loadingProductDetails,
        refetchProductDetails:
            fetchProductDetailsFunction
    };
};

export default useProductDetails;
