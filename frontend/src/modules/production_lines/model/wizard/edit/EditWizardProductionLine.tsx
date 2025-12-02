import { useProductionLineCommand, useProductionLineDispatch, useProductionLineState } from "../../../../production_lines/context/productionLineHooks";
import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import type { IStepperStepMantine } from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import DiscardModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/discard/DiscardModal";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import type { IPartialProductionLine } from "../../../../../interfaces/productionLines";
import { set_step } from "../../../../production_lines/context/productionLineActions";
import ProductionLineIcon from "../../../../../comp/icons/ProductionLineIcon";
import { CogIcon, FileCheck, ChevronLeft } from "lucide-react";
import StyleModule from "./EditWizardProductionLine.module.css";
import { useMemo, useState } from "react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";

interface IEditWizardProductionLine {
    onClose: () => void;
    onUpdate: ({ original, update }: { original: IPartialProductionLine, update: IPartialProductionLine }) => (Promise<boolean> | boolean);
}

const EditWizardProductionLine = ({ onClose, onUpdate }: IEditWizardProductionLine) => {

    const state = useProductionLineState();
    const dispatch = useProductionLineDispatch();
    const { refetch } = useProductionLineCommand();
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isActiveDiscardModal, setIsActiveDiscardModal] = useState(false);

    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const toggleDiscardModal = useMemo(() => () => setIsActiveDiscardModal(prev => !prev), []);
    const handleStepClick = useMemo(() => (step: number) => dispatch(set_step(step)), [dispatch]);

    const handleDiscard = useMemo(() => () => {
        dispatch(set_step(2));
        toggleDiscardModal();
    }, [dispatch, toggleDiscardModal]);

    const steps: IStepperStepMantine[] = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleDiscardModal} />,
            icon: <ProductionLineIcon />
        },
        {
            title: "Configuración",
            content: <Step2 state={state} dispatch={dispatch} onCancel={toggleDiscardModal} onUpdate={onUpdate} onRefetch={refetch} />,
            icon: <CogIcon />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onClose={onClose} />,
            icon: <FileCheck />
        }
    ], [dispatch, state, toggleDiscardModal, onClose, onUpdate, refetch]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerEditWizardProductionLine}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Editar línea</h1>
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
            {isActiveDiscardModal && (
                <DiscardModal
                    onClose={toggleDiscardModal} onDiscard={handleDiscard}
                    title="¿Estas seguro de descartar los cambios?"
                />
            )}
        </FullContainerModal>
    );
};

export default EditWizardProductionLine;
