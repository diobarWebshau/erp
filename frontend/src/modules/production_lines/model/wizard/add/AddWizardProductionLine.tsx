
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import { ChevronLeft, CogIcon, FileCheck } from "lucide-react";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import { useMemo, useState } from "react";
import { set_step } from "../../../context/productionLineActions";
import { useProductionLineDispatch, useProductionLineState } from "../../../context/productionLineHooks";
import StepperMantine, { type IStepperStepMantine } from "../../../../../comp/external/mantine/stepper/custom/StepperMantine";
import ProductionLineIcon from "../../../../../comp/icons/ProductionLineIcon";
import StyleModule from "./AddWizardProductionLine.module.css";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";

interface IAddWizardProductionLine {
    onClose: () => void;
}

const AddWizardProductionLine = ({ onClose }: IAddWizardProductionLine) => {

    const state = useProductionLineState();
    const dispatch = useProductionLineDispatch();

    const [showWarningModal, setShowWarningModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const handleStepClick = useMemo(() => (step: number) => dispatch(set_step(step)), []);

    const steps: IStepperStepMantine[] = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 onClose={onClose} state={state} dispatch={dispatch} />,
            icon: <ProductionLineIcon />
        },
        {
            title: "Configuración",
            content: <Step2 onClose={onClose} state={state} dispatch={dispatch} />,
            icon: <CogIcon />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 />,
            icon: <FileCheck />
        }
    ], [dispatch, state]);

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
                    <StepperMantine
                        steps={steps}
                        initialStep={state.current_step}
                        onStepClick={handleStepClick}
                        allowNextStepsSelect
                        classNames={{
                            root: StyleModule.root,
                            content: StyleModule.content,
                        }}
                    />
                </div>
            </div>
            {showWarningModal && (<WarningModal onClose={toggleWarningModal} onLeave={onClose} />)}
        </FullContainerModal>
    );
};

export default AddWizardProductionLine;
