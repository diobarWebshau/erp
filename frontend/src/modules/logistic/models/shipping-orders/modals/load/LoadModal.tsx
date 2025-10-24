
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
import type { IPartialShippingOrder } from "interfaces/shippingOrder";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";
import TransparentButtonCustom from "../../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import { ChevronLeft, CircleCheck } from "lucide-react";
import WarningModal from "../../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import toastMantine from "../../../../../../comp/external/mantine/toast/base/ToastMantine";
import { useSelector } from "react-redux";
import type { RootState } from "store/store";
import FeedBackModal from "../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import useShippingOrderDetailById from "../../../../../../modelos/shipping_orders/hooks/useShippingOrderDetailById";

interface ILoadModal {
    onClose: () => void;
    shippingOrder: IPartialShippingOrder;
    onUpdate: (record: IPartialShippingOrder, shippingOrderDetail: IPartialShippingOrder) => void;
}

const LoadModal = ({ onClose, shippingOrder, onUpdate }: ILoadModal) => {

    const { shippingOrderDetailById } = useShippingOrderDetailById(shippingOrder.id ?? null);

    const errorRedux = useSelector((state: RootState) => state.error);

    const sopops = useMemo(() =>
        (shippingOrderDetailById?.shipping_order_purchase_order_product as IShippingOrderPurchasedOrderProduct[] | undefined) ?? [],
        [shippingOrderDetailById?.shipping_order_purchase_order_product]
    );

    const [selected, setSelected] = useState<IShippingOrderPurchasedOrderProduct[]>([]);
    const [isActiveWarningModal, setIsActiveWarningModal] = useState(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState(false);
    const [evidence, setEvidence] = useState<File[]>([]);

    const toggleIsActiveWarningModal = () => {
        setIsActiveWarningModal(prev => !prev);
    };

    const handleOnClickLoad = () => {
        if (!shippingOrderDetailById) return;
        if (selected.length !== sopops.length) {
            toastMantine.feedBackForm({
                message: "Necesitas seleccionar todos los productos",
            });
            return;
        }
        if (!(evidence.length > 0)) {
            toastMantine.feedBackForm({
                message: "Necesitas agregar evidencia",
            });
            return;
        }

        const updateRecord: IPartialShippingOrder = {
            ...shippingOrderDetailById,
            load_evidence: evidence,
        }
        onUpdate(updateRecord, shippingOrderDetailById);
        if (Object.keys(errorRedux).length > 0) {
            Object.entries(errorRedux).forEach(([_, value]) => {
                toastMantine.error({
                    message: value,
                });
            });
            return;
        }
        setIsActiveFeedBackModal(true);
    }

    return (
        <FullContainerModal>
            <div className={StyleModule.containerModal}>
                <div className={StyleModule.headerModal}>
                    <div>
                        <TransparentButtonCustom
                            label="Regresar"
                            onClick={toggleIsActiveWarningModal}
                            icon={<ChevronLeft />}
                        />
                    </div>
                    <h1>Mandar a carga</h1>
                </div>
                <div className={StyleModule.contentModal}>
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
                        <CheckBoxObjectListAutoSizeCustom
                            value={selected}
                            options={sopops}
                            onChange={(selected) => setSelected(selected)}
                            renderLabel={(item) =>
                                `${String(item.purchase_order_products?.purchase_order?.order_code)} -` +
                                `${String(item.purchase_order_products?.product?.name)} - ` +
                                `${String(item.qty)} piezas`
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
                            value={evidence}
                            typeLoader="multiple"
                            onChange={(files) => setEvidence(files)}
                        />
                    </div>
                    <div className={StyleModule.footerSection}>
                        <CriticalActionButton
                            label="Cancelar"
                            onClick={toggleIsActiveWarningModal}
                        />
                        <MainActionButtonCustom
                            label="Siguiente"
                            icon={<ShippingIcon />}
                            onClick={handleOnClickLoad}
                        />
                    </div>
                </div>
                {
                    isActiveWarningModal && (
                        <WarningModal
                            onClose={toggleIsActiveWarningModal}
                            onLeave={onClose}
                        />
                    )
                }
            </div>
            {
                isActiveFeedBackModal && (
                    <FeedBackModal
                        onClose={onClose}
                        icon={<CircleCheck />}
                        title="Tu orden de envío se ha registrado correctamente"
                        message="Tu evidencia de carga ha sido registrada con éxito. Todos los puntos del checklist fueron marcados como cumplidos y las fotografías han sido guardadas correctamente."
                    />
                )
            }
        </FullContainerModal>
    )
}

export default LoadModal;
