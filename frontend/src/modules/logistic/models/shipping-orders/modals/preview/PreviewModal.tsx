
import StyleModule from "./PreviewModal.module.css";
import TertiaryActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import MainActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useCallback, useMemo, useState } from "react";
import { DateUtils } from "../../../../../../utils/dayJsUtils";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialShippingOrderPurchasedOrderProduct } from "interfaces/shippingPurchasedProduct";
import GenericTableMemo from "../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { IShippingOrder } from "interfaces/shippingOrder";
import useShippingOrderDetailById from "../../../../../../modelos/shipping_orders/hooks/useShippingOrderDetailById";
import { ChevronLeft, Download } from "lucide-react";
import { Loader } from "@mantine/core";
import ShippingIcon from "../../../../../../comp/icons/ShippingIcon";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";
import TransparentButtonCustom from "../../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import EvidenceModal from "./../preview/evidence/EvidenceModal"
import Tag from "../../../../../../comp/primitives/tag/Tag";
import clsx from "clsx";

interface IPreviewModal {
    onClose: () => void,
    record: IShippingOrder
}

const PreviewModal = ({ onClose, record }: IPreviewModal) => {

    const {
        shippingOrderDetailById,
        loadingShippingOrderDetailById
    } = useShippingOrderDetailById(record.id);

    const [isActiveEvidenceModal, setIsActiveEvidenceModal] = useState<boolean>(false);

    const toggleIsActiveEvidenceModal = useCallback(() => {
        setIsActiveEvidenceModal((prev) => !prev);
    }, []);

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
            const purchaseOrderProduct = [...shippingOrderDetailById?.shipping_order_purchase_order_product || []].shift();
            const purchasedOrder = purchaseOrderProduct?.purchase_order_products?.purchase_order;
            const location = purchaseOrderProduct?.location;
            return { purchasedOrder, location };
        };
        return getValues();
    }, [shippingOrderDetailById?.shipping_order_purchase_order_product]);


    const tagStatusClassName = useMemo(() => {
        return clsx(StyleModule[shippingOrderDetailById?.status?.toLowerCase() || ""])
    }, [shippingOrderDetailById?.status]);

    const processStatus = useMemo(() => {
        const status = shippingOrderDetailById?.status?.toLowerCase() || "";
        return status === "released" ? "Pendiente" : status === "shipping" ? "Enviado" : "Finalizado";
    }, [shippingOrderDetailById?.status]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerModal}>
                <div className={StyleModule.headerModal}>
                    <div>
                        <TransparentButtonCustom
                            label="Regresar"
                            onClick={onClose}
                            icon={<ChevronLeft />}
                        />
                    </div>
                    <h1 className="nunito-bold">Orden de envío</h1>
                </div>
                <div className={StyleModule.containerContent}>
                    {loadingShippingOrderDetailById ?
                        <div className={StyleModule.containerLoading}>
                            <Loader size="md" type="oval" color="var(--color-theme-primary)" />
                        </div>
                        : (
                            <div className={StyleModule.contentSection}>
                                <div className={StyleModule.headerContent}>
                                    <h2 className="nunito-bold">Envío {shippingOrderDetailById?.code}</h2>
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
                                                    <dd>{DateUtils.format(record.shipping_date, "DD/MM/YYYY")}</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Tipo de envío:</dt>
                                                    <dd>Nacional</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Transportista:</dt>
                                                    <dd>{shippingOrderDetailById?.carrier?.name}</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Medio de transporte:</dt>
                                                    <dd>{shippingOrderDetailById?.transport_method}</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Tipo de envío:</dt>
                                                    <dd>{shippingOrderDetailById?.shipment_type}</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Costos:</dt>
                                                    <dd>{shippingOrderDetailById?.delivery_cost}</dd>
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
                                                {
                                                    record.delivery_date && (
                                                        <dl>
                                                            <dt className={`nunito-bold ${StyleModule.boldPrimary}`}>Entrega estimada:</dt>
                                                            <dd>{DateUtils.format(record.delivery_date, "DD/MM/YYYY")}</dd>
                                                        </dl>
                                                    )
                                                }
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
                                        data={shippingOrderDetailById?.shipping_order_purchase_order_product || []}
                                        classNameGenericTableContainer={StyleModule.tableContainer}
                                    />
                                </div>
                                <div className={StyleModule.footerSection}>
                                    <TertiaryActionButtonCustom
                                        onClick={() => { console.log(record) }}
                                        label="Descargar"
                                        icon={<Download />}
                                    />
                                    <MainActionButtonCustom
                                        onClick={toggleIsActiveEvidenceModal}
                                        label="Ver cargamento"
                                        icon={<ShippingIcon />}
                                    />
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            {
                isActiveEvidenceModal && (
                    <EvidenceModal
                        onClose={toggleIsActiveEvidenceModal}
                        record={record}

                    />
                )
            }
        </FullContainerModal>
    )
}


export default PreviewModal;
