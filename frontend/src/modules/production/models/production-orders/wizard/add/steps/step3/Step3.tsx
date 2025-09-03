
import { ChevronLeft, ChevronRight, CircleX } from "lucide-react";
import FadeButton from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import StyleModule from "./Step3.module.css";
import { useAddModalProductionOrderDispatch, useAddModalProductionOrderState } from "../../../../context/AddModalProductionOrderHooks";
import { back_step } from "../../../../context/AddModalProductionOrderActions";

const Step3 = () => {

    const dispatch = useAddModalProductionOrderDispatch();
    const state = useAddModalProductionOrderState();


    const handlerOnClickButtonBack = () => {
        dispatch(back_step());
    }
    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h1 className='nunito-semibold'>Order 123</h1>
                <span className={StyleModule.containerDate}>
                    <p className='nunito-semibold'>Fecha de orden: </p>
                    <p className='nunito-semibold'>{new Date().toLocaleDateString()}</p>
                </span>
            </section>
            <section className={StyleModule.bodySection}>

            </section>
            <section className={StyleModule.footerSection}>
                <FadeButton
                    label="Cancelar"
                    onClick={() => { }}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.cancelButton}
                    classNameLabel={StyleModule.cancelButtonLabel}
                    classNameSpan={StyleModule.cancelButtonSpan}
                    icon={<CircleX className={StyleModule.cancelButtonIcon} />}
                />

                <FadeButton
                    label="Regresar"
                    onClick={handlerOnClickButtonBack}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.backButton}
                    classNameLabel={StyleModule.backButtonLabel}
                    classNameSpan={StyleModule.backButtonSpan}
                    icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                />
                <FadeButton
                    label="Siguiente"
                    onClick={() => { }}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.nextButton}
                    classNameLabel={StyleModule.nextButtonLabel}
                    classNameSpan={StyleModule.nextButtonSpan}
                    icon={<ChevronRight className={StyleModule.nextButtonIcon} />}
                />
            </section>
        </div>
    );
};

export default Step3;
