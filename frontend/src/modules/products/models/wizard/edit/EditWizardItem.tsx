import TransparentButtonCustom from "../../../../../comp/primitives/button/custom-button/transparent/TransparentButtonCustom";
import StepperMantineCustom from "../../../../../comp/external/mantine/stepper/custom/StepperMantineCustom";
import WarningModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import FullContainerModal from "../../../../../comp/primitives/modal/full-container/FullContainerModal";
import DiscardModal from "../../../../../comp/primitives/modal2/dialog-modal/custom/discard/DiscardModal";
import { useItemCommand, useItemDispatch, useItemState } from "../../../context/itemHooks";
import { ChevronLeft, FileCheck, MapPinned, UserPen } from "lucide-react";
import type { IPartialProduct } from "../../../../../interfaces/product";
import type { IPartialItem } from "../../../../../interfaces/item";
import { set_step } from "../../../context/itemActions";
import StyleModule from "./EditWizardItem.module.css"
import { useMemo, useState } from "react";
import Step1 from "./steps/step1/Step1"
import Step2 from "./steps/step2/Step2"
import Step3 from "./steps/step3/Step3"

interface IEditWizardItems {
    onClose: () => void,
    onUpdate: ({ original, update }: { original: IPartialItem, update: IPartialProduct }) => Promise<boolean>
}

const EditWizardProduct = ({ onClose, onUpdate }: IEditWizardItems) => {

    const state = useItemState();
    const dispatch = useItemDispatch();
    const { refetch } = useItemCommand();

    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
    const toggleWarningModal = useMemo(() => () => setShowWarningModal(prev => !prev), []);
    const toggleDiscardModal = useMemo(() => () => setShowDiscardModal(prev => !prev), []);

    const handleDiscard = useMemo(() => () => {
        dispatch(set_step(2));
        toggleDiscardModal();
    }, [dispatch, toggleDiscardModal]);

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <Step1 state={state} dispatch={dispatch} onCancel={toggleDiscardModal} />,
            icon: <UserPen />
        },
        {
            title: "Configuración",
            content: <Step2 state={state} dispatch={dispatch} onCancel={toggleDiscardModal} onUpdate={onUpdate} onRefetch={refetch} />,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <Step3 state={state} dispatch={dispatch} onClose={onClose} />,
            icon: <FileCheck />
        }
    ], [state, dispatch, toggleDiscardModal, onClose, onUpdate, refetch]);

    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddWizardItem}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Editar Producto</h1>

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
};

export default EditWizardProduct;
