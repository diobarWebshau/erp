
import { ChevronRight, CircleX } from "lucide-react";
import FadeButton from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import StyleModule from "./Step2.module.css";

const Step2 = () => {
    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h1>Step 2</h1>
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

export default Step2;
