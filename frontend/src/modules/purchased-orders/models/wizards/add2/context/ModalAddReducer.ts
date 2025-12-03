import {
    type Draft, type WritableDraft
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
} from "../../../../../../interfaces/purchasedOrder"
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../interfaces/purchasedOrdersProducts";
import type {
    IPartialProductDiscountClient
} from "../../../../../../interfaces/product-discounts-clients";


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
                const new_products = action.payload as IPartialPurchasedOrderProduct[];

                if (!products || new_products.length === 0) break;

                const client_discounts = draft.data.client?.product_discounts_client ?? [];

                const productsToAdd = new_products.map((p) => {
                    const product = p.product;

                    // -----------------------------
                    // 0. Cantidad por defecto = 1
                    // -----------------------------
                    // Si la cantidad viene undefined, null, 0 o inválida → set qty = 1
                    const qtyInitial =
                        typeof p.qty === "number" && p.qty > 0
                            ? p.qty
                            : 1;

                    p.qty = qtyInitial;

                    // -----------------------------
                    // 1. Normalizaciones seguras
                    // -----------------------------
                    const salePrice = Number(product?.sale_price ?? 0);
                    const originalPrice = Number(p.original_price ?? salePrice);

                    // -----------------------------
                    // 2. Rango de descuento por qty (usamos qty inicial)
                    // -----------------------------
                    const discountRanges = product?.product_discount_ranges ?? [];

                    const discountRangeApply = discountRanges.find((range) => {
                        const min = Number(range.min_qty);
                        const max = Number(range.max_qty);
                        const qty = qtyInitial;

                        return (
                            !isNaN(min) &&
                            !isNaN(max) &&
                            qty >= min &&
                            qty <= max
                        );
                    });

                    // -----------------------------
                    // 3. Descuento por cliente
                    // -----------------------------
                    const discountClientApply = client_discounts.find(
                        (d) => d.product_id === p.product_id
                    );

                    // -----------------------------
                    // 4. PRECIO BASE
                    // -----------------------------
                    const basePrice = discountRangeApply
                        ? Number(discountRangeApply.unit_price ?? originalPrice)
                        : originalPrice;

                    // Si por alguna razón sale NaN (no debería): fallback
                    const safeBasePrice = isNaN(basePrice) ? salePrice : basePrice;

                    // -----------------------------
                    // 5. Aplicar descuento por cliente SI aplica
                    // -----------------------------
                    const finalPriceWithClientDiscount = discountClientApply
                        ? safeBasePrice * (1 - (discountClientApply.discount_percentage ?? 0) / 100)
                        : safeBasePrice;

                    // -----------------------------
                    // 6. Reglas finales para recorded_price
                    // -----------------------------
                    if (discountRangeApply || discountClientApply) {
                        p.recorded_price = Number(finalPriceWithClientDiscount.toFixed(2));
                        p.was_price_edited_manually = false;
                    } else {
                        p.recorded_price = Number(salePrice.toFixed(2));
                        p.was_price_edited_manually = null;
                    }

                    // -----------------------------
                    // 7. Fallback ABSOLUTO
                    // -----------------------------
                    if (
                        typeof p.recorded_price !== "number" ||
                        isNaN(p.recorded_price) ||
                        p.recorded_price <= 0
                    ) {
                        // Si algo salió mal, nunca dejamos que sea 0
                        p.recorded_price = Number(salePrice.toFixed(2));
                        p.was_price_edited_manually = null;
                    }

                    return p;
                });

                products.push(...productsToAdd);
                break;
            }
            case ModalAddActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS: {
                const products = draft.data.purchase_order_products;
                if (products) {
                    const index = products.findIndex(
                        item => item.product_id === action.payload.product_id
                    );

                    if (index !== -1) {
                        products.splice(index, 1);
                    }
                }
                break;
            }
            case ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY: {
                const products = draft.data.purchase_order_products ?? [];
                const client_discounts = draft.data.client?.product_discounts_client ?? [];

                const p = products.find(item => item.product_id === action.payload.id);
                if (!p) break;

                const product = p.product;
                const qty = action.payload.qty > 0 ? action.payload.qty : 1;
                p.qty = qty;

                const salePrice = Number(product?.sale_price ?? 0);
                const originalPrice = Number(p.original_price ?? salePrice);

                const discountRanges = product?.product_discount_ranges ?? [];

                const discountRangeApply = discountRanges.find(range => {
                    const min = Number(range.min_qty);
                    const max = Number(range.max_qty);
                    return qty >= min && qty <= max;
                });

                const discountClientApply = client_discounts.find(
                    d => d.product_id === p.product_id
                );

                const basePrice = discountRangeApply
                    ? Number(discountRangeApply.unit_price ?? originalPrice)
                    : originalPrice;

                const safeBasePrice = isNaN(basePrice) ? salePrice : basePrice;

                const finalPriceWithClient = discountClientApply
                    ? safeBasePrice * (1 - (discountClientApply.discount_percentage ?? 0) / 100)
                    : safeBasePrice;

                if (discountRangeApply || discountClientApply) {
                    p.recorded_price = Number(finalPriceWithClient.toFixed(2));
                    p.was_price_edited_manually = false;
                } else {
                    p.recorded_price = Number(salePrice.toFixed(2));
                    p.was_price_edited_manually = null;
                }

                if (
                    typeof p.recorded_price !== "number" ||
                    isNaN(p.recorded_price) ||
                    p.recorded_price <= 0
                ) {
                    p.recorded_price = Number(salePrice.toFixed(2));
                    p.was_price_edited_manually = null;
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

            case ModalAddActionsTypes.SET_STEP: {
                draft.current_step = action.payload;
                break;
            }
            case ModalAddActionsTypes.BACK_STEP: {
                const prev_step = draft.current_step - 1;
                draft.current_step = prev_step;
                break;
            }
            case ModalAddActionsTypes.NEXT_STEP: {

                const next_step = draft.current_step + 1;
                draft.current_step = next_step;
                break;
            }
            case ModalAddActionsTypes.CLEAR:
                return initialState;
        }
    }
);

export {
    modalAddReducer,
    initialState
}