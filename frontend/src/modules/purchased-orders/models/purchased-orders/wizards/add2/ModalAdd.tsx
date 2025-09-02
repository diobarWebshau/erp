import type {
    MouseEvent,
} from "react";
import {
    useEffect,
    useState
} from "react";
import {
    ChevronLeft,
    CircleX, X
} from "lucide-react";
import FadeButton
    from "../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import StyleModule
    from "./ModalAdd.module.css";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import {
    useModalAddDispatch,
    useModalAddState
} from "./context/modalAddHooks"
import {
    back_step,
    update_purchase_order,
} from "./context/modalAddActions"
import useClientAddresses
    from "../../hooks/client-addresses/useClientAddresses";
import CustomModal
    from "../../../../../../components/ui/modal/customModal/CustomModal";
import WarningIcon
    from "../../../../../../components/icons/WarningIcon";
import type { IPartialPurchasedOrder } from "../../../../../../interfaces/purchasedOrder";

interface IModalAdd {
    onClose: () => void;
    onEdit: () => void;
    onCreate: (data: IPartialPurchasedOrder) => void
}

const ModalAdd = ({
    onClose,
    onCreate,
    onEdit
}: IModalAdd) => {

    // ? ************ Hooks de contexto ************/

    const state = useModalAddState();
    const dispatch = useModalAddDispatch();

    // ? ************ Estados ************/

    const [isVisible, setIsVisible] = useState(false);      // Para entrada
    const [isClosing, setIsClosing] = useState(false);      // Para salida
    const [isActiveCancelProcessModal, setIsActiveCancelProcessModal] =
        useState<boolean>(false);

    // ? ************ Efectos ************/

    useEffect(() => {
        // Dispara la animación de entrada
        const timeout = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timeout);
    }, []);

    // ? ************ Funciones ************/

    const handleOnClickBack = (
        e: MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        if (state.current_step < 2) {
            // Dispara animación de salida
            setIsClosing(true);
            setIsVisible(false);
            setTimeout(() => {
                onClose(); // desmonta después de la animación
            }, 400); // coincide con duración del CSS
        } else {
            dispatch(update_purchase_order({ client_id: 1 }))
            dispatch(back_step());
        }
    };

    const toggleCancelProcessModal = () => {
        setIsActiveCancelProcessModal(!isActiveCancelProcessModal);
    }

    // ? ************ Manejo de animaciones con clases CSS ************/

    const modalClass =
        `${StyleModule.container} ` +
        `${isClosing
            ? `${StyleModule.slideOutRightExitActive}`
            : `${StyleModule.slideInRightEnter} ${isVisible
                ? StyleModule.slideInRightEnterActive : ""}`
        }`;


    // ? ************ Hooks para el manejo de datos ************/


    const {
        addresses,
        loadingAddresses,
        refetchAddresses
    } = useClientAddresses(state?.data.client_id || null);

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
                        onClick={handleOnClickBack}
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
                    <h1 id="modal-title">Agregar Venta</h1>
                </section>
            </header>

            <main className={StyleModule.bodySection}>
                {
                    state.current_step === 1 &&
                    <Step1
                        onClose={onClose}
                    />
                }
                {
                    state.current_step === 2 &&
                    <Step2
                        onClose={toggleCancelProcessModal}
                    />
                }
                {
                    state.current_step === 3 &&
                    <Step3
                        onClose={toggleCancelProcessModal}
                        onCloseAddModal={onClose}
                        addresses={addresses}
                        loadingAddresses={loadingAddresses}
                        refetchAddresses={refetchAddresses}
                        onCreate={onCreate}
                        onEdit={onEdit}
                    />
                }
            </main>
            <footer className={StyleModule.footerSection}></footer>
            {
                isActiveCancelProcessModal && (
                    <CustomModal
                        onClose={toggleCancelProcessModal}
                        title="¿Seguro que deseas salir?"
                        message="El avance de este proceso no se guardara."
                        icon={<WarningIcon className={StyleModule.iconCancelProcess} />}
                        children={
                            () => {
                                return (
                                    <div className={StyleModule.containerChildrenCancelProcess}>
                                        <FadeButton
                                            label="Cancelar"
                                            type="button"
                                            typeOrderIcon="first"
                                            classNameButton={StyleModule.cancelProcessButton}
                                            classNameLabel={StyleModule.cancelProcessButtonLabel}
                                            classNameSpan={StyleModule.cancelProcessButtonSpan}
                                            icon={<CircleX className={StyleModule.cancelProcessButtonIcon} />}
                                            onClick={toggleCancelProcessModal}
                                        />
                                        <FadeButton
                                            label="Salir"
                                            type="button"
                                            typeOrderIcon="first"
                                            classNameButton={StyleModule.exitProcessButton}
                                            classNameLabel={StyleModule.exitProcessButtonLabel}
                                            classNameSpan={StyleModule.exitProcessButtonSpan}
                                            icon={<X className={StyleModule.exitProcessButtonIcon} />}
                                            onClick={onClose}
                                        />
                                    </div>
                                );
                            }
                        }
                    />
                )
            }
        </div>
    );
};

export default ModalAdd;