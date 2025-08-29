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
    ModalEditState,
    ModalEditAction,
} from "./modalEditTypes";
import {
    ModalEditActionsTypes,
    total_steps
} from "./modalEditTypes";
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../../interfaces/purchasedOrdersProducts";
import type {
    IPartialPurchasedOrder
} from "../../../../../../../interfaces/purchasedOrder";
import type {
    IPartialAppliedProductDiscountClient
} from "../../../../../../../interfaces/appliedProductDiscountClient";
import type {
    IPartialAppliedProductDiscountRange
} from "../../../../../../../interfaces/appliedProductDiscountRange";
import type {
    IPartialProductDiscountClient
} from "../../../../../../../interfaces/product-discounts-clients";


// * ****************** Initial State  ******************/

const initialState: ModalEditState = {
    total_steps: total_steps,
    current_step: 4,
    data: {},
    updated: {}
}

// * ****************** Reducer  ******************/

const modalEditReducer = produce(
    (
        draft: Draft<ModalEditState>,
        action: ModalEditAction
    ) => {
        switch (action.type) {
            case ModalEditActionsTypes.SET_PURCHASE_ORDER:
                const purchasedOrder: IPartialPurchasedOrder =
                    action.payload;
                const purchasedOrderProducts =
                    purchasedOrder.purchase_order_products || []

                if (purchasedOrderProducts.length > 0) {
                    const newPurchasedOrderProducts = purchasedOrderProducts.map((p) => {

                        const rangeDiscount: IPartialAppliedProductDiscountRange | undefined =
                            p.applied_product_discount_range || undefined

                        const clientDiscounts: IPartialAppliedProductDiscountClient | undefined =
                            p.applied_product_discount_client || undefined;

                        const price = rangeDiscount
                            ? rangeDiscount.unit_discount || 0
                            : Number(p?.original_price || 0)

                        if (
                            rangeDiscount !== undefined ||
                            clientDiscounts !== undefined ||
                            (clientDiscounts !== undefined &&
                                rangeDiscount !== undefined)
                        ) {
                            p.was_price_edited_manually = false;
                        } else if (p.recorded_price === p.original_price) {
                            p.was_price_edited_manually = null;
                        } else {
                            p.was_price_edited_manually = true;
                        }
                        return p;
                    });
                    purchasedOrder.purchase_order_products = newPurchasedOrderProducts;
                    Object.assign(draft.data, action.payload);
                }

                break;
            case ModalEditActionsTypes.UPDATE_PURCHASE_ORDER:
                Object.assign(draft.updated, action.payload);
                break;
            case ModalEditActionsTypes.ADD_PURCHASE_ORDER_PRODUCTS: {
                const products = draft.updated.purchase_order_products;
                if (products) {
                    products.push(...action.payload);
                }
                break;
            }
            case ModalEditActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS: {
                const products = draft.updated.purchase_order_products;
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
            case ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY: {
                const purchasedOrdersProducts: WritableDraft<IPartialPurchasedOrderProduct>[] =
                    draft.updated.purchase_order_products ?? [];

                if (purchasedOrdersProducts.length > 0) {
                    const purchasedOrdersProduct = purchasedOrdersProducts.find(
                        item => item.product_id === action.payload.id
                    );
                    if (purchasedOrdersProduct) {
                        const product = purchasedOrdersProduct.product;

                        // if (product && isDraft(product)) {
                        //     console.log("product (draft):", current(product));
                        // } else {
                        //     console.log("product (normal):", product);
                        // }
                        const discountsRanges = product?.product_discount_ranges ?? [];


                        const discountRangeApply = discountsRanges.find(range =>
                            range?.min_qty !== undefined &&
                            range?.max_qty !== undefined &&
                            action.payload.qty >= range.min_qty &&
                            action.payload.qty <= range.max_qty
                        );

                        // if (discountRangeApply && isDraft(discountRangeApply)) {
                        //     console.log("discountRangeApply (draft):", current(discountRangeApply));
                        // } else {
                        //     console.log("discountRangeApply (normal):", discountRangeApply);
                        // }

                        const client_discounts: WritableDraft<IPartialProductDiscountClient>[] =
                            draft.updated.client?.pruduct_discounts_client ?? [];

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


                        // if (discountRangeApply && isDraft(discountRangeApply)) {
                        //     console.log("discountRangeApply (draft):", current(discountRangeApply));
                        // } else {
                        //     console.log("discountRangeApply (normal):", discountRangeApply);
                        // }

                        // if (discountClientApply && isDraft(discountClientApply)) {
                        //     console.log("discountClientApply (draft):", current(discountClientApply));
                        // } else {
                        //     console.log("discountClientApply (normal):", discountClientApply);
                        // }

                        if (
                            discountRangeApply === undefined && discountClientApply ||
                            discountClientApply === undefined && discountRangeApply ||
                            discountRangeApply && discountClientApply
                        ) {
                            // console.log("status false")
                            purchasedOrdersProduct.recorded_price = discountClientApplyDiscountPercentage;
                            purchasedOrdersProduct.was_price_edited_manually = false;
                        } else {
                            // console.log("status null")
                            purchasedOrdersProduct.recorded_price = product?.sale_price;
                            purchasedOrdersProduct.was_price_edited_manually = null;
                        }
                    }
                }
                break;
            }
            case ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE: {
                const purchasedOrdersProducts: WritableDraft<IPartialPurchasedOrderProduct>[] =
                    draft.updated.purchase_order_products ?? [];

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
                            draft.updated.client?.pruduct_discounts_client ?? [];

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

                        // console.log(discountClientApplyDiscountPercentage);

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
            case ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL: {
                const purchasedOrdersProducts = draft.updated.purchase_order_products;

                // if (purchasedOrdersProducts && isDraft(purchasedOrdersProducts)) {
                //     console.log("purchasedOrdersProducts (draft):", current(purchasedOrdersProducts));
                // } else {
                //     console.log("purchasedOrdersProducts (normal):", purchasedOrdersProducts);
                // }

                const purchasedOrdersProduct = purchasedOrdersProducts?.find(
                    item => item.product_id === action.payload.id
                );

                const product = purchasedOrdersProduct?.product;

                if (purchasedOrdersProduct && isDraft(purchasedOrdersProduct)) {
                    console.log("purchasedOrdersProduct (draft):", current(purchasedOrdersProduct));
                } else {
                    console.log("purchasedOrdersProduct (normal):", purchasedOrdersProduct);
                }

                const qty = purchasedOrdersProduct?.qty;


                console.log("qty:", typeof Number(qty), Number(qty));
                

                if (
                    purchasedOrdersProduct &&
                    typeof Number(qty) === "number" &&
                    Number(qty) > 0
                ) {
                    // purchasedOrdersProduct.was_price_edited_manually =
                    //     action.payload.was_price_edited_manually;
                    console.log("entro");
                    if (purchasedOrdersProduct.was_price_edited_manually === true) {
                        console.log("entro");
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
                    }else{
                        purchasedOrdersProduct.recorded_price =
                            purchasedOrdersProduct.original_price;
                        purchasedOrdersProduct.was_price_edited_manually = null;
                    }
                }
                break;
            }

            case ModalEditActionsTypes.SET_STEP:
                draft.current_step = action.payload;
                break;
            case ModalEditActionsTypes.BACK_STEP:
                const prev_step = draft.current_step - 1;
                draft.current_step = prev_step;
                break;
            case ModalEditActionsTypes.NEXT_STEP:
                const next_step = draft.current_step + 1;
                draft.current_step = next_step;
                break;
            case ModalEditActionsTypes.CLEAR:
                return initialState;
            case ModalEditActionsTypes.RESET_UPDATE_DATA:
                draft.updated = {};
                break;
            case ModalEditActionsTypes.SET_UPDATE_DATA:
                draft.updated = action.payload;
                break;
            case ModalEditActionsTypes.UPDATE_PURCHASE_ORDER:
                Object.assign(draft.data, action.payload);
                break;
            case ModalEditActionsTypes.UPDATE_UPDATE_DATA:
                if (draft.updated) {
                    Object.assign(draft.updated, action.payload);
                } else {
                    draft.updated = { ...action.payload };
                }
                break;
            case ModalEditActionsTypes.UPDATE_SYNC_DATA:
                draft.data = { ...draft.updated };
                draft.updated = {};
                break;
        }
    }
);

export {
    modalEditReducer,
    initialState
}