
import CriticalActionButton from "../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import ShippingIcon from "../../../../../../comp/icons/ShippingIcon";
import MainActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import StyleModule from "./LoadModal.module.css";
import clsx from "clsx";
import CheckBoxObjectListAutoSizeCustom from "../../../../../../comp/primitives/checkbox/list-checkbox-auto-size-object/custom/CheckBoxObjectListAutoSizeCustom";
import { useMemo, useState } from "react";
import ImageLoader from "../../../../../../comp/primitives/image-loader/custom/ImageLoaderCustom";
import { DateUtils } from "../../../../../../utils/dayJsUtils";
import type { IShippingOrderPurchasedOrderProduct } from "interfaces/shippingPurchasedProduct";
import type { IShippingOrder } from "interfaces/shippingOrder";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";

const LoadModal = ({
    onClose,
    shippingOrder
}: {
    onClose: () => void;
    shippingOrder: IShippingOrder;
}) => {

    const sopops = useMemo(() =>
        (shippingOrder.shipping_order_purchase_order_product as IShippingOrderPurchasedOrderProduct[] | undefined) ?? [],
        [shippingOrder.shipping_order_purchase_order_product]
    );

    const [selected, setSelected] = useState<IShippingOrderPurchasedOrderProduct[]>([]);

    return (
        <FullContainerModal
        >
            <div className={StyleModule.container}>
                <div className={StyleModule.headerSection}>
                    <div className={StyleModule.titleSection}>
                        <h2>{`Enviar Orden: ${shippingOrder.code}`}</h2>
                        <div className={clsx(`nunito-bold`, StyleModule.dateSection)}>
                            <dl className={StyleModule.dataList}>
                                <dt>Fecha de envío:</dt>
                                <dd>{DateUtils.format(new Date(), "DD/MM/YYYY")}</dd>
                            </dl>
                            <dl className={StyleModule.dataList}>
                                <dt>Hora de envío:</dt>
                                <dd>{DateUtils.formatTime12h(new Date(), { includeSeconds: false })}</dd>
                            </dl>
                        </div>
                    </div>
                    <div className={clsx(`nunito-bold`, StyleModule.responsibleSection)}>
                        <dl className={StyleModule.dataList}>
                            <dt>Responsable:</dt>
                            <dd>{"Roberto Mireles"}</dd>
                        </dl>
                    </div>
                </div>
                <div className={StyleModule.confirmSection}>
                    <p className={"nunito-semibold"}>Antes de continuar, verifica que estén listos todos los productos para subir a la unidad</p>
                    <CheckBoxObjectListAutoSizeCustom<IShippingOrderPurchasedOrderProduct>
                        value={selected}
                        options={sopops}
                        onChange={(selected) => setSelected(selected)}
                        renderLabel={(item) =>
                            item.purchase_order_products?.product?.name?.toString() ??
                            `${String(item.purchase_order_products?.purchase_order?.order_code ?? "")} - ${item.purchase_order_products?.product?.name}`
                        }
                        valueKey="id"
                        labelKey="id"
                        classNameOption={StyleModule.optionCheckBoxObjectListAutoSize}
                        classNameSelectedOption={StyleModule.optionCheckBoxObjectListAutoSize}
                        classNameContainer={StyleModule.containerCheckBoxObjectListAutoSize}
                    />
                </div>
                <div className={StyleModule.imageSection}>
                    <p className={"nunito-semibold"}>Evidencia. Fotografias sugeridas: Producto en el transporte, etiquetado, transporte cerrado.</p>
                    <ImageLoader
                        value={[]}
                        typeLoader="multiple"
                        onChange={(files) => console.log(files)}
                    />
                </div>
                <div className={StyleModule.footerSection}>
                    <CriticalActionButton
                        label="Cancelar"
                        onClick={onClose}
                    />
                    <MainActionButtonCustom
                        label="Siguiente"
                        icon={<ShippingIcon />}
                        onClick={() => console.log("siguiente")}
                    />
                </div>
            </div>
        </FullContainerModal>
    )
}

export default LoadModal;
