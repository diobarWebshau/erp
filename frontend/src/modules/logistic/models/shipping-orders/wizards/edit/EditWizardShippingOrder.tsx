import TransparentButtonCustom from "../../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";
import StyleModule from "./EditWizardShippingOrder.module.css";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import WarningModal from "../../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import { useShippingOrderState } from "../../context/shippingOrderHooks";
import Step1 from "./steps/step1/Step1";
import Step3 from "./steps/step3/Step3";
import Step2 from "./steps/step2/Step2";
import type { IPartialShippingOrder, IShippingOrder } from "interfaces/shippingOrder";

interface IEditWizardShippingOrder {
    onClose: () => void;
    onUpdate: (original: IPartialShippingOrder, updated: IPartialShippingOrder) => void;
    onLoad: (data: IShippingOrder) => void;
}

const EditWizardShippingOrder = ({
    onClose,
    onUpdate,
    onLoad,
}: IEditWizardShippingOrder) => {

    const state = useShippingOrderState();

    const [showWarningModal, setShowWarningModal] = useState(false);

    const toggleWarningModal = () => {
        setShowWarningModal(!showWarningModal);
    }

    return (
        <FullContainerModal>
            <div className={StyleModule.containerEditWizardShippingOrder}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Editar Orden de Envio</h1>

                </div>
                <div className={StyleModule.mainContent}>
                    {state.current_step === 1 && (<Step1 />)}
                    {state.current_step === 2 && (<Step2 onUpdate={onUpdate} />)}
                    {state.current_step === 3 && (<Step3 onLoad={onLoad} />)}
                </div>
            </div>
            {
                showWarningModal && (<WarningModal onClose={toggleWarningModal} onLeave={onClose} />)
            }
        </FullContainerModal>
    );
};

export default EditWizardShippingOrder;