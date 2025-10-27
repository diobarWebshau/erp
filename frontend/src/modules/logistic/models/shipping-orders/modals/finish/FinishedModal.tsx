import HeaderModal from "./../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import StyleModule from "./FinishedModal.module.css";
import type { IPartialShippingOrder, IShippingOrder } from "./../../../../../../interfaces/shippingOrder";
import { Divider } from "@mantine/core";
import { DateUtils } from "../../../../../../utils/dayJsUtils";
import InputTextCustom from "../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { useState } from "react";
import StandarTextAreaCustom from "../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import MainActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Check, CircleX } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import ToastMantine from "../../../../../../comp/external/mantine/toast/base/ToastMantine";


interface IFinishedModal {
    onClose: () => void;
    shippingOrderRecord: IPartialShippingOrder;
    onConfirm: (shippingOrderUpdate: IShippingOrder) => void;
}

const FinishedModal = ({ onClose, shippingOrderRecord, onConfirm }: IFinishedModal) => {

    const [receivedBy, setReceivedBy] = useState<string>("");
    const [comment, setComment] = useState<string>("");

    const handleOnChangeComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleOnClickFinish = () => {
        if (receivedBy === "") {
            ToastMantine.feedBackForm({
                message: "Debe ingresar el nombre de la persona que recibió la orden.",
            });
        }
        onConfirm({
            ...shippingOrderRecord,
            status: "finished",
            received_by: receivedBy,
            ...(comment !== "" ? { comment: comment } : {})
        } as IShippingOrder);
    }

    return (
        <HeaderModal
            onClose={onClose}
            title="Finalizar orden"
            className={StyleModule.containerModal}
            classNameCustomContainer={StyleModule.containerContent}
        >
            <div className={`nunito-regular ${StyleModule.containerMain}`}>
                <h2>{`Orden de envío # ${shippingOrderRecord?.code}`}</h2>
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
                    />
                    <StandarTextAreaCustom
                        value={comment}
                        onChange={handleOnChangeComment}
                        placeholder="Comentario"
                        maxLength={100}
                    />
                </div>
                <div className={StyleModule.containerButtons}>
                    <MainActionButtonCustom
                        onClick={handleOnClickFinish}
                        label="Finalizar"
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

export default FinishedModal;
