import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import { useClientDispatch, useClientState } from "../../../../clients/context/clientHooks";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import type { IPartialClient } from "../../../../../interfaces/clients";
import { useMemo, useState } from "react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import StyleModule from "./AddWizardClients.module.css";

interface IAddWizardClients {
    onClose: () => void;
    onCreate: (record: IPartialClient) => (Promise<boolean> | boolean);
}

const AddWizardClients = ({ onClose, onCreate }: IAddWizardClients) => {

    const state = useClientState();
    const dispatch = useClientDispatch();

    const [showWarningModal, setShowWarningModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <UserPen />
        },
        {
            title: "Dirección y datos comerciales",
            content: <Step2 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onCancel={toggleWarningModal} onCreate={onCreate} onClose={onClose} />,
            icon: <FileCheck />
        }
    ], [state, dispatch, toggleWarningModal, onClose, onCreate]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardClients}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar cliente</h1>
                </div>
                <div className={StyleModule.mainContent}>
                    <StepperMantineCustom
                        steps={steps}
                        initialStep={state.current_step}
                        allowNextStepsSelect
                        mainColor="var(--color-theme-primary)"
                    />
                </div>
            </div>
            {showWarningModal && (<WarningModal onClose={toggleWarningModal} onLeave={onClose} />)}
        </FullContainerModal>
    );
};

export default AddWizardClients;
