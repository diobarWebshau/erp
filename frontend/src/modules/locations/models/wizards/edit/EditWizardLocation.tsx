import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import DiscardModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/discard/DiscardModal";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import { useLocationCommand, useLocationDispatch, useLocationState } from "../../context/locationHooks";
import type { IPartialLocation } from "../../../../../interfaces/locations";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import { set_step } from "../../context/locationActions";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import { useMemo, useState } from "react";
import StyleModule from "./AddWizardLocation,.module.css";


interface IEditWizardLocationProps {
    onClose: () => void,
    onUpdate: ({ original, update }: { original: IPartialLocation, update: IPartialLocation }) => (Promise<boolean> | boolean)
}

const EditWizardLocaton = ({ onClose, onUpdate }: IEditWizardLocationProps) => {

    // ********* Hooks *********

    const state = useLocationState();
    const dispatch = useLocationDispatch();
    const { refetch } = useLocationCommand();


    // ********* States *********

    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const toggleDiscardModal = useMemo(() => () => setShowDiscardModal(prev => !prev), []);

    const handleDiscard = useMemo(() => () => {
        dispatch(set_step(2));
        toggleDiscardModal();
    }, [dispatch, toggleDiscardModal]);

    // ********* Steps *********

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <UserPen />
        },
        {
            title: "Configuración",
            content: <Step2 state={state} dispatch={dispatch} onCancel={toggleWarningModal} onUpdate={onUpdate} onRefetch={refetch} />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onClose={onClose} />,
            icon: <FileCheck />
        }
    ], [state, dispatch, toggleWarningModal, onClose, onUpdate, refetch]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardLocation}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Editar ubicación</h1>
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
            {showDiscardModal && (
                <DiscardModal
                    onClose={toggleDiscardModal} onDiscard={handleDiscard}
                    title="¿Estas seguro de descartar los cambios?"
                />
            )}
        </FullContainerModal>
    );
}

export default EditWizardLocaton;
