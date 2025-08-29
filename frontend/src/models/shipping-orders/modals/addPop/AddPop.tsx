import {
    useState
} from "react";
import type {
    IPurchasedOrderProduct
} from "../../../../interfaces/purchasedOrdersProducts";
import {
    SelectableMultipleCardList
} from "../../../../components/ui/general/selected-card-list-T-multiple-select/SelectableMultipleCardList";
import usePurchasedOrdersProductByClientAddress
    from "../../hooks/purchased-orders/usePurchasedOrderProducts";

type IAddPopProps = {
    onClose: (value: boolean) => void;
    onAdd: (value: IPurchasedOrderProduct[]) => void;
    clientAddressId: number;
    purchasedOrderProductsSelected: IPurchasedOrderProduct[];
}

function differenceBy<T, K extends keyof T>(arr1: T[], arr2: T[], key: K): T[] {
    const set2 = new Set(arr2.map(item => item[key]));
    return arr1.filter(item => !set2.has(item[key]));
}


const AddPop = ({
    onClose,
    onAdd,
    clientAddressId,
    purchasedOrderProductsSelected
}: IAddPopProps) => {


    const [purchasedOrderProductsSelectedForAdd, setPurchasedOrderProductsSelectedForAdd] =
        useState<IPurchasedOrderProduct[]>([]);

    const {
        purchasedOrdersProducts,
    } = usePurchasedOrdersProductByClientAddress(clientAddressId);

    const difference =
        differenceBy(purchasedOrdersProducts, purchasedOrderProductsSelected, "id");
    console.log(clientAddressId);
    console.log(purchasedOrdersProducts);

    const handleAdd = () => {
        if (purchasedOrderProductsSelectedForAdd.length > 0) {
            onAdd(purchasedOrderProductsSelectedForAdd);
        }
    }

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                zIndex: 10,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                }}
            >
                <SelectableMultipleCardList
                    items={difference}
                    getId={p => p.id}
                    label="Select purchased order product"
                    name="purchased-order-product"
                    onChange={setPurchasedOrderProductsSelectedForAdd}
                    selectedItems={purchasedOrderProductsSelectedForAdd}
                    emptyMessage="No purchased order product found"
                    renderFields={(pop) => (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <small><strong>Id:</strong> {pop.id}</small>
                            <small><strong>Product:</strong> {pop.product_name}</small>
                            <small><strong>Qty:</strong> {pop.qty}</small>
                            <small><strong>Status:</strong> {pop.status}</small>
                            <small><strong>Order code:</strong> {pop.purchase_order?.order_code}</small>
                            <small><strong>Company name:</strong> {pop.purchase_order?.client?.company_name}</small>
                            <small><strong>Client address:</strong> {pop.purchase_order?.client_address?.address}</small>
                        </div>
                    )}
                />
                <button
                    type="button"
                    onClick={() => onClose(false)}
                >Cancel</button>
                <button
                    type="button"
                    onClick={handleAdd}
                >Accept</button>
            </div>
        </div>
    );
}

export default AddPop;
