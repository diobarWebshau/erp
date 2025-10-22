import { Bookmark, ChevronLeft, CircleCheck, Type } from "lucide-react";
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useShippingOrderCommand, useShippingOrderDispatch, useShippingOrderState } from "../../../../context/shippingOrderHooks";
import { useCallback, useState, type ChangeEvent } from "react";
import { back_step, update_draft_shipping_order } from "../../../../context/shippingOrderActions";
import StyleModule from "./Step2.module.css";
import DateInputMantine from "../../../../../../../../comp/external/mantine/date/input/base/DateInputMantine";
import ObjectSelectCustomMemo from "../../../../../../../../comp/primitives/select/object-select/base/base/ObjectSelectCustom";
import StandardSelectCustomMemo from "../../../../../../../../comp/primitives/select/object-select/base/base/StandardSelectCustom";
import useCarriers from "../../../../../../../../modelos/carriers/hooks/useCarriers";
import type { IPartialCarrier } from "../../../../../../../../interfaces/carriers";
import NumericInputCustomMemo from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import InputTextCustom from "../../../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import StandarTextAreaCustom from "../../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import type { IPartialShippingOrder } from "interfaces/shippingOrder";
import toastMantine from "../../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import FeedBackModal from "../../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import { set_step } from "../../../../context/shippingOrderActions";
import type { RootState } from "store/store";
import { useSelector } from "react-redux";
import WarningModal from "../../../../../../../../comp/primitives/modal2/dialog-modal/custom/warning/WarningModal";

interface IStep2 { onUpdate: (original: IPartialShippingOrder, updated: IPartialShippingOrder) => void }

const transporteOptions = ["Terrestre", "Marítimo", "Aéreo"];
const shippingTypeOptions = ["Internacional", "Nacional"];

const Step2 = ({ onUpdate }: IStep2) => {

    

    const state = useShippingOrderState();
    console.log(`state:`, state);
    const { refetch } = useShippingOrderCommand();
    const errorRedux = useSelector((state: RootState) => state.error);
    const dispatch = useShippingOrderDispatch();

    const [isActiveWarningModal, setIsActiveWarningModal] = useState<boolean>(false);

    const toggleWarningModal = useCallback(() => {
        setIsActiveWarningModal(prev => !prev);
    }, [dispatch]);

    const toggleBackStep = useCallback(() => {
        dispatch(set_step(3));
    }, [dispatch]);

    const onChangeCarrier = useCallback((carrier: IPartialCarrier | null) => {
        dispatch(update_draft_shipping_order({
            carrier: carrier || undefined,
            carrier_id: carrier?.id || undefined
        }));
    }, []);

    const onChangeTransportMethod = useCallback((transportMethod: string | null) => {
        dispatch(update_draft_shipping_order({ transport_method: transportMethod || undefined }));
    }, [dispatch]);

    const onChangeShippingType = useCallback((shippingType: string | null) => {
        dispatch(update_draft_shipping_order({ shipment_type: shippingType || undefined }));
    }, [dispatch]);

    const onChangeCost = useCallback((cost: number) => {
        setCost(cost);
        dispatch(update_draft_shipping_order({ delivery_cost: cost }));
    }, [dispatch]);

    const onChangeCode = useCallback((trackingNumber: string) => {
        dispatch(update_draft_shipping_order({ tracking_number: trackingNumber }));
    }, [dispatch]);

    const onChangeComment = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(update_draft_shipping_order({ comments: e.target.value }));
    }, [dispatch]);

    const onChangeDeliveryDate = useCallback((deliveryDate: Date | null) => {
        dispatch(update_draft_shipping_order({ shipping_date: deliveryDate }));
    }, [dispatch]);


    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);
    const [cost, setCost] = useState<number>(state.draft?.delivery_cost || 0);

    const { carriers } = useCarriers();

    const handlebackMainStep = useCallback(() => {
        refetch();
        dispatch(set_step(3));
    }, [dispatch, refetch]);

    const handleOnClickNextStep = useCallback(async () => {
        // 1) Validaciones de requeridos
        const draft = state.draft;
        if (
            !draft?.carrier ||
            !draft?.shipping_date ||
            !draft?.transport_method ||
            !draft?.shipment_type ||
            cost <= 0 ||
            draft?.delivery_cost == null || draft.delivery_cost === 0 ||
            !draft?.tracking_number
        ) {
            toastMantine.feedBackForm({ message: 'Debes completar todos los campos requeridos.' });
            return;
        }

        // 2) Construir lista coherente de SOPoP
        const selectedIds = new Set(
            (draft.shipping_order_purchase_order_product ?? []).map(x => x.id)
        );

        const shippingOrderPurchaseOrderProduct =
            (draft.shipping_order_purchase_order_product_aux ?? [])
                .filter(x => selectedIds.has(x.id));

        // 3) Payload de actualización
        const updateShippingOrder: IPartialShippingOrder = {
            ...draft,
            shipping_order_purchase_order_product: shippingOrderPurchaseOrderProduct,
        };

        // 4) Esperar la actualización antes de leer errores
        await onUpdate(state.data, updateShippingOrder);

        // 5) Mostrar errores si llegaron; si no, abrir modal
        if (Object.keys(errorRedux).length > 0) {
            Object.values(errorRedux).forEach((msg) => {
                toastMantine.error({ message: String(msg) });
            });
            return;
        }

        setIsActiveFeedBackModal(true);
    }, [
        state.draft,
        state.data,
        cost,
        onUpdate,
        errorRedux,
        toastMantine,
        setIsActiveFeedBackModal,
    ]);

    const handleOnClickPrevious = useCallback(() => dispatch(back_step()), [dispatch]);

    return (
        <div className={StyleModule.container}>
            <h2 className={`nunito-bold ${StyleModule.header}`}>Datos de envío</h2>
            <h3 className={`nunito-bold ${StyleModule.subheader}`}>Envio #V-51236</h3>
            <div className={StyleModule.content}>
                <div className={StyleModule.rowContainer}>
                    <div className={StyleModule.leftContent}>
                        <DateInputMantine
                            onChange={onChangeDeliveryDate}
                            value={state.draft?.shipping_date ? state.draft?.shipping_date : null}
                            positionPopover="bottom-end"
                            classNameInput={StyleModule.inputDateInputMantine}
                        />
                        <ObjectSelectCustomMemo
                            options={carriers || []}
                            value={state.draft?.carrier || null}
                            onChange={onChangeCarrier}
                            defaultLabel="Selecciona un transportista"
                            labelKey={'name'}
                        />
                        <StandardSelectCustomMemo
                            options={transporteOptions}
                            value={state.draft?.transport_method ? state.draft?.transport_method : null}
                            onChange={onChangeTransportMethod}
                            defaultLabel="Selecciona un medio de transporte"
                        />
                    </div>
                    <div className={StyleModule.rightContent}>
                        <StandardSelectCustomMemo
                            options={shippingTypeOptions}
                            value={state.draft?.shipment_type ? state.draft?.shipment_type : null}
                            onChange={onChangeShippingType}
                            defaultLabel="Selecciona un tipo de envío"
                        />
                        <NumericInputCustomMemo
                            onChange={onChangeCost}
                            value={state.draft?.delivery_cost || undefined}
                            placeholder="Costo"
                            min={0}
                        />
                        <InputTextCustom
                            value={state.draft?.tracking_number || undefined}
                            onChange={onChangeCode}
                            placeholder="Numero de guia"
                            icon={<Type />}
                        />
                    </div>
                </div>
                <div className={StyleModule.commentSection}>
                    <span className="nunito-bold">
                        Comentarios
                        <span className="nunito-bold">(Opcional)</span>
                    </span>
                    <StandarTextAreaCustom
                        value={state.draft?.comments || undefined}
                        onChange={onChangeComment}
                        placeholder="Comentarios"
                        maxLength={600}
                    />
                </div>
            </div>
            <div className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={toggleWarningModal}
                    label="Cancelar"
                />
                <TertiaryActionButtonCustom
                    onClick={handleOnClickPrevious}
                    label="Regresar"
                    icon={<ChevronLeft />}
                />
                <MainActionButtonCustom
                    onClick={handleOnClickNextStep}
                    label="Guardar"
                    icon={<Bookmark />}
                />
            </div>
            {
                isActiveFeedBackModal && (
                    <FeedBackModal
                        onClose={handlebackMainStep}
                        icon={<CircleCheck />}
                        title="Actualización exitosa"
                    />
                )
            }
            {
                isActiveWarningModal && (
                    <WarningModal
                        onClose={toggleWarningModal}
                        onLeave={toggleBackStep}
                    />
                )
            }
        </div>
    )
}

export default Step2;