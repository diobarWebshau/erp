import type {
    SetStateAction,
    Dispatch,
} from "react";
import {
    useState,
    useEffect,
    type FormEvent
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
    clearAllErrors
} from "../../../../store/slicer/errorSlicer"
import type {
    IPartialInventoryTransfer
} from "../../../../interfaces/inventoryTransfer";
import useLocations
    from "../../hooks/useLocations";
import useProducts
    from "../../hooks/useProducts";
import useInputs
    from "../../hooks/useInputs";
import InputNumber
    from "../../../../components/ui/general/input-number/InputNamber";
import {
    SelectableCardList
} from "../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import type {
    ILocation
} from "../../../../interfaces/locations";
import InputSelect from "../../../../components/ui/general/input-select/InputSelect";
import type {
    IProduct
} from "../../../../interfaces/product";
import type {
    IInput
} from "../../../../interfaces/inputs";
import {
    SelectableCardListWithImage
} from "../../../../components/ui/general/selectable-card-list-t-image/SelectableCardList";
import InputText from "../../../../components/ui/general/input-text/InputText";

interface ITransferModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onTransfer: (value: IPartialInventoryTransfer) => void,
}

const TransferModal = (
    {
        onClose,
        onTransfer,
    }: ITransferModalProps
) => {

    const distpatch: AppDispatchRedux = useDispatch();
    const validation =
        useSelector((state: RootState) => state.error);


    const [itemSelected, setItemSelected] =
        useState<IProduct | IInput | undefined>(undefined);
    const [locationSourceSelected, setLocationSourceSelected] =
        useState<ILocation | undefined>(undefined);
    const [locationDestinationSelected, setLocationDestinationSelected] =
        useState<ILocation | undefined>(undefined);
    const [itemType, setItemType] =
        useState<string | undefined>(undefined);
    const [quantity, setQuantity] =
        useState<number | undefined>(undefined);
    const [reason, setReason] =
        useState<string | undefined>(undefined);



    const handleTransfer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            locationSourceSelected &&
            locationDestinationSelected &&
            itemSelected &&
            itemType &&
            quantity && quantity > 0
        ) {
            const transfer: IPartialInventoryTransfer = {
                source_location_id: locationSourceSelected.id,
                destination_location_id: locationDestinationSelected.id,
                qty: quantity,
                reason: reason ?? null,
                item_id: itemSelected.id,
                item_type: itemType as "product" | "input",
                item_name: itemSelected.name,

            };
            onTransfer(transfer);
        }
    };

    const handleItemTypeChange = (value: string) => {
        setItemType(value);
        setItemSelected(undefined);
    };

    const {
        locations,
    } = useLocations();
    const {
        products,
    } = useProducts();

    const {
        inputs,
    } = useInputs();

    useEffect(() => {
        distpatch(clearAllErrors())
    }, [])

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
                width: "30%",
                height: "40%",
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
                    onSubmit={handleTransfer}
                >
                    <h2> Inventory Transfer </h2>
                    <SelectableCardList
                        name="locationsSource"
                        items={locations.filter((t) => t.types?.some((type) => type.name === "Store"))}
                        getId={(value) => value.id}
                        renderFields={(value) => (
                            <>
                                <div key={value.id}>
                                    <div><strong>Name:</strong> {value.name}</div>
                                    <div><strong>Description:</strong> {value.description}</div>
                                    <div>
                                        <strong>Types:</strong>{" "}
                                        {value.types?.map((t, i) => (
                                            <small key={t.id}>
                                                {t.name}
                                                {i < (value.types?.length ?? 0) - 1 && ", "}
                                            </small>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        selectedItem={locationSourceSelected}
                        onChange={setLocationSourceSelected}
                        label={`Select source location`}
                        emptyMessage="No locations available to select"
                    />
                    <SelectableCardList
                        name="locationsDestination"
                        items={locations.filter((t) => t.id !== locationSourceSelected?.id && t.types?.some((type) => type.name === "Store"))}
                        getId={(value) => value.id}
                        renderFields={(value) => (
                            <>
                                <div key={value.id}>
                                    <div><strong>Name:</strong> {value.name}</div>
                                    <div><strong>Description:</strong> {value.description}</div>
                                    <div>
                                        <strong>Types:</strong>{" "}
                                        {value.types?.map((t, i) => (
                                            <small key={t.id}>
                                                {t.name}
                                                {i < (value.types?.length ?? 0) - 1 && ", "}
                                            </small>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        selectedItem={locationDestinationSelected}
                        onChange={setLocationDestinationSelected}
                        label={`Select destination location: `}
                        emptyMessage="No locations available to select"
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >

                        <InputSelect
                            options={["product", "input"]}
                            label="Item type: "
                            value={itemType}
                            onChange={handleItemTypeChange}
                            placeholder="Select item type"
                        />
                        {
                            itemType === "" &&
                            <small
                                style={{
                                    color: "red"
                                }}
                            >
                                Item type is required
                            </small>
                        }
                    </div>
                    <div>
                        {itemType && (

                            <div>
                                <SelectableCardListWithImage
                                    name="orders"
                                    items={
                                        itemType === "product"
                                            ? products
                                            : inputs
                                    }
                                    getId={(item) => item.id}
                                    renderFields={(value) => {
                                        let valueFormmatted:
                                            IProduct | IInput;
                                        if ("supplier" in value) {
                                            valueFormmatted = value as IInput
                                            return (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column"
                                                    }}
                                                >
                                                    <small><strong>{`Name:  `}</strong>{valueFormmatted.name}</small>
                                                    <small><strong>{`Supplier: `}</strong>{valueFormmatted.supplier}</small>
                                                </div>  
                                            );
                                        } else {
                                            valueFormmatted = value as IProduct
                                            return (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column"
                                                    }}
                                                >
                                                    <small><strong>{`Name: `}</strong>{valueFormmatted.name}</small>
                                                    <small><strong>{`Description: `}</strong>{valueFormmatted.description}</small>
                                                </div>
                                            );
                                        }
                                    }
                                    }
                                    selectedItem={itemSelected}
                                    onChange={setItemSelected}
                                    label={
                                        `Select ${itemType === "product"
                                            ? " product"
                                            : "input"
                                        }`
                                    }
                                    emptyMessage="No orders found"
                                    getImage={(value) => {
                                        if (value.photo instanceof File) {
                                            return URL.createObjectURL(value.photo);
                                        }
                                        return value.photo;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <InputNumber
                            id="quantity"
                            name="quantity"
                            label="Quantity: "
                            placeholder="Quantity"
                            value={quantity ?? 0}
                            onChange={(e) => setQuantity(e)}
                            required
                            min={0}
                        />
                        {
                            quantity !== undefined && quantity !== null && !(quantity > 0) &&
                            <small
                                style={{
                                    color: "red"
                                }}
                            >
                                Quantity is required
                            </small>
                        }
                    </div>
                    <InputText
                        id="reason"
                        name="reason"
                        placeholder="Reason"
                        value={reason ?? ""}
                        onChange={setReason}
                        label="Reason: "
                        required
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
                            type="button"
                            onClick={() => onClose(false)}
                        >Cancel</button>
                        <button
                            type="submit"
                        >Accept</button>
                    </div>
                </form>
            </div>
        </div >
    );
}

export default TransferModal;