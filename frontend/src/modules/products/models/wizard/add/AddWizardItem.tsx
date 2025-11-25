import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import { useItemDispatch, useItemState } from "../../../context/itemHooks";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import type { IPartialItem } from "interfaces/item";
import { useMemo, useState } from "react";
import StyleModule from "./AddWizardItem.module.css"
import Step1 from "./steps/step1/Step1"
import Step2 from "./steps/step2/Step2"
import Step3 from "./steps/step3/Step3"

interface IAddWizardItems {
    onClose: () => void,
    onCreate: (record: IPartialItem) => Promise<void>
}

const AddWizardProduct = ({ onClose, onCreate }: IAddWizardItems) => {

    const state = useItemState();
    const dispatch = useItemDispatch();

    const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);


    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <UserPen />
        },
        {
            title: "Configuración",
            content: <Step2 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <FileCheck />
        }
    ], [state, dispatch, toggleWarningModal]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardItem}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar Producto</h1>

                </div>
                <div className={StyleModule.mainContent}>
                    <StepperMantineCustom
                        steps={steps}
                        initialStep={state.current_step}
                        allowNextStepsSelect
                        mainColor="var(--color-theme-primary)"
                    />
                </div>
                {showWarningModal && (<WarningModal onClose={toggleWarningModal} onLeave={onClose} />)}
            </div>
        </FullContainerModal>
    );
};

export default AddWizardProduct;
