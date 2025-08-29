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
    IProductionOrder
} from "../../../../../../interfaces/productionOrder";
import type { IPartialProduction } from "../../../../../../interfaces/production";


interface ICheckModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onCreate: (value: IPartialProduction) => void,
    value: IProductionOrder
}
const CheckModal = (
    {
        onClose,
        onCreate,
        value

    }: ICheckModalProps
) => {

    const distpatch: AppDispatchRedux =
        useDispatch();
    const validation =
        useSelector(
            (state: RootState) => state.error
        );
    const [qty, setQty] =
        useState<number | undefined>(undefined);
    const [scrap, setScrap] =
        useState<number | undefined>(undefined);

    useEffect(() => {
        distpatch(clearCart())
    }, [])

    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (qty && qty > 0) {
            const production: IPartialProduction = {
                production_order_id: value.id,
                product_id: value.product_id,
                qty: qty,
                scrap: scrap || 0
            }
            onCreate(production);
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
                    <h2> New production</h2>
                    <InputNumber
                        label="Qty: "
                        numberType="integer"
                        onChange={setQty}
                        required
                        value={qty}
                        min={1}
                    />
                    <InputNumber
                        label="Scrap: "
                        numberType="decimal"
                        onChange={setScrap}
                        required
                        value={scrap}
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

export default CheckModal;