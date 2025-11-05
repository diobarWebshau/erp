import { useClientDispatch, useClientState } from "../../../../clients/context/clientHooks";
import type { IPartialClient } from "../../../../../interfaces/clients";
import StyleModule from "./AddWizardClients.module.css";
import { useMemo, useState } from "react";
import { set_step } from "../../../../clients/context/clientActions";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";

interface IAddWizardClients {
    onClose: () => void;
    onCreate: ({ original, updated }: { original: IPartialClient, updated: IPartialClient }) => Promise<void>;
}

const AddWizardClients = ({ onClose, onCreate }: IAddWizardClients) => {

    const state = useClientState();
    const dispatch = useClientDispatch();

    const [showWarningModal, setShowWarningModal] = useState(false);

    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const handleStepClick = useMemo(() => (step: number) => dispatch(set_step(step)), []);

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <UserPen />
        },
        {
            title: "Dirección y datos comerciales",
            content: <Step2  state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 />,
            icon: <FileCheck />
        }
    ], []);

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
                        onStepClick={handleStepClick}
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
