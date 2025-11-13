import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import { useLocationDispatch, useLocationState } from "../../context/locationHooks";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import StyleModule from "./AddWizardLocation,.module.css";
import { useMemo, useState } from "react";


interface IAddWizardLocationProps {
    onClose: () => void,
}

const AddWizardLocaton = ({ onClose }: IAddWizardLocationProps) => {

    // ********* Hooks *********

    const state = useLocationState();
    const dispatch = useLocationDispatch();
    // const command = useLocationCommand();

    // ********* States *********

    const [showWarningModal, setShowWarningModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);

    // ********* Steps *********

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <UserPen />
        },
        {
            title: "Configuración",
            content: <Step2 />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 />,
            icon: <FileCheck />
        }
    ], [state, dispatch, toggleWarningModal]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardLocation}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar ubicación</h1>
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
}

export default AddWizardLocaton;
