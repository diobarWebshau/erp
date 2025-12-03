import usePurchasedOrderById from "../../../../../modelos/purchased_orders/hooks/usePurchasedOrderById";
import type { IPartialPurchasedOrder } from "../../../../../interfaces/purchasedOrder";
import { useModalEditDispatch, useModalEditState } from "./context/modalEditHooks";
import { set_purchase_order } from "./context/modalEditActions";
import StyleModule from "./EditModal.module.css";
import { useCallback, useEffect, useRef } from "react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import Step3 from "./steps/step3/Step3";
import Step4 from "./steps/step4/Step4";

interface IEditModal {
    record: IPartialPurchasedOrder;
    onClose: () => void;
    onEdit: (({ original, update }: { original: IPartialPurchasedOrder; update: IPartialPurchasedOrder }) => Promise<boolean>),
    onDelete: () => void;
}

const EditModal = ({ record, onClose, onEdit, onDelete }: IEditModal) => {

    const dispatch = useModalEditDispatch();
    const state = useModalEditState();
    const isDataLoaded = useRef(false);

    const { purchasedOrderById, loadingPurchasedOrderById, refetchPurchasedOrderById } = usePurchasedOrderById(record.id as number);

    useEffect(() => {
        if (purchasedOrderById) {
            dispatch(set_purchase_order(structuredClone(purchasedOrderById)));
            isDataLoaded.current = true;
        }
    }, [purchasedOrderById, dispatch]);

    const handleEdit = useCallback((updateRecord: IPartialPurchasedOrder) => {
        if (!purchasedOrderById) return;
        const processedPurchaseOrder = structuredClone(purchasedOrderById);
        onEdit({ original: processedPurchaseOrder, update: updateRecord });
    }, [onEdit, purchasedOrderById]);

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
                        `nunito-bold `
                        + `${StyleModule.headerSectionTitle}`
                    }
                >
                    <h1 id="modal-title">Orden de venta</h1>
                </section>
            </header>

            <main className={StyleModule.bodySection}>
                {
                    state.current_step === 1
                    && !loadingPurchasedOrderById
                    && isDataLoaded.current &&
                    <Step1 />
                }
                {
                    state.current_step === 2
                    && !loadingPurchasedOrderById
                    && isDataLoaded.current &&
                    <Step2 />
                }
                {
                    state.current_step === 3
                    && !loadingPurchasedOrderById
                    && isDataLoaded.current &&
                    <Step3
                        onEdit={handleEdit}
                        refetch={refetchPurchasedOrderById}
                    />
                }
                {
                    state.current_step === 4
                    && !loadingPurchasedOrderById
                    && isDataLoaded.current &&
                    <Step4
                        onCloseAddModal={onClose}
                        onDelete={onDelete}
                    />
                }
            </main>
            <footer className={StyleModule.footerSection}></footer>
        </div>
    )
}

export default EditModal;