import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchProductsDiscountRangeFromDB
} from "../../../../../queries/productDiscountRanges";
import type {
    AppDispatchRedux
} from "../../../../../store/store";
import {
    setError, clearError
} from "../../../../../store/slicer/errorSlicer";
import type {
    CartProduct
} from "../../../../../store/slicer/cartSlicer";

const useDiscountRanges = (productId: number | undefined) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [discountRanges, setDiscountRanges] =
        useState<CartProduct>();
    const [loadingDiscountRanges, setLoadingDiscountRanges] =
        useState<boolean>(true);

    const fetchDiscountRanges = async () => {
        setLoadingDiscountRanges(true);
        dispatch(
            clearError("products")
        );
        try {
            const data =
                await fetchProductsDiscountRangeFromDB(
                    dispatch,
                    productId || 0
                );
            if (data) {
                setDiscountRanges(data);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({
                key: "discountRanges",
                message: msg
            }));
        } finally {
            setLoadingDiscountRanges(false);
        }
    };

    useEffect(() => {
        if (productId !== undefined) {
            fetchDiscountRanges();
        }
    }, [productId]);

    return {
        discountRanges,
        loadingDiscountRanges,
        refetchDiscountRanges:
            fetchDiscountRanges,
    };
};

export default useDiscountRanges;
