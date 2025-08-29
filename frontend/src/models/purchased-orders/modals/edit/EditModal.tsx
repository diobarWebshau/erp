import type {
    MouseEvent,
    SetStateAction,
    Dispatch,
} from "react";
import {
    useEffect,
    useState
} from 'react';
import {
    type IPartialPurchasedOrder
} from "../../../../interfaces/purchasedOrder";
import {
    X
} from "lucide-react"
import type {
    RootState
} from "../../../../store/store";
import {
    useDispatch, useSelector
} from "react-redux";
import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    clearCart
} from "./../../../../store/slicer/cartSlicer"
import type {
    IClient
} from "../../../../interfaces/clients"
import type {
    IClientAddress
} from "../../../../interfaces/clientAddress"
import useClients
    from "../../hooks/clients/useClients";
import useClientAddresses
    from "../../hooks/client-addresses/useClientAddresses";
import InputText
    from "../../../../components/ui/general/input-text/InputText";
import InputDate
    from "../../../../components/ui/general/input-date/InputDate";
import { SelectableCardListMultiQuerie }
    from "../../../../components/ui/general/selectable-card-list-multi-querie/SelectableCardList";
import { SelectableCardList }
    from "../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import InputNumber
    from "../../../../components/ui/general/input-number/InputNamber";
import type {
    IPartialPurchasedOrderProduct,
    IPurchasedOrderProduct
} from "../../../../interfaces/purchasedOrdersProducts";
import {
    ListItem
} from "../../../../components/ui/general/listItem/ListItem";
import type {
    IProduct
} from "../../../../interfaces/product";
import useProducts
    from "../../hooks/products/useProducts";
import {
    SelectableCardListWithImage
} from "../../../../components/ui/general/selectable-card-list-t-image/SelectableCardList";
import {
    clearAllErrors
} from "./../../../../store/slicer/errorSlicer"

interface IEditModalProps {
    onClose: Dispatch<SetStateAction<boolean>>,
    onEdit: (
        purchaseOrder: IPartialPurchasedOrder,
        pops: IPartialPurchasedOrderProduct[]
    ) => void,
    pop: IPartialPurchasedOrder,
    pops: IPurchasedOrderProduct[]
}

const EditModal = (
    {
        onClose,
        onEdit,
        pop,
        pops
    }: IEditModalProps
) => {

    let formattedDate = '';
    if (pop.delivery_date)
        formattedDate = pop.delivery_date.split('T')[0];
    
    const [popsOrder, setPopsOrder] =
        useState<IPartialPurchasedOrderProduct[]>(pops);
    const [orderCode, setOrderCode] =
        useState<string | undefined>(pop.order_code);
    const [deliveryDate, setDeliveryDate] =
        useState<string | undefined>(formattedDate);
    const [totalPrice, setTotalPrice] =
        useState<string | undefined>(pop.total_price?.toString());
    const [purchasedOrdersProducts, setPurchasedOrdersProducts] =
        useState<IPartialPurchasedOrderProduct[] | undefined>(
            pop.purchase_order_products ?? undefined
        );
    const [client, setClient] =
        useState<IClient | undefined>(undefined);
    const [address, setAddress] =
        useState<IClientAddress | undefined>(undefined);

    const validation =
        useSelector((state: RootState) => state.error);
    const distpatch: AppDispatchRedux =
        useDispatch();

    const {
        refetchClients,
        clients,
    } = useClients();
    const {
        refetchAddresses,
        addresses,
    } = useClientAddresses(client?.id);


    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (
            orderCode !== undefined &&
            orderCode !== "" &&
            deliveryDate !== undefined &&
            deliveryDate !== "" &&
            totalPrice !== undefined &&
            Number(totalPrice) > 0
        ) {
            const purchaseOrder = {
                ...pop,
                order_code: orderCode,
                delivery_date: new Date(deliveryDate).toISOString(),
                client_id: client?.id,
                client_address_id: address?.id,
                total_price: Number(totalPrice),
            }
            distpatch(clearAllErrors());
            onEdit(purchaseOrder, popsOrder)
        }
    }

    const handleAddProduct = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsVisibleAddSelectorProduct(true);
    }

    // products
    const [isVisibleAddSelectorProduct, setIsVisibleAddSelectorProduct] =
        useState<boolean>(false);
    const [product, setProduct] =
        useState<IProduct | undefined>(undefined);
    const {
        products,
    } = useProducts();
    const [qty, setQty] =
        useState<number | undefined>(undefined);

    const handleClickAddProduct = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (product && qty !== undefined) {
            if (popsOrder.find((p) => p.product_id === product.id)) {
                const prod_aux = popsOrder.find((p) => p.product_id === product.id);
                setPopsOrder((prev) => [
                    ...prev.filter((p) => p.product_id !== product.id),
                    {
                        id: undefined,
                        product_id: product.id,
                        product_name: product.name,
                        qty: qty + (Number(prod_aux?.qty) ?? 0),
                        recorded_price: prod_aux?.recorded_price,
                        purchase_order_id: pop.id
                    }
                ]);
            } else {
                setPopsOrder((prev) => [...prev, {
                    id: undefined,
                    product_id: product.id,
                    product_name: product.name,
                    qty: qty,
                    recorded_price: product.sale_price,
                    purchase_order_id: pop.id
                }])
            }
        }
        setIsVisibleAddSelectorProduct(false);
        setQty(1);
    }

    useEffect(() => {
        distpatch(clearCart())
    }, [])

    useEffect(() => {
        if (clients.length > 0) {
            const foundClient = clients.find((c) => c.id === pop.client_id);
            setClient(foundClient);
        }
    }, [clients, pop.client_id]);

    useEffect(() => {
        if (addresses.length > 0) {
            const foundAddress = addresses.find((a) => a.id === pop.client_address_id);
            setAddress(foundAddress);
        }
    }, [addresses, pop.client_address_id]);

    useEffect(() => {
        const total = popsOrder.reduce((acc, product) => {
            return acc + (product.recorded_price ?? 0) * (product.qty ?? 0);
        }, 0);
        setTotalPrice(total.toString());
    }, [popsOrder]);


    useEffect(() => {
        setAddress(undefined);
    }, [client])

    return (
        <>
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
                    <form
                        style={
                            {
                                position: "relative"
                            }
                        }
                    >
                        <h2> Edit purchased order</h2>
                        <div>
                            <div>
                                <InputText
                                    placeholder={`Order code`}
                                    label={`Order code`}
                                    type={"text"}
                                    value={orderCode || ""}
                                    onChange={(value) => setOrderCode(value)}
                                    required
                                    disabled
                                />
                                {orderCode === "" && (
                                    <small
                                        style={{
                                            color: "red"
                                        }}
                                    >
                                        Order code is required
                                    </small>
                                )}
                            </div>
                            <div>
                                <InputDate
                                    min={new Date().toISOString().split('T')[0]}
                                    label="Delivery date"
                                    required
                                    onChange={(value) => setDeliveryDate(value)}
                                    value={deliveryDate}
                                    name="deliveryDate"
                                />
                            </div>
                        </div>
                        <SelectableCardListMultiQuerie
                            items={clients}
                            renderField={(key, value) => {
                                if (key === "isActive") return value ? "✅ Activo" : "❌ Inactivo";
                                if (key === "createdAt") return new Date(value).toLocaleDateString();
                                return String(value);
                            }}
                            onChange={(client) => {
                                if (client) {
                                    setClient(client)
                                }
                            }}
                            defaultSelectedId={client?.id}
                            label="Select client"
                            emptyMessage="No hay clientes disponibles"
                            name="clients"
                        />
                        {
                            (addresses && addresses.length > 0) && (
                                <div>
                                    <SelectableCardList
                                        name="addresses"
                                        items={addresses}
                                        getId={(address) => address.id}
                                        renderFields={(value) => (
                                            <>
                                                <div><strong>id:</strong> {value.id}</div>
                                                <div><strong>address:</strong> {value.address}</div>
                                                <div><strong>city:</strong> {value.city}</div>
                                                <div><strong>state:</strong> {value.state}</div>
                                                <div><strong>country:</strong> {value.country}</div>
                                            </>
                                        )}
                                        selectedItem={address}
                                        onChange={setAddress}
                                        label={`Select address`}
                                        emptyMessage="No hay direcciones para este cliente"
                                    />
                                </div>
                            )
                        }
                        <button
                            onClick={handleAddProduct}
                        >
                            Add product
                        </button>
                        {
                            isVisibleAddSelectorProduct &&
                            products.filter((p) => !popsOrder.find((po) => po.product_id === p.id)).length > 0 && (
                                <div>
                                    <SelectableCardListWithImage
                                        name="products"
                                        items={products.filter((p) => !popsOrder.find((po) => po.product_id === p.id))}
                                        label="Select product"
                                        emptyMessage="No products found"
                                        selectedItem={product}
                                        getImage={(p) => p.photo.toString()}
                                        getId={(p) => p.id}
                                        onChange={setProduct}
                                        renderFields={(item) => (
                                            <>
                                                <strong>{item.name}</strong>
                                                <p>{item.description}</p>
                                            </>
                                        )}
                                    />
                                    <InputNumber
                                        label="qty"
                                        numberType="integer"
                                        onChange={setQty}
                                        required
                                        value={qty}
                                        min={1}
                                    />
                                    <div>
                                        <button
                                            onClick={() => setIsVisibleAddSelectorProduct(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleClickAddProduct}
                                        >
                                            Add Product
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                border: "5px solid white"
                            }}
                        >
                            <h2>Cart</h2>
                            {
                                <ListItem
                                    items={popsOrder}
                                    emptyMessage={"Carrito vacio"}
                                    onDelete={(item) => setPopsOrder((prev) => prev.filter((p) => p.product_id !== item.product_id))}
                                    getId={(item) => item.id ?? `${item.product_id}-${item.qty}`}
                                    renderFields={(item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-evenly",
                                                color: "black"
                                            }}
                                        >
                                            <small>{item.product_name}</small>
                                            <small>{item.recorded_price}</small>
                                            <small>{item.qty}</small>
                                            <small>{Number(item.qty) * Number(item.recorded_price)}</small>
                                            <small>{item.status}</small>
                                        </div>
                                    )}
                                />
                            }
                        </div>
                        <div>
                            <InputNumber
                                min={0}
                                label="Total price"
                                required
                                disabled
                                value={Number(totalPrice) || 0}
                            />
                        </div>
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
        </>
    );
}

export default EditModal;


