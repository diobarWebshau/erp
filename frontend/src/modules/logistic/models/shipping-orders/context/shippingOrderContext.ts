import { createContext } from "react";
import type { ShippingOrderState, ShippingOrderAction, ShippingOrderCommands } from "./shippingOrderTypes";
import type { Dispatch } from "react";

// Contexto para el estado de shipping order
const ShippingOrderStateContext =
    createContext<ShippingOrderState | undefined>(undefined);
// Contexto para el dispatch de shipping order
const ShippingOrderDispatchContext =
    createContext<Dispatch<ShippingOrderAction> | undefined>(undefined);

// Contexto para los comandos de shipping order(en el caso de que se obtenga el estado de forma asincrona).
const ShippingOrderCommandsContext =
    createContext<ShippingOrderCommands | undefined>(undefined);

export {
    ShippingOrderStateContext,
    ShippingOrderDispatchContext,
    ShippingOrderCommandsContext
}
