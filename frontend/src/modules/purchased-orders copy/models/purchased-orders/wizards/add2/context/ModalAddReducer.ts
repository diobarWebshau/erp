import {
    current,
    isDraft,
    type Draft,
    type WritableDraft
} from "immer";
import {
    produce
} from "immer";
import type {
    ModalAddState,
    ModalAddAction,
} from "./modalAddTypes";
import {
    ModalAddActionsTypes,
    total_steps
} from "./modalAddTypes";
import {
    defaultValuePartialPurchasedOrder
} from "./../../../../../../../interfaces/purchasedOrder"
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../../interfaces/purchasedOrdersProducts";
import type {
    IPartialProductDiscountClient
} from "../../../../../../../interfaces/product-discounts-clients";


// * ****************** Initial State  ******************/

const initialState: ModalAddState = {
    total_steps: total_steps,
    current_step: 1,
    data: defaultValuePartialPurchasedOrder
}

// * ****************** Reducer  ******************/

const modalAddReducer = produce(
    (
        draft: Draft<ModalAddState>,
        action: ModalAddAction
    ) => {
        switch (action.type) {
            case ModalAddActionsTypes.SET_PURCHASE_ORDER:
                Object.assign(draft.data, action.payload);
                break;
            case ModalAddActionsTypes.UPDATE_PURCHASE_ORDER:
                Object.assign(draft.data, action.payload);
                break;
            case ModalAddActionsTypes.ADD_PURCHASE_ORDER_PRODUCTS: {
                const products = draft.data.purchase_order_products;
                const new_products: IPartialPurchasedOrderProduct[] =
                    action.payload as IPartialPurchasedOrderProduct[];
                let productsToAdd: IPartialPurchasedOrderProduct[] = [];

                if (new_products.length > 0) {

                    productsToAdd = new_products.map((p) => {
                        const product = p.product;

                        const discountsRanges = product?.product_discount_ranges ?? [];

                        const discountRangeApply = discountsRanges.find(range =>
                            range?.min_qty !== undefined &&
                            range?.max_qty !== undefined &&
                            1 >= range.min_qty &&
                            1 <= range.max_qty
                        );

                        const client_discounts: IPartialProductDiscountClient[] =
                            draft.data.client?.product_discounts_client ?? [];

                        const discountClientApply:
                            WritableDraft<IPartialProductDiscountClient> | undefined =
                            client_discounts.find(
                                discount => discount.product_id === p.product_id
                            );

                        const price = discountRangeApply
                            ? discountRangeApply.unit_price ?? 0
                            : Number(p?.original_price ?? 0)

                        const discountClientApplyDiscountPercentage: number =
                            (price * (100 - (discountClientApply?.discount_percentage ?? 0))) / 100;

                        if (
                            discountRangeApply !== undefined ||
                            discountClientApply !== undefined ||
                            (discountClientApply !== undefined &&
                                discountRangeApply !== undefined)
                        ) {
                            p.recorded_price = discountClientApplyDiscountPercentage;
                            p.was_price_edited_manually = false;
                        } else {
                            p.recorded_price = product?.sale_price;
                            p.was_price_edited_manually = null;
                        }

                        return p;
                    })
                }
                if (products && productsToAdd.length > 0) {
                    products.push(...productsToAdd);
                }
                break;
            }
            case ModalAddActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS: {
                const products = draft.data.purchase_order_products;
                if (products) {
                    const index = products.findIndex(
                        item => item.id === action.payload.id
                    );

                    if (index !== -1) {
                        products.splice(index, 1);
                    }
                }
                break;
            }
            case ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY: {
                const purchasedOrdersProducts: WritableDraft<IPartialPurchasedOrderProduct>[] =
                    draft.data.purchase_order_products ?? [];

                if (purchasedOrdersProducts.length > 0) {
                    const purchasedOrdersProduct = purchasedOrdersProducts.find(
                        item => item.product_id === action.payload.id
                    );
                    if (purchasedOrdersProduct) {
                        const product = purchasedOrdersProduct.product;

                        const discountsRanges = product?.product_discount_ranges ?? [];

                        const discountRangeApply = discountsRanges.find(range =>
                            range?.min_qty !== undefined &&
                            range?.max_qty !== undefined &&
                            action.payload.qty >= range.min_qty &&
                            action.payload.qty <= range.max_qty
                        );


                        const client_discounts: WritableDraft<IPartialProductDiscountClient>[] =
                            draft.data.client?.product_discounts_client ?? [];

                        const discountClientApply:
                            WritableDraft<IPartialProductDiscountClient> | undefined =
                            client_discounts.find(
                                discount => discount.product_id === action.payload.id
                            );

                        const price = discountRangeApply
                            ? discountRangeApply.unit_price ?? 0
                            : Number(purchasedOrdersProduct?.original_price ?? 0)

                        const discountClientApplyDiscountPercentage: number =
                            (price * (100 - (discountClientApply?.discount_percentage ?? 0))) / 100;

                        purchasedOrdersProduct.qty =
                            action.payload.qty;

                        if (
                            discountRangeApply !== undefined ||
                            discountClientApply !== undefined ||
                            (discountClientApply !== undefined &&
                                discountRangeApply !== undefined)
                        ) {
                            purchasedOrdersProduct.recorded_price = discountClientApplyDiscountPercentage;
                            purchasedOrdersProduct.was_price_edited_manually = false;
                        } else {
                            purchasedOrdersProduct.recorded_price = product?.sale_price;
                            purchasedOrdersProduct.was_price_edited_manually = null;
                        }
                    }
                }
                break;
            }
            case ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE: {
                const purchasedOrdersProducts: WritableDraft<IPartialPurchasedOrderProduct>[] =
                    draft.data.purchase_order_products ?? [];

                if (purchasedOrdersProducts.length > 0) {
                    const purchasedOrdersProduct = purchasedOrdersProducts.find(
                        item => item.product_id === action.payload.id
                    );
                    if (purchasedOrdersProduct) {

                        const product =
                            purchasedOrdersProduct.product;

                        const discountsRanges =
                            product?.product_discount_ranges ?? [];

                        const discountRangeApply = discountsRanges.find(range =>
                            range?.min_qty !== undefined &&
                            range?.max_qty !== undefined &&
                            purchasedOrdersProduct?.qty !== undefined &&
                            purchasedOrdersProduct?.qty >= range.min_qty &&
                            purchasedOrdersProduct?.qty <= range.max_qty
                        );

                        const client_discounts: WritableDraft<IPartialProductDiscountClient>[] =
                            draft.data.client?.product_discounts_client ?? [];

                        const discountClientApply:
                            WritableDraft<IPartialProductDiscountClient> | undefined =
                            client_discounts.find(
                                discount => discount.product_id === action.payload.id
                            );

                        const discountClientApplyDiscountPercentage: number =
                            (
                                discountRangeApply
                                    ? discountRangeApply.unit_price ?? 0
                                    : Number(purchasedOrdersProduct?.original_price ?? 0)
                            ) * ((discountClientApply?.discount_percentage ?? 100) / 100);

                        console.log(discountClientApplyDiscountPercentage);

                        purchasedOrdersProduct.recorded_price =
                            action.payload.recorded_price;

                        // si existe descuento de cliente por si solo, o por rango por si solo, o los tipos a la vez
                        // y el precio modificado es igual al precio calculado, entonces se aplico un descuento 
                        if (
                            (
                                discountRangeApply !== undefined ||
                                discountClientApply !== undefined ||
                                (discountClientApply !== undefined &&
                                    discountRangeApply !== undefined)
                            ) &&
                            (
                                action.payload.recorded_price ===
                                discountClientApplyDiscountPercentage
                            )
                        ) {
                            purchasedOrdersProduct.was_price_edited_manually = false;

                            // si el precio modificado es igual al precio original, no se aplica ningun descuento 
                        } else if (action.payload.recorded_price === Number(product?.sale_price)) {
                            purchasedOrdersProduct.was_price_edited_manually = null;
                            // si el precio no coincide con ninguno de los casos anteriores, entonces es un descuento personalizado
                        } else {
                            purchasedOrdersProduct.was_price_edited_manually = true;
                        }
                    }
                }
                break;
            }
            case ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL: {
                const purchasedOrdersProducts = draft.data.purchase_order_products;

                // if (purchasedOrdersProducts && isDraft(purchasedOrdersProducts)) {
                //     console.log("purchasedOrdersProducts (draft):", current(purchasedOrdersProducts));
                // } else {
                //     console.log("purchasedOrdersProducts (normal):", purchasedOrdersProducts);
                // }

                const purchasedOrdersProduct = purchasedOrdersProducts?.find(
                    item => item.product_id === action.payload.id
                );

                const product = purchasedOrdersProduct?.product;


                // if (purchasedOrdersProduct && isDraft(purchasedOrdersProduct)) {
                //     console.log("purchasedOrdersProduct (draft):", current(purchasedOrdersProduct));
                // } else {
                //     console.log("purchasedOrdersProduct (normal):", purchasedOrdersProduct);
                // }

                const qty = purchasedOrdersProduct?.qty;

                if (
                    purchasedOrdersProduct &&
                    typeof qty === "number" &&
                    qty > 0
                ) {
                    // purchasedOrdersProduct.was_price_edited_manually =
                    //     action.payload.was_price_edited_manually;

                    if (purchasedOrdersProduct.was_price_edited_manually === true) {

                        // if (product && isDraft(product)) {
                        //     console.log("product (draft):", current(product));
                        // } else {
                        //     console.log("product (normal):", product);
                        // }

                        const discountRanges =
                            product?.product_discount_ranges ?? [];

                        // if (discountRanges && isDraft(discountRanges)) {
                        //     console.log("discountRanges (draft):", current(discountRanges));
                        // } else {
                        //     console.log("discountRanges (normal):", discountRanges);
                        // }

                        const discountApply = discountRanges.find((range) => {
                            const min = Number(range.min_qty);
                            const max = Number(range.max_qty);
                            const parsedQty = Number(qty);

                            return (
                                !isNaN(min) &&
                                !isNaN(max) &&
                                !isNaN(parsedQty) &&
                                parsedQty >= min &&
                                parsedQty <= max
                            );
                        });

                        // if (discountApply && isDraft(discountApply)) {
                        //     console.log("discountApply (draft):", current(discountApply));
                        // } else {
                        //     console.log("discountApply (normal):", discountApply);
                        // }

                        if (discountApply) {
                            purchasedOrdersProduct.recorded_price =
                                discountApply.unit_price;
                            purchasedOrdersProduct.was_price_edited_manually =
                                false;
                        } else {
                            purchasedOrdersProduct.recorded_price =
                                product?.sale_price;
                            purchasedOrdersProduct.was_price_edited_manually =
                                action.payload.was_price_edited_manually;
                        }
                    }
                }
                break;
            }

            case ModalAddActionsTypes.SET_STEP:
                draft.current_step = action.payload;
                break;
            case ModalAddActionsTypes.BACK_STEP:
                const prev_step = draft.current_step - 1;
                draft.current_step = prev_step;
                break;
            case ModalAddActionsTypes.NEXT_STEP:
                const next_step = draft.current_step + 1;
                draft.current_step = next_step;
                break;
            case ModalAddActionsTypes.CLEAR:
                return initialState;
        }
    }
);

export {
    modalAddReducer,
    initialState
}