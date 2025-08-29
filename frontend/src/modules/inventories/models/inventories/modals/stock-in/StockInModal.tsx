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
} from "../../../../../../store/store";
import {
    useDispatch, useSelector
} from "react-redux";
import {
    clearAllErrors
} from "../../../../../../store/slicer/errorSlicer"
import type {
    IPartialInventoryMovement
} from "../../../../../../interfaces/inventoyMovements";
import type {
    IInventoryDetails
} from "../../../../../../interfaces/inventories";
import InputText
    from "../../../../../../components/ui/general/input-text/InputText";
import InputNumber
    from "../../../../../../components/ui/general/input-number/InputNamber";



interface IStockInModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onStockIn: (value: IPartialInventoryMovement) => void,
    record: IInventoryDetails
}

const StockInModal = (
    {
        onClose,
        onStockIn,
        record
    }: IStockInModalProps
) => {

    const distpatch: AppDispatchRedux = useDispatch();
    const validation =
        useSelector((state: RootState) => state.error);
    const [description, setDescription] =
        useState<string | undefined>(undefined);
    const [quantity, setQuantity] =
        useState<number | undefined>(undefined);

    const handleStockIn = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            quantity && quantity > 0
        ) {

            const inventoyMovement: IPartialInventoryMovement = {
                location_id: record.location_id,
                item_id: record.item_id,
                item_name: record.item_name,
                item_type: record.item_type,
                location_name: record.location_name,
                movement_type: "in",
                qty: quantity,
                description: description || null,
            }

            onStockIn(inventoyMovement);
        }
    };


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
                    onSubmit={handleStockIn}
                >
                    <h2> Register Inventory Entry </h2>
                    <InputText
                        label="Location: "
                        value={record.location_name}
                        disabled
                    />
                    <InputText
                        label="Item type: "
                        value={record.item_type}
                        disabled
                    />
                    <InputText
                        label="Product: "
                        value={record.item_name}
                        disabled
                    />
                    <div>
                        <InputText
                            label="Description"
                            value={description || ""}
                            onChange={setDescription}
                            placeholder="Enter description"
                        />
                    </div>
                    <div>
                        <InputNumber
                            label="Quantity"
                            value={quantity || 0}
                            min={0}
                            onChange={setQuantity}
                            placeholder="Enter quantity"
                            required
                        />
                        {
                            quantity === 0 &&
                            <small
                                style={{ color: "red" }}
                            >Quantity is required
                            </small>
                        }
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

export default StockInModal;