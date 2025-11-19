import { FileCheck, MapPinned, UserPen } from "lucide-react";
import { useItemDispatch, useItemState } from "../../../context/itemHooks";
import StyleModule from "./AddWizardProduct.module.css"
import { useMemo } from "react";

const AddWizardProduct = () => {

    const state = useItemState();
    const dispatch = useItemDispatch();

    const steps = useMemo(() => [
        {
            title: "Información Básica",
            content: <div>Step1</div>,
            icon: <UserPen />
        },
        {
            title: "Configuración",
            content: <div>Step2</div>,
            icon: <MapPinned />
        },
        {
            title: "Resumen y finalización",
            content: <div>Step3</div>,
            icon: <FileCheck />
        }
    ], [state, dispatch]);


    return (
        <div className={StyleModule.containerAddWizardProduct}>
            <div className={StyleModule.headerSection}></div>
            <div className={StyleModule.mainContent}></div>
        </div>
    );
};

export default AddWizardProduct;
