
import { ChevronLeft, Plus } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step2.module.css";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useInventoriesDispatch, useInventoriesState } from "../../../../context/InventoiresHooks";
import { back_step, next_step } from "../../../../context/InvenrtoriesActions";

const Step2 = () => {

    const dispatch = useInventoriesDispatch();
    const state = useInventoriesState();

    const handleOnBackButton = () => {
        dispatch(back_step());
    }
    const handleOnNextButton = () => {
        dispatch(next_step());
    }

    return (
        <div className={StyleModule.containerStep1}>
            <div className={StyleModule.containerHeader}>

                <h2 className={`nunito-semibold ${StyleModule.subtitle}`}>
                    Movimiento 1
                </h2>
                <div className={StyleModule.containerData}>
                    <dl className={StyleModule.definitionList}>
                        <dt>Fecha de inventario:</dt>
                        <dd>{new Date().toLocaleDateString()}</dd>
                    </dl>
                    <dl className={StyleModule.definitionList}>
                        <dt>Encargado:</dt>
                        <dd>{"Roberto Mireles"}</dd>
                    </dl>
                </div>
            </div>
            <div className={StyleModule.mainContent}>
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
                    label="Agregar inventario"
                    onClick={handleOnNextButton}
                    icon={<Plus />}
                />
            </div>
        </div>
    );
}

export default Step2;