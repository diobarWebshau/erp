import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { Bookmark, ChevronLeft } from "lucide-react";
import { memo } from "react";
import StyleModule from "./Step3.module.css"

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

export default Step3;