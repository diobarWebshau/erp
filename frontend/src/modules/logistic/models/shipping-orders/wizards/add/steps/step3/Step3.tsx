import { ChevronLeft, ChevronRight } from "lucide-react";
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { useCallback } from "react";
import { back_step, next_step } from "../../../../context/shippingOrderActions";
import StyleModule from "./Step3.module.css";

interface IStep3 {
    onClose: () => void;
}

const Step3 = ({
    onClose
}: IStep3) => {

    const state = useShippingOrderState();
    const dispatch = useShippingOrderDispatch();

    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch, back_step]);
    const handleOnClickNextStep = useCallback(() => dispatch(next_step()), [dispatch, next_step]);

    console.log("state", state);
    return (
        <div>
            <h1>Step 3</h1>
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