
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step4.module.css";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useCallback } from "react";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { back_step, next_step } from "../../../../context/shippingOrderActions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateUtils } from "../../../../../../../../utils/dayJsUtils";
import toastMantine from "../../../../../../../../comp/external/mantine/toast/base/ToastMantine";

interface IStep4 { onClose: () => void }

const Step4 = ({ onClose }: IStep4) => {

    const dispatch = useShippingOrderDispatch();
    const state = useShippingOrderState();

    const purchasedOrder = [...state.data?.shipping_order_purchase_order_product || []].shift()?.purchase_order_products?.purchase_order;
    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch, back_step]);
    const handleOnClickNextStep = useCallback(() => dispatch(next_step()), [dispatch, next_step]);

    const toast = ()=>{
        toastMantine.success({ message: 'Cambios guardados' });
        toastMantine.feedBackForm({ message: 'No se pudo guardar' });
        toastMantine.error({ message: 'No se pudo guardar' });
    }
    return (
        <div className={StyleModule.container}>
            <h2 className={`nunito-bold ${StyleModule.header}`}>Datos de envío</h2>
            <div className={StyleModule.subHeader}>
                <div className={StyleModule.leftContent}>
                    <h3 className={`nunito-semibold ${StyleModule.subTitle}`}>Remitente</h3>
                    <div className={StyleModule.subContent}>
                        <div className={StyleModule.subContentItem}>
                            <span className={`nunito-bold ${StyleModule.boldText}`}>Empresa de Mexicali</span>
                            <span>contacto@empresamexicali.com</span>
                            <span>tel. 6861167495</span>
                            <span>Mexicali, B.C, México</span>
                            <span>San Luis Río Colorado, B.C, México</span>
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
            <div className={StyleModule.contentSection}></div>
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
                    onClick={toast}
                    label="Siguiente"
                    icon={<ChevronRight />}
                />
            </div>
        </div>
    )
}


export default Step4;
