import { ChevronLeft } from "lucide-react";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";
import TransparentButtonCustom from "../../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./AddInventoryModal.module.css";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import { useInventoriesState } from "./../../context/InventoiresHooks";
import { useState } from "react";
import WarningModal from "../../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";
import type { IPartialInventoryDetails } from "../../../../../../interfaces/inventories";

interface IAddInventoryModal {
    onCreate: (inventory: IPartialInventoryDetails[]) => void;
    onClose: () => void;
}

const AddInventoryModal = ({
    onClose,
    onCreate
}: IAddInventoryModal) => {
    const state = useInventoriesState();
    const [showWarningModal, setShowWarningModal] = useState(false);

    const toggleWarningModal = () => {
        setShowWarningModal(!showWarningModal);
    }
    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddInventoryModal}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={toggleWarningModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar Inventario</h1>
                </div>
                <div className={StyleModule.mainContent}>
                    {
                        state.current_step === 1 && (
                            <Step1
                                onCancel={toggleWarningModal}
                            />
                        )
                    }
                    {
                        state.current_step === 2 && (
                            <Step2 
                                onCancel={toggleWarningModal}
                            />
                        )
                    }
                    {
                        state.current_step === 3 && (
                            <Step3 
                                onLeave={onClose}
                                onCancel={toggleWarningModal}
                                onCreate={onCreate}
                            />  
                        )
                    }
                </div>
            </div>
            {
                showWarningModal && (
                    <WarningModal
                        onClose={toggleWarningModal}
                        onLeave={onClose}
                    />
                )
            }
        </FullContainerModal>
    );
}

export default AddInventoryModal;
