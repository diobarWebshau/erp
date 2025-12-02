
import StepperMantineCustom, { type IStepperStepMantine } from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import { useProductionLineDispatch, useProductionLineState } from "../../../context/productionLineHooks";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import type { IPartialProductionLine } from "../../../../../interfaces/productionLines";
import ProductionLineIcon from "../../../../../comp/icons/ProductionLineIcon";
import { set_step } from "../../../context/productionLineActions";
import { ChevronLeft, CogIcon, FileCheck } from "lucide-react";
import StyleModule from "./AddWizardProductionLine.module.css";
import { useMemo, useState } from "react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";

interface IAddWizardProductionLine {
    onClose: () => void;
    onCreate: (data: IPartialProductionLine) => (Promise<boolean> | boolean);
}

const AddWizardProductionLine = ({ onClose, onCreate }: IAddWizardProductionLine) => {

    const state = useProductionLineState();
    const dispatch = useProductionLineDispatch();

    const [showWarningModal, setShowWarningModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const handleStepClick = useMemo(() => (step: number) => dispatch(set_step(step)), [dispatch]);

    const steps: IStepperStepMantine[] = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <ProductionLineIcon />
        },
        {
            title: "Configuración",
            content: <Step2 state={state} dispatch={dispatch} onCancel={toggleWarningModal} />,
            icon: <CogIcon />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onCancel={toggleWarningModal} onCreate={onCreate} onClose={onClose} />,
            icon: <FileCheck />
        }
    ], [dispatch, state, toggleWarningModal, onCreate, onClose]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardProductionLine}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar línea</h1>
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

export default AddWizardProductionLine;
