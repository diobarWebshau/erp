
import {
    ChevronDown,
    ChevronRight,
    Search
} from "lucide-react";
import StyleModule
    from "./Step1.module.css";
import { useEffect, useRef, useState } from "react";
import {
    useAddModalProductionOrderDispatch,
    useAddModalProductionOrderState
} from "../../../../context/AddModalProductionOrderHooks";
import SingleSelectSearchCheck
    from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheck";
import CustomSelectString
    from "../../../../../../../../components/ui/table/components/gui/customSelectString/CustomSelect";
import type { IProduct } from "../../../../../../../../interfaces/product";
import type { IPurchasedOrder } from "../../../../../../../../interfaces/purchasedOrder";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import CustomSelectObject
    from "../../../../../../../../components/ui/table/components/gui/customSelectObject/CustomSelectObject";
import useLocationsProducedOneProduct
    from "../../../../../../../../modelos/locations/hooks/useLocationsProducedOneProduct";
import {
    next_step,
    update_production_order,
} from "../../../../context/AddModalProductionOrderActions";
import StandarNumericField
    from "../../../../../../../../components/ui/table/components/gui/text-field/standar-numeric-field/StandarNumericField";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";

type OrderType =
    "Si, ligar a una orden de venta" |
    "No, producir para inventario";

const orders: OrderType[] = [
    "Si, ligar a una orden de venta",
    "No, producir para inventario",
]

type FieldType =
    "order_type" |
    "product" |
    "purchase_order" |
    "location" |
    "quantity";

type Step1Props = {
    onCancel: () => void;
};

const Step1 = ({
    onCancel
}: Step1Props) => {

    const isFirstRender = useRef(true);

    const state =
        useAddModalProductionOrderState();

    const dispatch =
        useAddModalProductionOrderDispatch();

    const [selectedProduct, setSelectedProduct] =
        useState<IProduct | null>(state.data.product ?? null);
    const [openDropDownSelectProduct, setOpenDropDownSelectProduct] =
        useState(false);
    const [searchDropDownSelectProduct, setSearchDropDownSelectProduct] =
        useState(state.data.product?.name ?? "");


    const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
        useState<IPurchasedOrder | null>(
            state.data?.purchase_order  ?? null
        );
    const [openDropDownSelectPurchaseOrder, setOpenDropDownSelectPurchaseOrder] =
        useState(false);
    const [searchDropDownSelectPurchaseOrder, setSearchDropDownSelectPurchaseOrder] =
        useState(state.data.purchase_order?.order_code ?? "");
    const [productsOfPurchaseOrder, setProductsOfPurchaseOrder] =
        useState<IProduct[]>([]);

    const [validationForm, setValidationForm] =
        useState<Record<FieldType, string | null | undefined>>({
            order_type: null,
            product: null,
            purchase_order: null,
            location: null,
            quantity: null,
        });

    const [selectedLocation, setSelectedLocation] =
        useState<ILocation | null | undefined>(state.data.location ?? null);

    const [quantity, setQuantity] = useState<number | undefined | null>(state.data?.qty ?? undefined);

    const [orderType, setOrderType] = useState<OrderType | "Seleccione una opcion">(
        state.data?.order_type === "client"
            ? "Si, ligar a una orden de venta"
            : state.data?.order_type === "internal"
                ? "No, producir para inventario"
                : "Seleccione una opcion"
    );

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
            console.log(encodedQuery);
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

    const {
        locationsProducedProduct,
        loadingLocationsProducedProduct,
    } = useLocationsProducedOneProduct(selectedProduct?.id ?? null);




    const handleOnClickButtonNext = () => {
        if (orderType === "Si, ligar a una orden de venta") {
            if (selectedPurchaseOrder && selectedProduct && selectedLocation && quantity) {
                if (!validateQtyProductsOfPurchaseOrder(selectedProduct, quantity)) {
                    return;
                }
                dispatch(update_production_order({
                    order_type: "client",
                    order_id:
                        selectedPurchaseOrder.purchase_order_products
                            ?.find(
                                product => product?.product?.id === selectedProduct.id
                            )?.id ?? null,
                    product_id: selectedProduct.id,
                    status: "pending",
                    product_name: selectedProduct.name,
                    location: selectedLocation,
                    product: selectedProduct,
                    purchase_order: selectedPurchaseOrder,
                    qty: quantity,

                }));
                dispatch(next_step());
            } else {
                if (!selectedPurchaseOrder) {
                    setValidationForm((prev) => ({
                        ...prev,
                        purchase_order: "Por favor, selecciona una orden de venta",
                    }));
                }
                if (!selectedProduct) {
                    setValidationForm((prev) => ({
                        ...prev,
                        product: "Por favor, selecciona un producto",
                    }));
                }
                if (!selectedLocation) {
                    setValidationForm((prev) => ({
                        ...prev,
                        location: "Por favor, selecciona una ubicación",
                    }));
                }
                if (!quantity || quantity <= 0) {
                    setValidationForm((prev) => ({
                        ...prev,
                        quantity: "Por favor, ingresa una cantidad",
                    }));
                }

            }
        } else if (orderType === "No, producir para inventario") {
            if (selectedProduct && selectedLocation && quantity) {
                dispatch(update_production_order({
                    order_type: "internal",
                    product_id: selectedProduct.id,
                    status: "pending",
                    product_name: selectedProduct.name,
                    location: selectedLocation,
                    product: selectedProduct,
                    qty: quantity,
                }));
                dispatch(next_step());

            } else {
                if (!selectedProduct) {
                    setValidationForm((prev) => ({
                        ...prev,
                        product: "Por favor, selecciona un producto",
                    }));
                }
                if (!selectedLocation) {
                    setValidationForm((prev) => ({
                        ...prev,
                        location: "Por favor, selecciona una ubicación",
                    }));
                }
                if (!quantity || quantity <= 0) {
                    setValidationForm((prev) => ({
                        ...prev,
                        quantity: "Por favor, ingresa una cantidad",
                    }));
                }
            }
        } else {
            setValidationForm((prev) => ({
                ...prev,
                order_type: "Por favor, selecciona un tipo de orden de producción",
            }));
        }
    };

    const hadnleOnChangeProduct = (product: IProduct | null) => {
        if (product) {
            setSelectedProduct(product);
            setValidationForm((prev) => ({
                ...prev,
                product: null,
            }));
        } else {
            setValidationForm((prev) => ({
                ...prev,
                product: "Por favor, selecciona un producto",
            }));
        }
    };


    const hadnleOnChangePurchaseOrder = (purchaseOrder: IPurchasedOrder | null | undefined) => {
        if (purchaseOrder) {
            setSelectedPurchaseOrder(purchaseOrder);
            setValidationForm((prev) => ({
                ...prev,
                purchase_order: null,
            }));
        } else {
            purchaseOrder === null &&
                setValidationForm((prev) => ({
                    ...prev,
                    purchase_order: "Por favor, selecciona una orden de compra",
                }));
        }
    };

    const hadnleOnChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
        const quantitys = e.target.value;
        if (quantitys && Number(quantitys) > 0) {
            setQuantity(Number(quantitys));
            if (
                orderType === "Si, ligar a una orden de venta"
            ) {
                const quantityPurchaseOrder =
                    selectedPurchaseOrder?.purchase_order_products?.find(
                        product =>
                            product?.product?.id === selectedProduct?.id
                    )?.qty;
                if (Number(quantitys) > (quantityPurchaseOrder ?? 0)) {
                    setValidationForm((prev) => ({
                        ...prev,
                        quantity:
                            `La cantidad no puede ser mayor a la de la orden` +
                            ` de compra (${Number(Number(quantityPurchaseOrder).toFixed(0))})`,
                    }));
                    return;
                }
            }
            setValidationForm((prev) => ({
                ...prev,
                quantity: null,
            }));
        } else {
            setQuantity(undefined);
        }
    };

    useEffect(() => {
        if (orderType === "Si, ligar a una orden de venta") {
            setProductsOfPurchaseOrder(
                returnValidProductsOfPurchaseOrder()
            );
        }
    }, [selectedPurchaseOrder]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setSearchDropDownSelectProduct("");
        setSearchDropDownSelectPurchaseOrder("");
        setSelectedProduct(null);
        setSelectedPurchaseOrder(null);
        setSelectedLocation(null);
        setProductsOfPurchaseOrder([]);
        setValidationForm((prev) => ({
            ...prev,
            location: null,
            product: null,
            purchase_order: null,
            quantity: null,
            order_type: null,
        }));
        setQuantity(undefined);
    }, [orderType]);

    const returnValidProductsOfPurchaseOrder = () => {
        return selectedPurchaseOrder?.purchase_order_products?.filter(
            (product) => {
                const originalQty = product.production_summary?.purchased_order_product_qty ?? 0;
                const productionOrderQty = product.production_summary?.production_order_qty ?? 0;
                const productionQty = product.production_summary?.production_qty ?? 0;
                if (productionQty + productionOrderQty < originalQty) {
                    return product.product;
                }
            }
        ) as IProduct[] ?? [];
    };

    const validateQtyProductsOfPurchaseOrder = (
        product: IProduct,
        quantity: number
    ) => {
        const productoInPurchasedOrder =
            selectedPurchaseOrder?.purchase_order_products?.find(p => p?.product?.id === product.id);

        const productionOrderQty = productoInPurchasedOrder?.production_summary?.production_order_qty ?? 0;
        const productionQty = productoInPurchasedOrder?.production_summary?.production_qty ?? 0;

        const availableQty = productionOrderQty - productionQty;

        if (quantity > availableQty) {
            setValidationForm((prev) => ({
                ...prev,
                quantity:
                    `La cantidad no puede exceder la cantidad disponible para producir (${availableQty})`,
            }));
            return false;
        }
        return true;
    }

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
            </section>
            <section className={StyleModule.bodySection}>
                <div className={StyleModule.containerSelect}>
                    <h2 className="nunito-bold">¿Asociar a una orden de venta?</h2>
                    <CustomSelectString
                        options={orders}
                        defaultLabel="Seleccione una opcion"
                        autoOpen={false}
                        value={orderType ?? "Seleccione una opcion"}
                        onChange={setOrderType}
                        icon={<ChevronDown className={StyleModule.iconButton} />}
                        classNameFieldContainer={StyleModule.customSelectFieldContainer}
                        classNameToggleContainer={StyleModule.customSelectToggleContainer}
                        classNameOption={StyleModule.customSelectOption}
                    />
                    {
                        validationForm.order_type && (
                            <p className="nunito-semibold">{validationForm.order_type}</p>
                        )
                    }
                </div>
                {
                    orderType === "Si, ligar a una orden de venta" && (
                        <div className={StyleModule.containerValidation}>
                            <SingleSelectSearchCheck<IPurchasedOrder>
                                rowId="order_code"
                                search={searchDropDownSelectPurchaseOrder}
                                setSearch={setSearchDropDownSelectPurchaseOrder}
                                open={openDropDownSelectPurchaseOrder}
                                setOpen={setOpenDropDownSelectPurchaseOrder}
                                emptyMessage="No hay ordenes de compra"
                                icon={<Search className={StyleModule.iconButton} />}
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
                                setSelected={hadnleOnChangePurchaseOrder}
                            />
                            {
                                validationForm.purchase_order && (
                                    <p className="nunito-semibold">{validationForm.purchase_order}</p>
                                )
                            }
                        </div>
                    )
                }
                {(
                    orderType === "Si, ligar a una orden de venta" &&
                    selectedPurchaseOrder !== null ||
                    orderType === "No, producir para inventario" &&
                    selectedPurchaseOrder === null
                ) && (
                        <div className={StyleModule.containerValidation}>
                            <SingleSelectSearchCheck<IProduct>
                                rowId="name"
                                search={searchDropDownSelectProduct}
                                setSearch={setSearchDropDownSelectProduct}
                                open={openDropDownSelectProduct}
                                setOpen={setOpenDropDownSelectProduct}
                                emptyMessage="No hay productos"
                                icon={<Search className={StyleModule.iconButton} />}
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
                                setSelected={hadnleOnChangeProduct}
                            />
                            {
                                validationForm.product && (
                                    <p className="nunito-semibold">{validationForm.product}</p>
                                )
                            }
                        </div>
                    )
                }
                {
                    !loadingLocationsProducedProduct &&
                    orderType !== null &&
                    selectedProduct !== null && (
                        <div className={StyleModule.containerValidation}>

                            <CustomSelectObject
                                options={locationsProducedProduct}
                                labelKey="name"
                                defaultLabel="Selecciona una ubicacion"
                                autoOpen={false}
                                onChange={setSelectedLocation}
                                value={selectedLocation}
                                icon={<ChevronDown className={StyleModule.iconButton} />}
                                classNameFieldContainer={StyleModule.customSelectFieldContainer}
                                classNameToggleContainer={StyleModule.customSelectToggleContainer}
                                classNameOption={StyleModule.customSelectOption}
                            />
                            {
                                validationForm.location && (
                                    <p className="nunito-semibold">{validationForm.location}</p>
                                )
                            }
                        </div>
                    )
                }
                {((orderType === "No, producir para inventario" && selectedProduct !== null && selectedLocation !== null) ||
                    (orderType === "Si, ligar a una orden de venta" && selectedPurchaseOrder !== null && selectedProduct !== null && selectedLocation !== null)) && (
                        <div className={StyleModule.containerValidation}>
                            <StandarNumericField
                                value={quantity || ''}
                                onChange={hadnleOnChangeQuantity}
                                required
                                type="number"
                                placeholder="Ingrese la cantidad"
                                autoFocus
                                id="quantity"
                                name="quantity"

                            />
                            {
                                validationForm.quantity && (
                                    <p className="nunito-semibold">{validationForm.quantity}</p>
                                )
                            }
                        </div>
                    )
                }
            </section>
            <section className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={onCancel}
                    label="Cancelar"
                />
                <MainActionButtonCustom
                    onClick={handleOnClickButtonNext}
                    label="Siguiente"
                    icon={<ChevronRight />}
                />
            </section>
        </div>
    );
};

export default Step1;
