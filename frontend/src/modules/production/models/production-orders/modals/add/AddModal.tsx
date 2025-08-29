import type {
    MouseEvent,
    SetStateAction,
    Dispatch,
} from "react";
import {
    useState,
    useEffect
} from 'react';
import {
    X
} from "lucide-react"
import type {
    AppDispatchRedux,
    RootState
} from "../../../../../../store/store";
import {
    useDispatch, useSelector
} from "react-redux";
import {
    SelectableCardList
} from "../../../../../../components/ui/general/selectable-card-list-t/SelectableCardList"
import InputNumber
    from "../../../../../../components/ui/general/input-number/InputNamber";
import {
    clearCart
} from "../../../../../../store/slicer/cartSlicer";
import type {
    IPartialProductionOrder
} from "../../../../../../interfaces/productionOrder";
import type {
    IPurchasedOrderProduct
} from "../../../../../../interfaces/purchasedOrdersProducts";
import type {
    IInternalProductProductionOrder
} from "../../../../../../interfaces/internalOrder";
import type {
    IPurchasedOrder
} from "../../../../../../interfaces/purchasedOrder";
import useInternalOrders
    from "../../hooks/internal-orders/useInternalOrders";
import usePurchasedOrderProducts
    from "../../hooks/purchased-orders-products/usePurchasedOrdersProducts";
import InputSelect
    from "../../../../../../components/ui/general/input-select/InputSelect";
import usePurchasedOrders
    from "../../hooks/purchased-orders/usePurchasedOrders";


interface IAddModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onCreate: (value: IPartialProductionOrder) => void,
}

type IOrder = IInternalProductProductionOrder | IPurchasedOrder;

const AddModal = (
    {
        onClose,
        onCreate,
    }: IAddModalProps
) => {

    const distpatch: AppDispatchRedux =
        useDispatch();
    const validation =
        useSelector((state: RootState) => state.error);
    const [orderType, setOrderType] =
        useState<string | undefined>(undefined);
    const [qty, setQty] =
        useState<number | undefined>(undefined);
    const [purchasedOrderProduct, setPurchasedOrderProduct] =
        useState<IPurchasedOrderProduct | undefined>(undefined);
    const [orders, setOrders] =
        useState<IOrder | undefined>(undefined);

    const {
        internalOrders
    } = useInternalOrders();

    const {
        purchasedOrderProducts,
        refetchPurchasedOrderProducts
    } = usePurchasedOrderProducts(orders?.id);

    const {
        purchasedOrders
    } = usePurchasedOrders();


    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let productionOrder: IPartialProductionOrder;
        if (orderType && orderType === "client") {
            if (orders && purchasedOrderProduct && (qty && qty > 0)) {
                productionOrder = {
                    order_type: orderType,
                    order_id: purchasedOrderProduct.id,
                    product_id: purchasedOrderProduct.product_id,
                    product_name: purchasedOrderProduct.product_name,
                    qty: qty
                }
                onCreate(productionOrder);
            }
        } else if (orderType && orderType === "internal") {
            const internalOrder = orders as IInternalProductProductionOrder;
            if (orders && internalOrders && (qty && qty > 0)) {
                productionOrder = {
                    order_type: orderType,
                    order_id: internalOrder.id,
                    product_id: internalOrder.product_id,
                    product_name: internalOrder.product_name,
                    qty: qty
                }
                onCreate(productionOrder);
            }
        }
    }

    useEffect(() => {
        distpatch(clearCart())
    }, [])

    useEffect(() => {
        setOrders(undefined)
    }, [orderType])

    useEffect(() => {
        if (orders != undefined) {
            refetchPurchasedOrderProducts()
        }
        setPurchasedOrderProduct(undefined)
    }, [orders])

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                zIndex: 10,
                padding: "1rem",
                overflowY: "auto",
                width: "60%",
                height: "70%",
                backgroundColor: "black",
            }}
        >
            <div>
                <div
                    style={{
                        position: "absolute",
                        top: 5,
                        right: 5
                    }}
                    onClick={() => onClose(false)}
                >
                    <X size={20} />
                </div>
                <form>
                    <h2> New order production</h2>
                    <div>
                        <InputSelect
                            options={["internal", "client"]}
                            label="Order type: "
                            value={orderType}
                            onChange={setOrderType}
                            placeholder="Select type"
                        />
                    </div>
                    {orderType && (
                        <div>
                            <SelectableCardList
                                name="orders"
                                items={
                                    orderType === "internal"
                                        ? internalOrders
                                        : purchasedOrders
                                }
                                getId={(item) => item.id}
                                renderFields={(value) => {
                                    let valueFormmatted:
                                        IInternalProductProductionOrder | IPurchasedOrder;
                                    if ("client_id" in value) {
                                        valueFormmatted = value as IPurchasedOrder
                                        return (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column"
                                                }}
                                            >
                                                <strong>{`Id:  ${value.id}`}</strong>
                                                <strong>{`Order code: ${value.order_code}`}</strong>
                                                <strong>{`Company:  ${value.company_name}`}</strong>
                                                <strong>{`Delivery date:   ${new Date(value.delivery_date).toLocaleDateString()}`}</strong>
                                                <strong>{`Total price:  ${value.total_price}`}</strong>
                                            </div>
                                        );
                                    } else {
                                        valueFormmatted = value as IInternalProductProductionOrder
                                        return (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column"
                                                }}
                                            >
                                                <strong>{`Id: ${value.id}`}</strong>
                                                <strong>{`Location: ${value.location_name}`}</strong>
                                                <strong>{`Product: ${value.product_name}`}</strong>
                                                <strong>{`Qty: ${value.qty}`}</strong>
                                            </div>
                                        );
                                    }
                                }
                                }
                                selectedItem={orders}
                                onChange={setOrders}
                                label={
                                    `Select ${orderType === "client"
                                        ? " purchased order"
                                        : "internal order"
                                    }`
                                }
                                emptyMessage="No orders found"
                            />
                        </div>
                    )}
                    {
                        (orderType === "client" && orders) && (
                            <div>
                                <SelectableCardList
                                    name="pop"
                                    items={purchasedOrderProducts}
                                    getId={(item) => item.id}
                                    renderFields={(value) =>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                        >
                                            <strong>{`Id:  ${value.id}`}</strong>
                                            <strong>{`Product:  ${value.product_name}`}</strong>
                                            <strong>{`Qty:  ${value.qty}`}</strong>
                                        </div>
                                    }
                                    selectedItem={purchasedOrderProduct}
                                    onChange={setPurchasedOrderProduct}
                                    label="Select product  of order"
                                    emptyMessage="No product orders found"
                                />
                            </div>
                        )
                    }
                    <InputNumber
                        label="qty"
                        numberType="integer"
                        onChange={setQty}
                        required
                        value={qty}
                        min={1}
                    />
                    {
                        Object.keys(validation).length > 0 &&
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "red"
                            }}
                        >
                            {
                                Object.keys(validation).map((key) => {
                                    const errorValue = validation[key];
                                    if (!errorValue) return null;
                                    if (Array.isArray(errorValue)) {
                                        return errorValue.map((msg, index) => (
                                            <small key={`${key}-${index}`}>{msg}</small>
                                        ));
                                    }
                                    return <small key={key}>{errorValue}</small>;
                                })
                            }
                        </div>
                    }
                    <div>
                        <button
                            onClick={() => onClose(false)}
                        >Cancel</button>
                        <button
                            onClick={handleOnClickAdd}
                        >Accept</button>
                    </div>
                </form>
            </div>
        </div >
    );
}

export default AddModal;