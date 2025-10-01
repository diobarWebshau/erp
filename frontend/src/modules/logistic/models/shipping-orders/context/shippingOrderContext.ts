import { createContext } from "react";
import type { ShippingOrderState, ShippingOrderAction } from "./shippingOrderTypes";
import type { Dispatch } from "react";

// Contexto para el estado de shipping order
const ShippingOrderStateContext =
    createContext<ShippingOrderState | undefined>(undefined);
// Contexto para el dispatch de shipping order
const ShippingOrderDispatchContext =
    createContext<Dispatch<ShippingOrderAction> | undefined>(undefined);

export {
    ShippingOrderStateContext,
    ShippingOrderDispatchContext
}
