import { ChevronLeft } from "lucide-react";
import FullContainerModal from "../../../../../../comp/primitives/modal/full-container/FullContainerModal";
import TransparentButtonCustom from "../../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./AddInventoryModal.module.css";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import { useInventoriesState } from "./../../context/InventoiresHooks";

interface IAddInventoryModal {
    onClose: () => void;
}

const AddInventoryModal = ({
    onClose
}: IAddInventoryModal) => {
    const state = useInventoriesState();
    return (
        <FullContainerModal>
            <div className={StyleModule.containerAddInventoryModal}>
                <div className={StyleModule.headerSection}>
                    <TransparentButtonCustom
                        onClick={onClose}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        label="Regresar"
                    />
                    <h1 className={`nunito-bold ${StyleModule.title}`}>Agregar Inventario</h1>
                </div>
                <div className={StyleModule.mainContent}>
                    {
                        state.current_step === 1 && (
                            <Step1 />
                        )
                    }
                    {
                        state.current_step === 2 && (
                            <Step2 />
                        )
                    }
                    {
                        state.current_step === 3 && (
                            <Step3 />
                        )
                    }
                </div>
            </div>
        </FullContainerModal>
    );
}

export default AddInventoryModal;
