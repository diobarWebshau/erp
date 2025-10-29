import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchProductLike
} from "./../queries/productsQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IProduct
} from "../../../interfaces/product";

const useProductQueryLikeTo = (like: string) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [productsLike, setProductsLike] =
        useState<IProduct[]>([]);
    const [loadingProductsLike, setLoadingProductsLike] =
        useState<boolean>(true);

    const fetchProductsLike = async () => {
        setLoadingProductsLike(true);
        dispatch(
            clearError("useProductQueryLikeTo")
        );
        try {
            if (like) {
                const data =
                    await fetchProductLike(
                        like,
                        dispatch
                    );
                setProductsLike(data);
            } else {
                setProductsLike([]);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useProductQueryLikeTo",
                    message: msg    
                }));
        } finally {
            setLoadingProductsLike(false);
        }
    };

    useEffect(() => {
        fetchProductsLike();
    }, [like]);

    return {
        productsLike,
        loadingProductsLike,
        refetchProductsLike:
            fetchProductsLike,
    };
};

export default useProductQueryLikeTo;
