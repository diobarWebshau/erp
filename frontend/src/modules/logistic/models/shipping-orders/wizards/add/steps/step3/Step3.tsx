import { ChevronLeft, ChevronRight } from "lucide-react";
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { useCallback, useState } from "react";
import { back_step, next_step } from "../../../../context/shippingOrderActions";
import StyleModule from "./Step3.module.css";
import DateInputMantine from "../../../../../../../../comp/external/mantine/date/input/base/DateInputMantine";
import ObjectSelectMemo from "../../../../../../../../comp/primitives/select/object-select/base/base/ObjectSelect";
import useCarriers from "../../../../../../../../modelos/carriers/hooks/useCarriers";
import type { ICarrier } from "../../../../../../../../interfaces/carriers";

interface IStep3 {
    onClose: () => void;
}

const Step3 = ({
    onClose
}: IStep3) => {

    const state = useShippingOrderState();
    const dispatch = useShippingOrderDispatch();

    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
    const [carrier, setCarrier] = useState<ICarrier | null | undefined>(null);

    const {
        carriers,
        loadingCarriers,
    } = useCarriers();

    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch, back_step]);
    const handleOnClickNextStep = useCallback(() => dispatch(next_step()), [dispatch, next_step]);

    return (
        <div className={StyleModule.container}>
            <h2 className={`nunito-bold ${StyleModule.header}`}>Datos de envío</h2>
            <h3 className={`nunito-bold ${StyleModule.subheader}`}>Envio #V-51236</h3>
            <div className={StyleModule.content}>
                <div className={StyleModule.leftContent}>
                    <DateInputMantine
                        onChange={setDeliveryDate}
                        value={deliveryDate}
                    />
                    <ObjectSelectMemo
                        options={carriers || []}
                        value={carrier || null}
                        onChange={setCarrier}
                        defaultLabel="Selecciona un transportista"
                        labelKey={'name'}
                    />

                </div>
                <div className={StyleModule.rightContent}>
                    <DateInputMantine
                        onChange={setDeliveryDate}
                        value={deliveryDate}
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