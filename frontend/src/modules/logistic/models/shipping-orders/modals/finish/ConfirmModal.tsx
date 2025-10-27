import HeaderModal from "./../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import StyleModule from "./FinishedModal.module.css";
import { Divider } from "@mantine/core";
import { DateUtils } from "../../../../../../utils/dayJsUtils";
import InputTextCustom from "../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { useState } from "react";
import StandarTextAreaCustom from "../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import MainActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Check, CircleX } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import type { RootState } from "../../../../../../store/store";
import { useSelector } from "react-redux";
import ToastMantine from "../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialShippingOrder } from "../../../../../../interfaces/shippingOrder";

interface IConfirmModal {
    onClose: () => void;
    shippingOrderRecord: IPartialShippingOrder;
    shippingOrderUpdate: IPartialShippingOrder;
    onUpdate: (shippingOrderRecord: IPartialShippingOrder, shippingOrderUpdate: IPartialShippingOrder) => Promise<void>;
    onFeedBack: () => void;
}

const ConfirmModal = ({ onClose, shippingOrderRecord, shippingOrderUpdate, onUpdate, onFeedBack }: IConfirmModal) => {

    const errorRedux = useSelector((state: RootState) => state.error);
    const [comment, setComment] = useState<string>("");
    const [receivedBy, setReceivedBy] = useState<string>("");

    const handleOnChangeComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleOnClickConfirm = async () => {
        await onUpdate(shippingOrderRecord, shippingOrderUpdate);
        if (Object.keys(errorRedux).length > 0) {
            console.log("entro")
            console.log(errorRedux)
            const errors = Object.entries(errorRedux);
            errors.forEach(([_, value]) => {
                ToastMantine.feedBackForm({
                    message: value,
                });
            });
            return;
        }
        onClose();
        onFeedBack();
    };

    return (
        <HeaderModal
            onClose={onClose}
            title="Finalizar orden"
            className={StyleModule.containerModal}
            classNameCustomContainer={StyleModule.containerContent}
        >
            <div className={`nunito-regular ${StyleModule.containerMain}`}>
                <h2>{`Orden de envío # ${shippingOrderUpdate?.code}`}</h2>
                <Divider orientation="horizontal" color="var(--color-theme-primary)" />
                <p className="nunito-regular">Para finalizar esta orden es necesario llenar la siguiente información.</p>
                <div className={StyleModule.containerFields}>
                    <dl className={StyleModule.containerDescriptionList}>
                        <dt className="nunito-bold">Fecha de finalización</dt>
                        <dd className="nunito-bold">{DateUtils.format(new Date(), "DD/MM/YYYY")}</dd>
                    </dl>
                    <InputTextCustom
                        value={receivedBy}
                        onChange={setReceivedBy}
                        placeholder="Orden recibida por"
                        disabled
                    />
                    <StandarTextAreaCustom
                        value={comment}
                        onChange={handleOnChangeComment}
                        placeholder="Comentario"
                        maxLength={100}
                        disabled
                    />
                </div>
                <div className={StyleModule.containerButtons}>
                    <MainActionButtonCustom
                        onClick={handleOnClickConfirm}
                        label="Confirmar"
                        icon={<Check />}
                    />
                    <TertiaryActionButtonCustom
                        onClick={onClose}
                        label="Cancelar"
                        icon={<CircleX />}
                    />
                </div>
            </div>
        </HeaderModal >
    );
};

export default ConfirmModal;
