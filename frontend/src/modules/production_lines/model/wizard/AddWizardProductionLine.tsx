
import FullContainerModal from "../../../../comp/primitives/modal/full-container/FullContainerModal";
import TransparentButtonCustom from "../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import { Bookmark, ChevronLeft, CogIcon, FileCheck } from "lucide-react";
import WarningModal from "../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import { memo, useMemo, useState } from "react";
import { useProductionLineDispatch, useProductionLineState } from "../../context/productionLineHooks";
import { set_step } from "../../context/productionLineActions";
import StepperMantine, { type IStepperStepMantine } from "../../../../comp/external/mantine/stepper/custom/StepperMantine";
import StyleModule from "./AddWizardProductionLine.module.css";
import ProductionLineIcon from "../../../../comp/icons/ProductionLineIcon";
import CriticalActionButton from "../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";

interface IAddWizardProductionLine {
    onClose: () => void;
}

const Step1 = memo(() => {
    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}></div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={() => { }}
                label="Cancelar"
            />
            <TertiaryActionButtonCustom
                onClick={() => { }}
                label="Guardar y salir"
                icon={<Bookmark />}
            />
            <MainActionButtonCustom
                onClick={() => { }}
                label="Guardar y continuar"
                icon={<Bookmark />}
            />
        </div>
    </div>;
})

const Step2 = memo(() => {
    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}></div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={() => { }}
                label="Cancelar"
            />
            <TertiaryActionButtonCustom
                onClick={() => { }}
                label="Regresar"
                icon={<ChevronLeft />}
            />
            <TertiaryActionButtonCustom
                onClick={() => { }}
                label="Guardar y salir"
                icon={<Bookmark />}
            />
            <MainActionButtonCustom
                onClick={() => { }}
                label="Guardar y continuar"
                icon={<Bookmark />}
            />
        </div>
    </div>;
})

const Step3 = memo(() => {
    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}></div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={() => { }}
                label="Cancelar"
            />
            <TertiaryActionButtonCustom
                onClick={() => { }}
                label="Regresar"
                icon={<ChevronLeft />}
            />
            <TertiaryActionButtonCustom
                onClick={() => { }}
                label="Guardar y salir"
                icon={<Bookmark />}
            />
            <MainActionButtonCustom
                onClick={() => { }}
                label="Guardar y continuar"
                icon={<Bookmark />}
            />
        </div>
    </div>;
})

const steps: IStepperStepMantine[] = [
    {
        title: "Información Básica",
        content: <Step1 />,
        icon: <ProductionLineIcon />

    },
    {
        title: "Información Básica",
        content: <Step2 />,
        icon: <CogIcon />

    },
    {
        title: "Información Básica",
        content: <Step3 />,
        icon: <FileCheck />
    }
];

const AddWizardProductionLine = ({ onClose }: IAddWizardProductionLine) => {

    const state = useProductionLineState();
    const dispatch = useProductionLineDispatch();

    const [showWarningModal, setShowWarningModal] = useState(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const handleStepClick = useMemo(() => (step: number) => dispatch(set_step(step)), []);

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
