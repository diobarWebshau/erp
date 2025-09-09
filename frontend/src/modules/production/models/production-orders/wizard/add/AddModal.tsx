import {
    useState
} from "react";
import {
    ChevronLeft,
} from "lucide-react";
import {
    useAddModalProductionOrderState
} from "./../../context/AddModalProductionOrderHooks";
import FadeButton
    from "../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import WarningIcon
    from "../../../../../../components/icons/WarningIcon";
import StyleModule
    from "./AddModal.module.css";
import type {
    IPartialProductionOrder
} from "../../../../../../interfaces/productionOrder";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import CancelModalCustom from "../../../../../../components/ui/modal/custom-modal/cancel/CancelModalCustom";


interface IAddModalProps {
    onClose: () => void;
    onCreate: (data: IPartialProductionOrder) => void

}

const AddModal = ({
    onClose,
    onCreate,
}: IAddModalProps) => {

    // ? ************ Hooks de contexto ************/

    const state = useAddModalProductionOrderState();

    // ? ************ Estados ************/

    // const [isVisible, setIsVisible] = useState(false);      // Para entrada
    // const [isClosing, setIsClosing] = useState(false);      // Para salida
    const [isActiveCancelProcessModal, setIsActiveCancelProcessModal] =
        useState<boolean>(false);

    // ? ************ Efectos ************/

    // useEffect(() => {
    //     // Dispara la animación de entrada
    //     const timeout = setTimeout(() => setIsVisible(true), 10);
    //     return () => clearTimeout(timeout);
    // }, []);

    // ? ************ Funciones ************/

    // const handleOnClickBack = (
    //     e: MouseEvent<HTMLButtonElement>
    // ) => {
    //     e.preventDefault();
    //     if (state.current_step >= 2) {
    //         // Dispara animación de salida
    //         // setIsClosing(true);
    //         // setIsVisible(false);
    //         // setTimeout(() => {
    //         //     onClose(); // desmonta después de la animación
    //         // }, 400); // coincide con duración del CSS
    //         dispatch(back_step());
    //     } else {
    //         onClose();
    //     }
    // };

    const toggleCancelProcessModal = () => {
        setIsActiveCancelProcessModal(!isActiveCancelProcessModal);
    }

    const handleOnClickCloseAddModal = () => {
        onClose();
    }

    // ? ************ Manejo de animaciones con clases CSS ************/

    // const modalClass =
    //     `${StyleModule.container} ` +
    //     `${isClosing
    //         ? `${StyleModule.slideOutRightExitActive}`
    //         : `${StyleModule.slideInRightEnter} ${isVisible
    //             ? StyleModule.slideInRightEnterActive : ""}`
    //     }`;

    // ? ************ Hooks para el manejo de datos ************/

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={StyleModule.container}
        >
            <header className={StyleModule.headerSection}>
                <section
                    className={
                        `nunito-semibold `
                        + `${StyleModule.headerSectionControl}`
                    }
                >
                    <FadeButton
                        label="Regresar"
                        onClick={toggleCancelProcessModal}
                        icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                        typeOrderIcon="first"
                        classNameButton={StyleModule.backButton}
                        classNameSpan={StyleModule.backButtonSpan}
                        classNameLabel={StyleModule.backButtonLabel}
                    />
                </section>
                <section
                    className={
                        `nunito-bold `
                        + `${StyleModule.headerSectionTitle}`
                    }
                >
                    <h1 id="modal-title">Agregar Orden de Producción</h1>
                </section>
            </header>

            <main className={StyleModule.bodySection}>
                {
                    state.current_step === 1 && (
                        <Step1
                            onCancel={toggleCancelProcessModal}
                        />
                    )
                }
                {
                    state.current_step === 2 && (
                        <Step2 
                            onCancel={toggleCancelProcessModal}
                        />
                    )
                }
                {
                    state.current_step === 3 && (
                        <Step3 
                            onCancel={toggleCancelProcessModal}
                            onBack={onClose}
                            onCreate={onCreate}
                        />
                    )
                }
            </main>
            <footer className={StyleModule.footerSection}></footer>
            {
                isActiveCancelProcessModal && (
                    <CancelModalCustom
                        onClose={toggleCancelProcessModal}
                        icon={<WarningIcon className={StyleModule.iconCancelProcess} />}
                        onClickCancel={handleOnClickCloseAddModal}
                    />
                )
            }
        </div>
    );
};

export default AddModal;