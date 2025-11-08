
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step4.module.css";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useCallback, useMemo, useState } from "react";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { back_step } from "../../../../context/shippingOrderActions";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { DateUtils } from "../../../../../../../../utils/dayJsUtils";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialShippingOrderPurchasedOrderProduct } from "interfaces/shippingPurchasedProduct";
import GenericTableMemo from "../../../../../../../../comp/primitives/table/tableContext/GenericTable";
import FeedBackModal from "../../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import { useSelector } from "react-redux";
import type { RootState } from "store/store";
import toastMantine from "../../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialShippingOrder } from "interfaces/shippingOrder";

interface IStep4 { onClose: () => void, onLeave: () => void, onCreate: (shippingOrder: IPartialShippingOrder) => void }

const Step4 = ({ onClose, onLeave, onCreate }: IStep4) => {

    const dispatch = useShippingOrderDispatch();
    const state = useShippingOrderState();
    const validationError = useSelector((state: RootState) => state.error);

    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);

    const columns: ColumnDef<IPartialShippingOrderPurchasedOrderProduct>[] = [
        {
            id: "order",
            header: "Orden",
            accessorFn: (row) => row.purchase_order_products?.purchase_order?.order_code,
        },
        {
            id: "sku",
            header: "SKU",
            accessorFn: (row) => row.purchase_order_products?.product?.sku,
        },
        {
            id: "name",
            header: "Producto",
            accessorFn: (row) => row.purchase_order_products?.product?.name,
        },
        {
            accessorKey: "qty",
            header: "Cantidad",
        },
        {
            id: "warehouse",
            accessorFn: (row) => row.location?.name,
            header: "Almacén de envío",
        },
    ];


    const { purchasedOrder, location } = useMemo(() => {
        const getValues = () => {
            const purchaseOrderProduct = [...state.data?.shipping_order_purchase_order_product || []].shift();
            const purchasedOrder = purchaseOrderProduct?.purchase_order_products?.purchase_order;
            const location = purchaseOrderProduct?.location;
            return { purchasedOrder, location };
        };
        return getValues();
    }, [state.data?.shipping_order_purchase_order_product]);


    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch, back_step]);
    const handleOnClickNextStep = useCallback(() => {
        onCreate(state.data);
        if (Object.keys(validationError).length > 0) {
            const errorsEntries = Object.entries(validationError);
            const errors = errorsEntries.map(([_, value]) => value);
            errors.forEach(error => toastMantine.error({ message: error as string }));
            return;
        }
        setIsActiveFeedBackModal(true);
    }, [onCreate]);

    return (
        <div className={StyleModule.container}>
            <h2 className={`nunito-bold ${StyleModule.header}`}>Datos de envío</h2>
            <div className={StyleModule.subHeader}>
                <div className={StyleModule.leftContent}>
                    <h3 className={`nunito-semibold ${StyleModule.subTitle}`}>Remitente</h3>
                    <div className={StyleModule.subContent}>
                        <div className={StyleModule.subContentItem}>
                            <span className={`nunito-bold ${StyleModule.boldText}`}>Empresa de Mexicali</span>
                            <span>{location?.name}</span>
                            <span>{location?.email}</span>
                            <span>{`Tel. ${location?.phone}`}</span>
                            <span>{`${location?.city}, ${location?.state}, ${location?.country}`}</span>
                            <span>{location?.address}</span>
                        </div>
                        <div className={StyleModule.subContentItem}>
                            <dl>
                                <dt className={`nunito-bold ${StyleModule.boldPrimary}`}>Fecha de envío:</dt>
                                <dd>{DateUtils.format(state.data?.shipping_date || new Date())}</dd>
                            </dl>
                            <dl>
                                <dt>Tipo de envío:</dt>
                                <dd>Nacional</dd>
                            </dl>
                            <dl>
                                <dt>Transportista:</dt>
                                <dd>{state.data?.carrier?.name}</dd>
                            </dl>
                            <dl>
                                <dt>Medio de transporte:</dt>
                                <dd>{state.data?.delivery_cost}</dd>
                            </dl>
                            <dl>
                                <dt>Tipo de envío:</dt>
                                <dd>{state.data?.delivery_cost}</dd>
                            </dl>
                            <dl>
                                <dt>Costos:</dt>
                                <dd>{state.data?.delivery_cost}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className={StyleModule.rightContent}>
                    <h3 className={`nunito-semibold ${StyleModule.subTitle}`}>Dirección</h3>
                    <div className={StyleModule.subContent}>
                        <div className={StyleModule.subContentItem}>
                            <span className={`nunito-bold ${StyleModule.boldText}`}>Cliente</span>
                            <span>{purchasedOrder?.company_name}</span>
                            <span>{purchasedOrder?.email}</span>
                            <span>{`Tel. ${purchasedOrder?.phone}`}</span>
                            <span>{`${purchasedOrder?.city}, ${purchasedOrder?.state}, ${purchasedOrder?.country}`}</span>
                            <span>{`${purchasedOrder?.street}, ${purchasedOrder?.street_number}, ${purchasedOrder?.street_number}, ${purchasedOrder?.neighborhood},  C.P. ${purchasedOrder?.zip_code}`}</span>
                        </div>
                        <div className={`nunito-semibold ${StyleModule.subContentItem}`}>
                            <dl>
                                <dt className={`nunito-bold ${StyleModule.boldPrimary}`}>Entrega estimada:</dt>
                                <dd>{DateUtils.format(state.data?.shipping_date || new Date())}</dd>
                            </dl>
                            <span className={`nunito-bold ${StyleModule.boldText}`}>Direccion de envio</span>
                            <span>{`${purchasedOrder?.city}, ${purchasedOrder?.state}, ${purchasedOrder?.country}`}</span>
                            <span>{`${purchasedOrder?.shipping_street}, ${purchasedOrder?.shipping_street_number}, ${purchasedOrder?.shipping_street_number}, ${purchasedOrder?.shipping_neighborhood},  C.P. ${purchasedOrder?.shipping_zip_code}`}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={StyleModule.contentSection}>
                <h3 className={`nunito-semibold ${StyleModule.subTitle}`}>{`Order #12345678`}</h3>
                <GenericTableMemo
                    modelName="shipping_order_purchase_order_product"
                    getRowId={(row) => row?.id?.toString() || ""}
                    columns={columns}
                    data={state.data?.shipping_order_purchase_order_product || []}
                    classNameGenericTableContainer={StyleModule.tableContainer}
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
                    label="Generar envío"
                    icon={<ChevronRight />}
                />
            </div>
            {
                isActiveFeedBackModal &&
                <FeedBackModal
                    onClose={onLeave}
                    title="Tu orden de envío se ha creado correctamentessd"
                    icon={<CheckCircle2 />}
                    messageCustom={
                        <div>
                            <MainActionButtonCustom
                                onClick={()=>{}}
                                label="Ver envío"
                                icon={<Eye />}
                            />
                        </div>
                    }
                />
            }
        </div>
    )
}


export default Step4;
