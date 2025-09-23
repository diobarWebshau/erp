
import { ChevronLeft, Plus } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step3.module.css";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useInventoriesDispatch, useInventoriesState } from "../../../../context/InventoiresHooks";
import { back_step, } from "../../../../context/InvenrtoriesActions";

const Step3 = () => {

    const dispatch = useInventoriesDispatch();
    const state = useInventoriesState();

    const handleOnBackButton = () => {
        dispatch(back_step());
    }

    return (
        <div className={StyleModule.containerStep1}>
            <div className={StyleModule.mainContent}>
                <span className={`nunito-semibold ${StyleModule.subtitle}`}>
                    Movimiento 2
                </span>
            </div>
            <div className={StyleModule.footerContent}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={() => { }}
                />
                <TertiaryActionButtonCustom
                    label="Regresar"
                    icon={<ChevronLeft />}
                    onClick={handleOnBackButton}
                />
                <MainActionButtonCustom
                    label="Confirmar inventario"
                    onClick={() => { }}
                    icon={<Plus />}
                />
            </div>
        </div>
    );
}

export default Step3;