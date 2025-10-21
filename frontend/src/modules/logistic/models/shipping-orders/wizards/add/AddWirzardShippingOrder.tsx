import { useState } from "react";
import type { IPartialShippingOrder } from "../../../../../../interfaces/shippingOrder";
import { useShippingOrderState } from "../../context/shippingOrderHooks";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";
import StyleModule from "./AddWizardShippingOrder.module.css";
import TransparentButtonCustom from "../../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import { ChevronLeft } from "lucide-react";
import Step3 from "./steps/step3/Step3";
import Step2 from "./steps/step2/Step2";
import Step1 from "./steps/step1/Step1";
import Step4 from "./steps/step4/Step4";
import WarningModal from "../../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";

interface IAddWizardShippingOrder {
    onCreate: (shippingOrder: IPartialShippingOrder) => void;
    onClose: () => void;
}

const AddWizardShippingOrder = ({
    onCreate,
    onClose,
}: IAddWizardShippingOrder) => {

    // * Hooks
    const state = useShippingOrderState();

    // * States
    const [showWarningModal, setShowWarningModal] = useState(false);

    // * Functions ui

    const toggleWarningModal = () => {
        setShowWarningModal(!showWarningModal);
    }

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardShippingOrder}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar Orden de Envio</h1>
                </div>
                <div className={StyleModule.mainContent}>
                    {
                        state.current_step === 1 && (
                            <Step1 onClose={toggleWarningModal} />
                        )
                    }
                    {
                        state.current_step === 2 && (
                            <Step2 onClose={toggleWarningModal} />
                        )
                    }
                    {
                        state.current_step === 3 && (
                            <Step3 onClose={toggleWarningModal} />
                        )
                    }
                    {
                        state.current_step === 4 && (
                            <Step4 onClose={toggleWarningModal} onLeave={onClose} onCreate={onCreate} />
                        )
                    }
                </div>
            </div>
            {
                showWarningModal && (
                    <WarningModal onClose={toggleWarningModal} onLeave={onClose} />
                )
            }
        </FullContainerModal>
    )
}

export default AddWizardShippingOrder;
