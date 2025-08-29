import { createSlice, type PayloadAction }
    from "@reduxjs/toolkit";
import type {
    IProduct
} from "../../interfaces/product";


interface CartProduct extends IProduct {
    qty: number;
}

interface Cart {
    products: CartProduct[];
}

const initialState: Cart = {
    products: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addProduct(state, action: PayloadAction<CartProduct>) {
            const existingIndex = state.products.findIndex(
                (p) => p.id === action.payload.id
            );
            if (existingIndex >= 0) {
                state.products[existingIndex].qty += action.payload.qty;
            } else {
                state.products.push(action.payload);
            }
        },
        updateProductqty(
            state,
            action: PayloadAction<{ productId: number; qty: number }>
        ) {
            const { productId, qty } = action.payload;
            const product = state.products.find((p) => p.id === productId);
            if (product) {
                product.qty = qty;
            }
        },
        removeProduct(state, action: PayloadAction<number>) {
            state.products = state.products.filter((p) => p.id !== action.payload);
        },
        clearCart(state) {
            state.products = [];
        },
    },
});

export const {
    addProduct,
    updateProductqty,
    removeProduct,
    clearCart,
} = cartSlice.actions;

export default cartSlice;

export type { CartProduct };
