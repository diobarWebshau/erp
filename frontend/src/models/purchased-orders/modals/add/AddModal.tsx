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
    type IClient,
} from "../../../../interfaces/clients";
import { X } from "lucide-react"
import type {
    RootState
} from "../../../../store/store";
import {
    useDispatch, useSelector
} from "react-redux";
import InputNumber
    from "../../../../components/ui/general/input-number/InputNamber";
import InputDate
    from "../../../../components/ui/general/input-date/InputDate";
import useClients
    from "../../hooks/clients/useClients";
import useClientAddresses
    from "../../hooks/client-addresses/useClientAddresses";
import {
    SelectableCardListMultiQuerie
} from "../../../../components/ui/general/selectable-card-list-multi-querie/SelectableCardList";
import {
    SelectableCardList
} from "../../../../components/ui/general/selectable-card-list-t/SelectableCardList"
import {
    SelectableCardListWithImage
} from "../../../../components/ui/general/selectable-card-list-t-image/SelectableCardList"
import useProducts
    from "../../hooks/products/useProducts";
import type {
    IProduct
} from "../../../../interfaces/product";

import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    addProduct,
    removeProduct,
    clearCart
} from "./../../../../store/slicer/cartSlicer"
import {
    clearAllErrors
} from "./../../../../store/slicer/errorSlicer"
import {
    ListItem
} from "../../../../components/ui/general/listItem/ListItem";
import type {
    IPartialPurchasedOrder
} from "../../../../interfaces/purchasedOrder";
import type {
    IClientAddress
} from "../../../../interfaces/clientAddress";


interface IAddModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onCreate: (value: IPartialPurchasedOrder) => void,
}

const AddModal = (
    {
        onClose,
        onCreate,
    }: IAddModalProps
) => {
    const validation =
        useSelector((state: RootState) => state.error);
    const distpatch: AppDispatchRedux =
        useDispatch();
    const cart =
        useSelector((state: RootState) => state.cart);

    // PO
    const [deliveryDate, setDeliveryDate] =
        useState<string | undefined>(undefined);
    const [totalPrice, setTotalPrice] =
        useState<string | undefined>(undefined);

    // clients
    const [client, setClient] =
        useState<IClient | undefined>(undefined);
    const [address, setAddress] =
        useState<IClientAddress | undefined>(undefined);
    const {
        clients,
    } = useClients();
    const {
        addresses,
    } = useClientAddresses(client?.id);

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
            distpatch(addProduct({ ...product as IProduct, qty }));
        }
        setIsVisibleAddSelectorProduct(false);
        setQty(1);
    }

    // FUNCIONES
    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (
            deliveryDate !== undefined &&
            deliveryDate !== "" &&
            totalPrice !== undefined &&
            Number(totalPrice) > 0
        ) {
            const purchaseOrder: IPartialPurchasedOrder = {
                delivery_date: deliveryDate,
                client_id: client?.id,
                client_address_id: address?.id,
                total_price: Number(totalPrice),
                purchase_order_products: cart.products.map((p) => {
                    return {
                        product_id: p.id,
                        product_name: p.name,
                        recorded_price: p.sale_price,
                        qty: p.qty
                    }
                }),
            }
            distpatch(clearAllErrors());
            onCreate(purchaseOrder)
        }
    }
    const handleAddProduct = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsVisibleAddSelectorProduct(!isVisibleAddSelectorProduct);
    }

    useEffect(() => {
        const total = cart.products.reduce((acc, product) => {
            return acc + product.sale_price * product.qty;
        }, 0);
        setTotalPrice(total.toString());
    }, [cart.products]);

    useEffect(() => {
        distpatch(clearCart())
    }, [])


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
                    <form>
                        <h2> New purchased order</h2>
                        <div>
                            <div>
                                <InputDate
                                    min={new Date().toISOString().split('T')[0]}
                                    label="Delivery date"
                                    required
                                    onChange={(value) => setDeliveryDate(value)}
                                    value=""
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
                                    setAddress(undefined);
                                }
                            }}
                            label="Select client"
                            emptyMessage="No hay clientes disponibles"
                            name="clients"
                        />
                        {/* {
                            (addresses && addresses.length > 0) && ( */}
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
                        {/* ) */}
                        {/* } */}
                        <button
                            onClick={handleAddProduct}
                        >
                            Add product
                        </button>
                        {
                            isVisibleAddSelectorProduct && (
                                <div>
                                    <SelectableCardListWithImage
                                        name="products"
                                        items={products}
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
                                    items={cart.products}
                                    emptyMessage={"Carrito vacio"}
                                    onDelete={(item) => {
                                        distpatch(removeProduct(item.id))
                                    }
                                    }
                                    getId={(item) => item.id}
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
                                            <small>{item.name}</small>
                                            <small>{item.description}</small>
                                            <small>{item.sale_price}</small>
                                            <small>{item.qty}</small>
                                            <small>{Number(item.qty) * Number(item.sale_price)}</small>
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

export default AddModal;


