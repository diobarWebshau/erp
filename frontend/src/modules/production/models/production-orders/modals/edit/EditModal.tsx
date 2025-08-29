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
import useInternalOrders
    from "../../hooks/internal-orders/useInternalOrders";
import usePurchasedOrderProducts
    from "../../hooks/purchased-orders-products/usePurchasedOrdersProducts";
import InputSelect
    from "../../../../../../components/ui/general/input-select/InputSelect";
import {
    VisualCard
} from "../../../../../../components/ui/general/card/VisualCard";


interface IEditModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onEdit: (value: IPartialProductionOrder) => void,
    po: IPartialProductionOrder
}

type IOrder = IInternalProductProductionOrder | IPurchasedOrderProduct;

const EditModal = (
    {
        onClose,
        onEdit,
        po
    }: IEditModalProps
) => {

    const distpatch: AppDispatchRedux =
        useDispatch();
    const validation =
        useSelector((state: RootState) => state.error);
    const [orderType, setOrderType] =
        useState<string | undefined>(po.order_type);
    const [qty, setQty] =
        useState<number | undefined>(po.qty);
    const [purchasedOrderProduct, setPurchasedOrderProduct] =
        useState<IPurchasedOrderProduct | undefined>(undefined);
    const [orders, setOrders] =
        useState<IOrder | undefined>();


    const {
        internalOrders
    } = useInternalOrders();

    const {
        purchasedOrderProducts,
        refetchPurchasedOrderProducts
    } = usePurchasedOrderProducts(orders?.id);


    useEffect(() => {
        distpatch(clearCart())
    }, [])

    useEffect(() => {
        if (orders != undefined) {
            refetchPurchasedOrderProducts()
        }
        setPurchasedOrderProduct(undefined)
    }, [])


    useEffect(() => {
        if (orderType === 'internal') {
            const value = internalOrders.find((p) => p.id === po.id);
            setOrders(value);
        }
    }, [internalOrders, po.order_id])


    useEffect(() => {
        if (orderType === 'client') {
            const value = purchasedOrderProducts.find((p) => p.id === po.id);
            setOrders(value);
        }
    }, [purchasedOrderProducts, po.order_id])

    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let productionOrder: IPartialProductionOrder;
        console.log(qty)
        if (orderType && orderType === "client") {
            if (orders && purchasedOrderProduct && (qty && qty > 0)) {
                productionOrder = {
                    ...po,
                    qty

                }
                onEdit(productionOrder);
            }
        } else if (orderType && orderType === "internal") {
            if (orders && internalOrders && (qty && qty > 0)) {
                productionOrder = {
                    ...po,
                    qty
                }
                onEdit(productionOrder);
            }
        }
    }

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
                            disabled
                            placeholder="Select type"
                        />
                    </div>
                    {orders && (
                        orderType === "internal" ? (
                            <VisualCard<IInternalProductProductionOrder>
                                item={orders as IInternalProductProductionOrder}
                                renderFields={(item) => (
                                    <>
                                        <div><strong>Location: </strong>{item.location_name}</div>
                                        <div><strong>Product : </strong>{item.product_name}</div>
                                    </>
                                )}
                            />
                        ) : (
                            <VisualCard<IPurchasedOrderProduct>
                                item={orders as IPurchasedOrderProduct}
                                renderFields={(item) => (
                                    <>
                                        <div><strong>Product: </strong>{item.product_name}</div>
                                    </>
                                )}
                            />
                        )
                    )}
                    <InputNumber
                        label="Qty"
                        numberType="integer"
                        onChange={setQty}
                        required
                        value={qty}
                        min={0}
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

export default EditModal;