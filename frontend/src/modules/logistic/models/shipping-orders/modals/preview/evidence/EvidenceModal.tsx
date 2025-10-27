
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import ShippingIcon from "../../../../../../../comp/icons/ShippingIcon";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import CheckBoxObjectListAutoSizeCustom from "../../../../../../../comp/primitives/checkbox/list-checkbox-auto-size-object/custom/CheckBoxObjectListAutoSizeCustom";
import ImageLoader from "../../../../../../../comp/primitives/image-loader/custom/ImageLoaderCustom";
import { DateUtils } from "../../../../../../../utils/dayJsUtils";
import type { IShippingOrderPurchasedOrderProduct } from "interfaces/shippingPurchasedProduct";
import type { IPartialShippingOrder, LoadEvidenceItem } from "interfaces/shippingOrder";
import DialogModal from "../../../../../../../comp/primitives/modal2/dialog-modal/base/DialogModal";
import base64ToFileOrNull from "../../../../../../../scripts/convertBase64ToFile";
import StyleModule from "./EvidenceModal.module.css";
import { useMemo, useState } from "react";
import clsx from "clsx";

interface ILoadModal { onClose: () => void, record: IPartialShippingOrder }

const LoadModal = ({ onClose, record }: ILoadModal) => {

    const sopops = useMemo(() =>
        (record?.shipping_order_purchase_order_product as IShippingOrderPurchasedOrderProduct[] | undefined) ?? [],
        [record?.shipping_order_purchase_order_product]
    );

    const [selected, setSelected] = useState<IShippingOrderPurchasedOrderProduct[]>([]);
    const [evidence, setEvidence] = useState<File[]>(() => {
        if (!record?.load_evidence) return [];
        const evidence = record.load_evidence as LoadEvidenceItem[];
        const files = evidence
            .map((item) => {
                const file = base64ToFileOrNull(item.path, item.id);
                return file;
            })
            .filter((file): file is File => file !== null);
        return files;
    });

    return (
        <DialogModal onClose={onClose} className={StyleModule.containerDialogModal}>
            <div className={StyleModule.containerModal}>
                <div className={StyleModule.contentModal}>
                    <div className={StyleModule.headerSection}>
                        <div className={StyleModule.titleSection}>
                            <h2>{`Enviar Orden: ${record.code}`}</h2>
                            <div className={clsx(`nunito-bold`, StyleModule.dateSection)}>
                                <dl className={StyleModule.dataList}>
                                    <dt>Fecha de envío:</dt>
                                    <dd>{DateUtils.format(record?.shipping_date, "DD/MM/YYYY")}</dd>
                                </dl>
                                <dl className={StyleModule.dataList}>
                                    <dt>Hora de envío:</dt>
                                    <dd>{DateUtils.formatTime12h(record?.shipping_date, { includeSeconds: false })}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className={clsx(`nunito-bold`, StyleModule.responsibleSection)}>
                            <dl className={StyleModule.dataList}>
                                <dt>Responsable:</dt>
                                <dd>{record?.user_name}</dd>
                            </dl>
                        </div>
                    </div>
                    <div className={StyleModule.confirmSection}>
                        <p className={"nunito-semibold"}>Antes de continuar, verifica que estén listos todos los productos para subir a la unidad</p>
                        <CheckBoxObjectListAutoSizeCustom
                            value={selected}
                            options={sopops}
                            onChange={(selected) => setSelected(selected)}
                            renderLabel={(item) =>
                                `${String(item.purchase_order_products?.purchase_order?.order_code)} - ` +
                                `${String(item.purchase_order_products?.product?.name)} - ` +
                                `${String(item.qty)} piezas`
                            }
                            valueKey="id"
                            labelKey="id"
                            classNameOption={StyleModule.optionCheckBoxObjectListAutoSize}
                            classNameSelectedOption={StyleModule.optionCheckBoxObjectListAutoSize}
                            classNameContainer={StyleModule.containerCheckBoxObjectListAutoSize}
                            isEditable={false}
                        />
                    </div>
                    <div className={StyleModule.imageSection}>
                        <p className={"nunito-semibold"}>Evidencia. Fotografias sugeridas: Producto en el transporte, etiquetado, transporte cerrado.</p>
                        <ImageLoader
                            value={evidence}
                            typeLoader="multiple"
                            onChange={(files) => setEvidence(files)}
                            isEditable={false}
                        />
                    </div>
                    <div className={StyleModule.footerSection}>
                        <CriticalActionButton
                            label="Cerrar"
                            onClick={onClose}
                        />
                        <MainActionButtonCustom
                            label="Download"
                            icon={<ShippingIcon />}
                            onClick={()=>{console.log("descargar")}}
                        />
                    </div>
                </div>
            </div>
        </DialogModal>
    )
}

export default LoadModal;
