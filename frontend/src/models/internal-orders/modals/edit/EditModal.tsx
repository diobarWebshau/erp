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
} from "../../../../store/store";
import {
    useDispatch, useSelector
} from "react-redux";
import {
    SelectableCardListWithImage
} from "../../../../components/ui/general/selectable-card-list-t-image/SelectableCardList"
import {
    SelectableCardList
} from "../../../../components/ui/general/selectable-card-list-t/SelectableCardList"
import {
    clearAllErrors
} from "./../../../../store/slicer/errorSlicer"
import type {
    IPartialLocation, ILocation
} from "../../../../interfaces/locations";
import type {
    IPartialProduct, IProduct
} from "../../../../interfaces/product";
import type {
    IInternalProductProductionOrder,
    IPartialInternalProductProductionOrder
} from "../../structure/types";
import useProducts
    from "../../hooks/products/useProducts";
import useLocations
    from "../../hooks/locations/useLocations";
import InputNumber
    from "../../../../components/ui/general/input-number/InputNamber";
import {
    clearCart
} from "../../../../store/slicer/cartSlicer";


interface IEditModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onEdit: (value: IPartialInternalProductProductionOrder) => void,
    ippo: IPartialInternalProductProductionOrder
}

const EditModal = (
    {
        onClose,
        onEdit,
        ippo
    }: IEditModalProps
) => {
    
    const distpatch: AppDispatchRedux =
    useDispatch();
    const validation =
    useSelector((state: RootState) => state.error);
    const [qty, setQty] =
    useState<number | undefined>(ippo.qty);
    const [productId, setProductId] =
    useState<number | undefined>(ippo.product_id ?? undefined);
    const [locationId, setLocationId] =
    useState<number | undefined>(ippo.location_id ?? undefined);
    const [product, setProduct] =
    useState<IProduct | undefined>(undefined);
    const [location, setLocation] =
    useState<ILocation | undefined>(undefined);
    
    // FUNCIONES
    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (
            product &&
            location &&
            qty !== undefined &&
            Number(qty) > 0
        ) {
            console.log(qty);
            const internalOrder = {
                ...ippo,
                location_id: location?.id,
                product_id: product?.id,
                product_name: product?.name,
                qty: qty
            }
            console.log(internalOrder);
            distpatch(clearAllErrors());
            onEdit(internalOrder)
        }
    }
    const {
        locations,
    } = useLocations();

    const {
        products,
    } = useProducts();
    
    useEffect(() => {
        distpatch(clearCart())
    }, [])
    
    useEffect(() => {
        const found = products.find((p) => p.id === productId);
        setProduct(found);
    }, [products, productId]);
    
    useEffect(() => {
        const found = locations.find((l) => l.id === locationId);
        setLocation(found);
    }, [locations, locationId]);
    
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
                    <h2> Edit internal order</h2>

                    <div>
                        <SelectableCardList
                            name="locations"
                            items={locations.filter((value) => value.is_active)}
                            getId={(location) => location.id}
                            renderFields={(value) => (
                                <>
                                    <div><strong>Name: </strong>{value.name}</div>
                                    <div><strong>Description: </strong>{value.description}</div>
                                </>
                            )}
                            selectedItem={location}
                            onChange={setLocation}
                            label={`Select location`}
                            emptyMessage="No locations found"
                        />
                    </div>
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
    );
}

export default EditModal;