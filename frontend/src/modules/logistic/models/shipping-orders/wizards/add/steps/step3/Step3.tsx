import { ChevronLeft, ChevronRight, Type } from "lucide-react";
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { useCallback, useState } from "react";
import { back_step, next_step, update_shipping_order } from "../../../../context/shippingOrderActions";
import StyleModule from "./Step3.module.css";
import DateInputMantine from "../../../../../../../../comp/external/mantine/date/input/base/DateInputMantine";
import ObjectSelectCustomMemo from "../../../../../../../../comp/primitives/select/object-select/base/base/ObjectSelectCustom";
import StandardSelectCustomMemo from "../../../../../../../../comp/primitives/select/object-select/base/base/StandardSelectCustom";
import useCarriers from "../../../../../../../../modelos/carriers/hooks/useCarriers";
import type { ICarrier, IPartialCarrier } from "../../../../../../../../interfaces/carriers";
import NumericInputCustomMemo from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import InputTextCustom from "../../../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import StandarTextAreaCustom from "../../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import type { IPartialShippingOrder } from "interfaces/shippingOrder";
import toastMantine from "../../../../../../../../comp/external/mantine/toast/base/ToastMantine";

interface IStep3 { onClose: () => void }

const transporteOptions = ["Terrestre", "Marítimo", "Aéreo"];
const shippingTypeOptions = ["Internacional", "Nacional"];

const Step3 = ({ onClose }: IStep3) => {

    const state = useShippingOrderState();
    const dispatch = useShippingOrderDispatch();

    const [deliveryDate, setDeliveryDate] = useState<Date | null>(state.data?.shipping_date || null);
    const [carrier, setCarrier] = useState<IPartialCarrier | null>(state.data?.carrier || null);
    const [transportMethod, setTransportMethod] = useState<string | null>(null);
    const [shippingType, setShippingType] = useState<string | null>(null);
    const [cost, setCost] = useState<number | undefined>(state.data?.delivery_cost || undefined);
    const [code, setCode] = useState<string | undefined>(undefined);
    const [comment, setComment] = useState<string | undefined>(undefined);

    const { carriers } = useCarriers();

    const handleOnClickNextStep = useCallback(() => {
        if (!carrier || !deliveryDate || !transportMethod ||
            !shippingType || cost === undefined ||
            cost === null || cost === 0 || !code) {
            toastMantine.feedBackForm({ message: 'Debes completar todos los campos requeridos.' });
            return;
        }
        const updateShippingOrder: IPartialShippingOrder = {
            carrier: carrier,
            shipping_date: deliveryDate,
            delivery_cost: cost,
            code: code,
            carrier_id: carrier.id
        }
        dispatch(update_shipping_order(updateShippingOrder));
        dispatch(next_step());
    }, [dispatch, shippingType, carrier, deliveryDate, transportMethod, cost, code]);

    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch, back_step]);

    const handleOnChangeComment = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    }, []);
    return (
        <div className={StyleModule.container}>
            <h2 className={`nunito-bold ${StyleModule.header}`}>Datos de envío</h2>
            <h3 className={`nunito-bold ${StyleModule.subheader}`}>Envio #V-51236</h3>
            <div className={StyleModule.content}>
                <div className={StyleModule.rowContainer}>
                    <div className={StyleModule.leftContent}>
                        <DateInputMantine
                            onChange={setDeliveryDate}
                            value={deliveryDate}
                            positionPopover="bottom-end"
                            classNameInput={StyleModule.inputDateInputMantine}
                        />
                        <ObjectSelectCustomMemo
                            options={carriers || []}
                            value={carrier || null}
                            onChange={setCarrier}
                            defaultLabel="Selecciona un transportista"
                            labelKey={'name'}
                        />
                        <StandardSelectCustomMemo
                            options={transporteOptions}
                            value={transportMethod}
                            onChange={setTransportMethod}
                            defaultLabel="Selecciona un medio de transporte"
                        />
                    </div>
                    <div className={StyleModule.rightContent}>
                        <StandardSelectCustomMemo
                            options={shippingTypeOptions}
                            value={shippingType}
                            onChange={setShippingType}
                            defaultLabel="Selecciona un tipo de envío"
                        />
                        <NumericInputCustomMemo
                            onChange={setCost}
                            value={cost}
                            placeholder="Costo"
                            min={1}
                        />
                        <InputTextCustom
                            value={code}
                            onChange={setCode}
                            placeholder="Numero de guia"
                            icon={<Type />}
                        />
                    </div>
                </div>
                <div className={StyleModule.commentSection}>
                    <span className="nunito-bold">Comentarios<span className="nunito-bold">(Opcional)</span></span>
                    <StandarTextAreaCustom
                        value={comment}
                        onChange={handleOnChangeComment}
                        placeholder="Comentarios"
                        maxLength={600}
                    />
                </div>
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
        </div>
    )
}

export default Step3;