
import {
    ChevronDown,
    ChevronRight, CircleX,
    Search
} from "lucide-react";
import FadeButton
    from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import StyleModule
    from "./Step1.module.css";
import { useEffect, useState } from "react";
import {
    useAddModalProductionOrderState
} from "../../../../context/AddModalProductionOrderHooks";
import SingleSelectSearchCheck
    from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheck";
import CustomSelectString
    from "../../../../../../../../components/ui/table/components/gui/customSelectString/CustomSelect";
import type { IProduct } from "../../../../../../../../interfaces/product";
import type { IPurchasedOrder } from "../../../../../../../../interfaces/purchasedOrder";
import PurchasedOrderModel from "../../../../../../../purchased-orders/models/purchased-orders/PurchasedOrdersModel";

type OrderType = "Seleccione una opcion" | "Si, ligar a una orden de venta" | "No, producir para inventario";

const orders: OrderType[] = [
    "Seleccione una opcion",
    "Si, ligar a una orden de venta",
    "No, producir para inventario",
]

const Step1 = () => {

    const state =
        useAddModalProductionOrderState();

    const [selectedProduct, setSelectedProduct] =
        useState<IProduct | null>(null);
    const [openDropDownSelectProduct, setOpenDropDownSelectProduct] =
        useState(false);
    const [searchDropDownSelectProduct, setSearchDropDownSelectProduct] =
        useState("");


    const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
        useState<IPurchasedOrder | null>(null);
    const [openDropDownSelectPurchaseOrder, setOpenDropDownSelectPurchaseOrder] =
        useState(false);
    const [searchDropDownSelectPurchaseOrder, setSearchDropDownSelectPurchaseOrder] =
        useState("");
    const [productsOfPurchaseOrder, setProductsOfPurchaseOrder] =
        useState<IProduct[]>([]);

    const [selectedOrderType, setSelectedOrderType] =
        useState<'internal' | 'client' | null>(
            state.data?.order_type === "internal"
                ? "internal"
                : state.data?.order_type === "client"
                    ? "client"
                    : null
        );
    const [orderType, setOrderType] = useState<OrderType | null>(
        state.data?.order_type === "internal"
            ? "Si, ligar a una orden de venta"
            : state.data?.order_type === "client"
                ? "No, producir para inventario"
                : null
    );

    const handlerOnChangeOrderType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const orderType = e.target.value as OrderType;
        console.log(orderType);
        setOrderType(orderType);
        setSelectedOrderType(
            orderType === "Si, ligar a una orden de venta"
                ? "internal"
                : orderType === "No, producir para inventario"
                    ? "client"
                    : null
        );
    };

    const fetchProductsLike = async (query: string): Promise<IProduct[]> => {
        if (!query || query.trim().length === 0) return [];

        const encodedQuery = encodeURIComponent(query);

        try {
            const response = await fetch(`http://localhost:3003/products/products/filter-exclude/${encodedQuery}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ excludeIds: [] }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const products: IProduct[] = await response.json();
            console.log(products);
            return products;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    const fetchPurchaseOrderLike = async (query: string): Promise<IPurchasedOrder[]> => {
        if (!query || query.trim().length === 0) return [];

        const encodedQuery = encodeURIComponent(query);

        try {
            const response = await fetch(`http://localhost:3003/sales/purchased-orders/like/${encodedQuery}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const products: IPurchasedOrder[] = await response.json();
            console.log(products);
            return products;
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
            return [];
        }
    };

    useEffect(() => {
        if (orderType === "Si, ligar a una orden de venta") {
            setProductsOfPurchaseOrder(
                (selectedPurchaseOrder?.purchase_order_products
                    ?.map(product => product?.product)
                    ?? []) as IProduct[]
            );
        }
    }, [selectedPurchaseOrder]);

    useEffect(() => {
        setSearchDropDownSelectProduct("");
        setSearchDropDownSelectPurchaseOrder("");
        setSelectedProduct(null);
        setSelectedPurchaseOrder(null);
        setProductsOfPurchaseOrder([]);
    }, [orderType]);

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
            </section>
            <section className={StyleModule.bodySection}>
                <h2>¿Asociar a una orden de venta?</h2>
                <CustomSelectString
                    options={orders}
                    defaultLabel="Seleccione una opcion"
                    autoOpen={true}
                    value={orderType ?? "Seleccione una opcion"}
                    onChange={setOrderType}
                    icon={<ChevronDown className={StyleModule.iconButton} />}
                />
                {
                    orderType === "Si, ligar a una orden de venta" && (
                        <SingleSelectSearchCheck<IPurchasedOrder>
                            rowId="order_code"
                            search={searchDropDownSelectPurchaseOrder}
                            setSearch={setSearchDropDownSelectPurchaseOrder}
                            open={openDropDownSelectPurchaseOrder}
                            setOpen={setOpenDropDownSelectPurchaseOrder}
                            emptyMessage="No hay ordenes de compra"
                            icon={<Search size={16} />}
                            placeholder="Seleccione una orden de compra..."
                            classNameDropDownSelectItemInput={StyleModule.selectSearchMultiCheckDropDownSelectItemInput}
                            classNameContainer={StyleModule.selectSearchMultiCheckContainer}
                            classNameInputContainer={StyleModule.selectSearchMultiCheckInputContainer}
                            classNameDropDown={StyleModule.selectSearchMultiCheckDropDown}
                            classNameDropDownSelect={StyleModule.selectSearchMultiCheckDropDownSelect}
                            classNameButtonInput={StyleModule.selectSearchMultiCheckButtonInput}
                            classNameInput={`nunito-semibold ${StyleModule.selectSearchMultiCheckInput}`}
                            classNameDropDownSelectItemSelected={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
                            classNameDropDownSearch={StyleModule.selectSearchMultiCheckDropDownSearch}
                            classNameDropDownSearchItem={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSearchItem}`}
                            classNameSeparator={StyleModule.selectSearchMultiCheckSeparator}
                            classNameDropDownHeader={`nunito-bold ${StyleModule.selectSearchMultiCheckDropDownHeader}`}
                            classNameEmptyMessage={`nunito-semibold ${StyleModule.selectSearchMultiCheckEmptyMessage}`}
                            loadOptions={fetchPurchaseOrderLike}
                            selected={selectedPurchaseOrder}
                            setSelected={setSelectedPurchaseOrder}
                        />
                    )
                }
                { (
                    orderType === "Si, ligar a una orden de venta" && selectedPurchaseOrder !== null ||
                    orderType === "No, producir para inventario" && selectedPurchaseOrder === null
                ) && (
                    <SingleSelectSearchCheck<IProduct>
                        rowId="name"
                        search={searchDropDownSelectProduct}
                        setSearch={setSearchDropDownSelectProduct}
                        open={openDropDownSelectProduct}
                        setOpen={setOpenDropDownSelectProduct}
                        emptyMessage="No hay productos"
                        icon={<Search size={16} />}
                        placeholder="Seleccione un producto..."
                        classNameDropDownSelectItemInput={StyleModule.selectSearchMultiCheckDropDownSelectItemInput}
                        classNameContainer={StyleModule.selectSearchMultiCheckContainer}
                        classNameInputContainer={StyleModule.selectSearchMultiCheckInputContainer}
                        classNameDropDown={StyleModule.selectSearchMultiCheckDropDown}
                        classNameDropDownSelect={StyleModule.selectSearchMultiCheckDropDownSelect}
                        classNameButtonInput={StyleModule.selectSearchMultiCheckButtonInput}
                        classNameInput={`nunito-semibold ${StyleModule.selectSearchMultiCheckInput}`}
                        classNameDropDownSelectItemSelected={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
                        classNameDropDownSearch={StyleModule.selectSearchMultiCheckDropDownSearch}
                        classNameDropDownSearchItem={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSearchItem}`}
                        classNameSeparator={StyleModule.selectSearchMultiCheckSeparator}
                        classNameDropDownHeader={`nunito-bold ${StyleModule.selectSearchMultiCheckDropDownHeader}`}
                        classNameEmptyMessage={`nunito-semibold ${StyleModule.selectSearchMultiCheckEmptyMessage}`}
                        {...(orderType === "Si, ligar a una orden de venta" ? { options: productsOfPurchaseOrder } : { loadOptions: fetchProductsLike })}
                        selected={selectedProduct}
                        setSelected={setSelectedProduct}
                    />
                )}
            </section>
            <section className={StyleModule.footerSection}>
                <FadeButton
                    label="Cancelar"
                    onClick={() => { }}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.cancelButton}
                    classNameLabel={StyleModule.cancelButtonLabel}
                    classNameSpan={StyleModule.cancelButtonSpan}
                    icon={<CircleX className={StyleModule.cancelButtonIcon} />}
                />
                <FadeButton
                    label="Siguiente"
                    onClick={() => { }}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.nextButton}
                    classNameLabel={StyleModule.nextButtonLabel}
                    classNameSpan={StyleModule.nextButtonSpan}
                    icon={<ChevronRight className={StyleModule.nextButtonIcon} />}
                />
            </section>
        </div>
    );
};

export default Step1;
