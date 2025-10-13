import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { add_shipping_order_purchased_order_products, add_shipping_order_purchased_order_products_aux, back_step, next_step, remove_shipping_order_purchased_order_products, update_shipping_order, update_shipping_order_purchased_order_products, update_shipping_order_purchased_order_products_aux } from "../../../../context/shippingOrderActions";
import { memo, useCallback, useEffect, useMemo, useState, type Dispatch } from "react";
import DateInputMantine from "./../../../../../../../../comp/external/mantine/date/input/base/DateInputMantine"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import type { IPartialShippingOrderPurchasedOrderProduct } from "interfaces/shippingPurchasedProduct";
import useLocationsProducedOneProduct from "./../../../../../../../../modelos/locations/hooks/useLocationsProducedOneProduct"
import GeneralTable from "./../../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { ILocation } from "interfaces/locations";
import NumericInputCustomMemo from "./../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import { formatNumber } from "./../../../../../../../../helpers/formttersNumeric";
import Tag from "./../../../../../../../../comp/primitives/tag/Tag";
import usePurchasedOrders from "../../../../../../../../modelos/purchased_orders/hooks/usePurchasedOrders";
import type { IPartialPurchasedOrder, IPurchasedOrder } from "interfaces/purchasedOrder";
import SelectPurchasedModal from "../../../../../../../../comp/features/modal-purchase/SelectPurchasedModal";
import type { ShippingOrderAction } from "../../../../context/shippingOrderTypes";
import { diffObjectArrays } from "../../../../../../../../utils/validation-on-update/validationOnUpdate";
import type { TableStatePartial } from "../../../../../../../../comp/primitives/table/tableContext/tableTypes";
import { generateRandomIds } from "../../../../../../../../helpers/nanoId";
import ObjectSelectCustomMemo from "../../../../../../../../comp/primitives/select/object-select/base/base/ObjectSelectCustom";
import toastMantine from "../../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import StyleModule from "./Step2.module.css";

interface IStep2 {
    onClose: () => void;
}

const Step2 = ({
    onClose
}: IStep2) => {

    const state = useShippingOrderState();
    const dispatch = useShippingOrderDispatch();

    const getRowId = useCallback((row: IPartialShippingOrderPurchasedOrderProduct) => row.id?.toString() || "", []);
    const date = useMemo(() => state.data?.delivery_date || null, [state.data?.delivery_date]);

    const [selectedSopops, initialTableState] = useMemo(() => {
        const selectedSopops = state.data?.shipping_order_purchase_order_product || [];
        const rowSelectionState: RowSelectionState = {}
        selectedSopops.forEach(p => {
            rowSelectionState[p?.id?.toString() || ""] = true;
        });
        const initialTableState: TableStatePartial = {
            ...(Object.keys(rowSelectionState).length > 0 ? { rowSelectionState } : {})
        }
        return [selectedSopops, initialTableState];
    }, [state.data?.shipping_order_purchase_order_product]);

    const [purchase_orders, client_name, purchaseOrder]: [IPartialPurchasedOrder[], string, IPurchasedOrder] = useMemo(() => {
        const purchase_orders = (state.data?.shipping_order_purchase_order_product_aux ?? [])
            .map(p => p.purchase_order_products?.purchase_order)
            .filter((p): p is IPartialPurchasedOrder => p !== undefined);
        const purchaseOrder = [...purchase_orders].shift() as IPurchasedOrder;
        const client_name = purchaseOrder?.client?.company_name || "";
        return [purchase_orders, client_name, purchaseOrder];
    }, [state.data?.shipping_order_purchase_order_product_aux]);

    const [deliveryDate, setDeliveryDate] = useState<Date | null>(date);
    const [isActiveAddNewOrderModal, setIsActiveAddNewOrderModal] = useState<boolean>(false);
    const { purchasedOrders, loadingPurchasedOrders } = usePurchasedOrders(client_name, 0);
    const [sopops, setSopops] = useState<IPartialShippingOrderPurchasedOrderProduct[]>(selectedSopops);

    const filterPurchasedOrderAlreadySelected = useMemo(() => {
        return purchasedOrders.filter(p => !purchase_orders.some(sp => sp.id === p.id));
    }, [purchase_orders, purchasedOrders]);

    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch, back_step]);

    const toggleAddNewOrderModal = useCallback(() => {
        setIsActiveAddNewOrderModal(!isActiveAddNewOrderModal);
    }, [isActiveAddNewOrderModal, setIsActiveAddNewOrderModal]);

    const handleRowSelectionChange = (selected: IPartialShippingOrderPurchasedOrderProduct[]) => {
        const diffObject = diffObjectArrays(sopops, selected);
        const { added, deleted } = diffObject;
        if (added.length > 0) {
            setSopops(prev => [...prev, ...added]);
        }
        if (deleted.length > 0) {
            const del = new Set(deleted.map(d => d.id));
            setSopops(prev => prev.filter(p => !del.has(p.id)));
        }
    };

    const handleAddPurchasedOrder = useCallback((sopops: IPartialShippingOrderPurchasedOrderProduct[]) => {
        const sopposWithId = sopops.map(sopop => ({ ...sopop, id: generateRandomIds() }));
        dispatch(add_shipping_order_purchased_order_products_aux(sopposWithId));
    }, [dispatch]);

    const handleOnClickNextStep = useCallback(() => {
        const updateValues = state.data?.shipping_order_purchase_order_product_aux?.filter(p => sopops.some(sopop => sopop.id === p.id)) || [];
        const locationBase = [...updateValues].shift()?.location;
        const isSameLocation = updateValues?.every((p) => p.location?.id === locationBase?.id);
        const [isAnyExceeds, isExceedQtyLocation] = (
            () => {
                const anyExceeds = updateValues?.some((item) => {
                    const orderQty = Number(item.purchase_order_products?.shipping_summary?.order_qty ?? 0);
                    const shippedQty = Number(item.purchase_order_products?.shipping_summary?.shipping_qty ?? 0);
                    const remaining = orderQty - shippedQty;
                    const requested = Number(item.qty ?? 0);

                    return requested > remaining;
                }) ?? false;

                const someIsExceedQtyLocation = updateValues?.some((p) => (p.qty ?? 0) > (p?.location?.inventory?.available ?? 0));
                return [anyExceeds, someIsExceedQtyLocation];
            }
        )();
        if (updateValues.length === 0) {
            toastMantine.feedBackForm({
                message: "Debe seleccionar al menos un producto para generar la orden de envio."
            });
            return;
        }
        if (!isSameLocation) {
            toastMantine.feedBackForm({
                message: "Todos los productos a enviar deben pertenecer a la misma ubicación."
            });
            return;
        }
        if (isExceedQtyLocation) {
            toastMantine.feedBackForm({
                message: "Verifica que todas las cantidades de los productos puedan ser abastecidos por la ubicación asignada antes de continuar."
            });
            return;
        }
        if (isAnyExceeds) {
            toastMantine.feedBackForm({
                message: "Solo puede procesarse la cantidad que aún no ha sido enviada de la orden."
            });
            return;
        }
        if (!deliveryDate) {
            toastMantine.feedBackForm({
                message: "Debe seleccionar una fecha de envio valida."
            });
            return;
        }
        const diffObject = diffObjectArrays(state.data?.shipping_order_purchase_order_product ?? [], updateValues);
        if (diffObject.added.length > 0) {
            const added = diffObject.added;
            dispatch(add_shipping_order_purchased_order_products(added));
        }
        if (diffObject.deleted.length > 0) {
            const ids = new Set(diffObject.deleted.map(d => d.id));
            dispatch(remove_shipping_order_purchased_order_products([...ids]));
        }
        if (diffObject.modified.length > 0) {
            const modified = diffObject.modified;
            const updateValues = modified.map(m => ({ id: m.id, attributes: m }));
            updateValues.forEach(u => {
                dispatch(update_shipping_order_purchased_order_products({ id: u.id, attributes: u.attributes }))
            });
        }
        dispatch(update_shipping_order({ delivery_date: deliveryDate }));
        dispatch(next_step());
    }, [sopops, state.data?.shipping_order_purchase_order_product, state.data?.shipping_order_purchase_order_product_aux, deliveryDate, date]);

    const columns: ColumnDef<IPartialShippingOrderPurchasedOrderProduct>[] = useMemo(() => [
        {
            id: "order_id",
            header: "Orden ID",
            accessorFn: (row) => row.purchase_order_products?.purchase_order?.order_code,
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            },
        },
        {
            id: "sku",
            accessorFn: (row) => row.purchase_order_products?.product?.sku,
            header: "SKU",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            },
        },
        {
            id: "product",
            accessorFn: (row) => row.purchase_order_products?.product?.name,
            header: "Producto",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            },
        },
        {
            id: "qty",
            header: "Cantidad",
            accessorFn: (row) => row.purchase_order_products?.qty,
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
            },
            cell: (row) => {
                const record = row.row.original;
                const valueQty: number = record.purchase_order_products?.qty || 0;
                return <div> {formatNumber(valueQty)}</div>;
            }
        },
        {
            id: "qty_delivery",
            header: "Cantidad enviada",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
            },
            cell: (row) => {
                const record = row.row.original;
                const valueQty: number = record.purchase_order_products?.shipping_summary?.shipping_qty || 0;
                return <div> {`${formatNumber(valueQty)} / ${formatNumber(record.purchase_order_products?.qty || 0)}`}</div>;
            }
        },
        {
            id: "quantity",
            accessorKey: "qty",
            header: "Cantidad a enviar",
            cell: ({ row }) => (
                <QuantityCell
                    record={row.original}
                    dispatch={dispatch}
                />
            ),
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
            },
        },
        {
            id: "disponibilidad ",
            header: "Disponibilidad",
            cell: (row) => {
                const record = row.row.original;
                return (
                    <TagTable
                        qty={record.qty || 0}
                        available={record.location?.inventory?.available || 0}
                        minimumStock={record.location?.inventory?.minimum_stock || 0}
                    />
                );
            },
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
            },
        },
        {
            id: "location",
            header: "Ubicación",
            cell: ({ row }) => <LocationCell record={row.original} dispatch={dispatch} />,
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
            },
        }
    ], []);

    return (
        <div className={StyleModule.container}>
            <div className={StyleModule.header}>
                <h2 className="nunito-bold">Orden #V-51236</h2>
                <MainActionButtonCustom
                    onClick={toggleAddNewOrderModal}
                    label="Agregar orden"
                    icon={<Plus />}
                    disabled={!(filterPurchasedOrderAlreadySelected.length > 0)}
                />
            </div>
            <div className={StyleModule.subheader}>
                <div className={StyleModule.subHeaderLeft}>
                    <p className={`nunito-bold ${StyleModule.subTitle}`}>{purchaseOrder?.client?.company_name}</p>
                    <p className="nunito-semibold">{purchaseOrder?.client?.email}</p>
                    <p className="nunito-semibold">{`Tel. ${purchaseOrder?.client?.phone}`}</p>
                    <p className="nunito-semibold">{`${purchaseOrder?.client?.city}, ${purchaseOrder?.client?.state}, ${purchaseOrder?.client?.country}`}</p>
                    <p className="nunito-semibold">{purchaseOrder?.client?.address}</p>
                </div>
                <div className={StyleModule.subHeaderRight}>
                    <div>
                        <span>Entrega estimada:</span>
                        <DateInputMantine
                            value={deliveryDate}
                            onChange={setDeliveryDate}
                            positionPopover="bottom-end"
                        />
                    </div>
                    <div>
                        <span className="nunito-bold">Dirección de envío</span>
                        <p>{`${purchaseOrder?.shipping_city}, ${purchaseOrder?.shipping_state}, ${purchaseOrder?.shipping_country}`}</p>
                        <p>{purchaseOrder?.shipping_address}</p>
                    </div>
                </div>
            </div>

            <div className={StyleModule.content}>
                <GeneralTable
                    modelName="shipping_order_purchase_order_product"
                    columns={columns}
                    data={state.data?.shipping_order_purchase_order_product_aux as IPartialShippingOrderPurchasedOrderProduct[]}
                    enableRowSelection
                    classNameGenericTableContainer={StyleModule.genericTableContainer}
                    classNameTableBody={StyleModule.tableBody}
                    onRowSelectionChangeExternal={handleRowSelectionChange}
                    getRowId={getRowId}
                    initialState={initialTableState}
                />
            </div>
            <div className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={onClose}
                    label="Cancelar"
                />
                <TertiaryActionButtonCustom
                    onClick={handleOnClickPrevious}
                    label="Regresar"
                    icon={<ChevronLeft />}
                />
                <MainActionButtonCustom
                    onClick={handleOnClickNextStep}
                    label="Siguiente"
                    icon={<ChevronRight />}
                />
            </div>
            {
                isActiveAddNewOrderModal && !loadingPurchasedOrders && (
                    <SelectPurchasedModal
                        onClose={toggleAddNewOrderModal}
                        onAdd={handleAddPurchasedOrder}
                        purchasedOrders={filterPurchasedOrderAlreadySelected}
                    />
                )
            }
        </div>
    )
}

export default Step2;

// *********** QuantityCell ***********

interface QuantityCellProps {
    record: IPartialShippingOrderPurchasedOrderProduct;
    dispatch: Dispatch<ShippingOrderAction>;
}

const QuantityCell = memo(({
    record,
    dispatch,
}: QuantityCellProps) => {

    const [valueQty, limitQty] = useMemo(() => {
        const valueQty = record.qty || 0;
        const limitQty = (Number(record.purchase_order_products?.qty ?? 0) -
            Number(record.purchase_order_products?.shipping_summary?.shipping_qty ?? 0));
        return [valueQty, limitQty];
    }, [record]);

    const handleChange = useCallback((value: number) => {
        dispatch(
            update_shipping_order_purchased_order_products_aux({
                id: record.purchase_order_product_id ?? 0,
                attributes: { qty: value },
            })
        );
    }, [dispatch, record.purchase_order_product_id]);

    return (
        <NumericInputCustomMemo
            value={valueQty}
            onChange={handleChange}
            onlyCommitOnBlur
            max={limitQty}
            min={1}
            classNameContainer={StyleModule.containerNumericInput}
            classNameInput={StyleModule.inputNumericInput}
        />
    );
});

// *********** LocationCell ***********

interface LocationCellProps {
    record: IPartialShippingOrderPurchasedOrderProduct;
    dispatch: Dispatch<ShippingOrderAction>;
}

const LocationCell = memo(({ record, dispatch }: LocationCellProps) => {

    const product = record.purchase_order_products?.product;

    const { loadingLocationsProducedProduct, locationsProducedProduct } = useLocationsProducedOneProduct(product?.id ?? 0);

    const handleOnChangeLocation = useCallback(
        (location: ILocation | null | undefined) => {
            dispatch(update_shipping_order_purchased_order_products_aux({
                id: record.purchase_order_product_id ?? 0,
                attributes: { location: location ?? undefined }
            }));
        }, [dispatch, record]);

    useEffect(() => {
        if (!record.location && locationsProducedProduct.length > 0) {
            const initialLocation = locationsProducedProduct.find(
                loc => loc.id === record.purchase_order_products?.purchase_order_product_location_production_line
                    ?.production_line?.location_production_line?.location?.id
            );
            if (initialLocation) handleOnChangeLocation(initialLocation);
        }
    }, [locationsProducedProduct, handleOnChangeLocation, record]);

    return (
        <div className={StyleModule.objectSelectContainer}>
            {!loadingLocationsProducedProduct && (
                <ObjectSelectCustomMemo
                    options={locationsProducedProduct}
                    labelKey="name"
                    value={record.location as ILocation}
                    defaultLabel="Selecciona una ubicación"
                    onChange={handleOnChangeLocation}
                    classNameInput={StyleModule.objectSelectInput}
                    classNameOption={StyleModule.objectSelectOption}
                />
            )}
        </div>
    );
});

/* ********** Tag ********** */

interface TagTableProps {
    qty: number;
    available: number;
    minimumStock: number;
}

const TagTable = memo(({
    qty,
    available,
    minimumStock
}: TagTableProps) => {
    // OJO: lo correcto normalmente es comparar el remanente (available - qty)
    const { className } = useMemo(() => {
        let className: string;
        const remaining = available - qty;

        if (available < qty) {
            className = StyleModule.tagError;
        } else if (remaining > minimumStock) {
            className = StyleModule.tagSuccess;
        } else {
            className = StyleModule.tagWarning;
        }
        return { className };
    }, [qty, available, minimumStock]);

    return <Tag label={formatNumber(available)} className={className} />;
});