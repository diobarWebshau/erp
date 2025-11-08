import { useClientCommand, useClientDispatch, useClientState } from "../../../../clients/context/clientHooks";
import StyleModule from "./EditWizardClients.module.css";
import { useMemo, useState } from "react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import type { IPartialClient } from "../../../../../interfaces/clients";
import DiscardModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/discard/DiscardModal";
import { set_step } from "../../../context/clientActions";

interface IEditWizardClients {
    onClose: () => void;
    onUpdate: ({ original, updated }: { original: IPartialClient, updated: IPartialClient }) => Promise<void>;
}

const EditWizardClients = ({ onClose, onUpdate }: IEditWizardClients) => {

    const state = useClientState();
    const dispatch = useClientDispatch();
    const { refetch } = useClientCommand();
    
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isActiveDiscardModal, setIsActiveDiscardModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const toggleDiscardModal = useMemo(() => () => setIsActiveDiscardModal(prev => !prev), []);

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onDiscard={toggleDiscardModal} />,
            icon: <UserPen />
        },
        {
            title: "Dirección y datos comerciales",
            content: <Step2 state={state} dispatch={dispatch} onDiscard={toggleDiscardModal} onUpdate={onUpdate} refetch={refetch} />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onClose={onClose} />,
            icon: <FileCheck />
        }
    ], [state, dispatch, toggleWarningModal, toggleDiscardModal, onClose, onUpdate, refetch]);

    const handleDiscard = useMemo(() => () => {
        dispatch(set_step(2));
        toggleDiscardModal();
    }, [dispatch, toggleDiscardModal]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerEditWizardClients}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Editar cliente</h1>
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
            {isActiveDiscardModal && (
                <DiscardModal
                    onClose={toggleDiscardModal} onDiscard={handleDiscard}
                    title="¿Estas seguro de descartar los cambios?"
                />
            )}
        </FullContainerModal>
    );
};

export default EditWizardClients;
