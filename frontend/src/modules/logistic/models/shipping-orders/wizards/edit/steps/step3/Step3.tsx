
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useCallback, useMemo } from "react";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { Download, Pencil } from "lucide-react";
import { DateUtils } from "../../../../../../../../utils/dayJsUtils";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialShippingOrderPurchasedOrderProduct } from "interfaces/shippingPurchasedProduct";
import GenericTableMemo from "../../../../../../../../comp/primitives/table/tableContext/GenericTable";
import SecundaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import Tag from "../../../../../../../../comp/primitives/tag/Tag";
import clsx from "clsx";
import StyleModule from "./Step3.module.css";
import ShippingIcon from "../../../../../../../../comp/icons/ShippingIcon";
import { set_draft_shipping_order, set_step } from "../../../../context/shippingOrderActions";

interface IStep3 { onClose: () => void }

const Step3 = ({ }: IStep3) => {

    const dispatch = useShippingOrderDispatch();
    const state = useShippingOrderState();



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
            accessorFn: (row) => row.location_name,
            header: "Almacén de envío",
        },
    ];

    const { purchasedOrder, location } = useMemo(() => {
        const getValues = () => {
            const sopop = [...state.data?.shipping_order_purchase_order_product || []].shift();
            const purchasedOrder = sopop?.purchase_order_products?.purchase_order;
            const location = sopop?.purchase_order_products?.inventory_commited?.location;
            return { purchasedOrder, location };
        };
        return getValues();
    }, [state.data?.shipping_order_purchase_order_product]);

    const handleOnClickEdit = useCallback(() => {
        dispatch(set_draft_shipping_order(state.data));
        dispatch(set_step(1));
    }, [dispatch, state.data]);

    const tagStatusClassName = useMemo(() => {
        return clsx(StyleModule[state.data?.status?.toLowerCase() || ""])
    }, [state.data?.status]);

    const processStatus = useMemo(() => {
        const status = state.data?.status?.toLowerCase() || "";
        return status === "released" ? "Pendiente" : status === "shipping" ? "Enviado" : "Finalizado";
    }, [state.data?.status]);

    return (
        <div className={StyleModule.container}>
            <div className={StyleModule.header}>
                <h2 className="nunito-bold">Envío {state.data?.code}</h2>
                <dl className={`nunito-bold ${StyleModule.dlStatus}`}>
                    <dt>Estado:</dt>
                    <dd>
                        <Tag label={processStatus} className={`nunito-bold ${StyleModule.tag} ${tagStatusClassName}`} />
                    </dd>
                </dl>
            </div>
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
                            <span>{`${purchasedOrder?.address} C.P. ${purchasedOrder?.zip_code}`}</span>
                        </div>
                        <div className={`nunito-semibold ${StyleModule.subContentItem}`}>
                            <dl>
                                <dt className={`nunito-bold ${StyleModule.boldPrimary}`}>Entrega estimada:</dt>
                                <dd>{DateUtils.format(state.data?.shipping_date || new Date())}</dd>
                            </dl>
                            <span className={`nunito-bold ${StyleModule.boldText}`}>Direccion de envio</span>
                            <span>{`${purchasedOrder?.city}, ${purchasedOrder?.state}, ${purchasedOrder?.country}`}</span>
                            <span>{`${purchasedOrder?.shipping_address} C.P. ${purchasedOrder?.shipping_zip_code}`}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={StyleModule.contentSection}>
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
                    onClick={() => console.log("Eliminar")}
                    label="Eliminar"
                />
                <TertiaryActionButtonCustom
                    onClick={handleOnClickEdit}
                    label="Editar"
                    icon={<Pencil />}
                />
                <SecundaryActionButtonCustom
                    onClick={() => console.log("Descargar")}
                    label="Descargar"
                    icon={<Download />}
                />
                <MainActionButtonCustom
                    onClick={() => console.log("Mandar a carga")}
                    label="Mandar a carga"
                    icon={<ShippingIcon />}
                />
            </div>
        </div>
    )
}


export default Step3;
