import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import UnderlineLabelInputPhone from "../../../../../../../comp/primitives/input/layouts/underline-label/phone/UnderlineLabelInputPhone";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import UnderlineLabelInputMail from "../../../../../../../comp/primitives/input/layouts/underline-label/mail/UnderlineLabelInputMail";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { update_draft_client } from "../../../../../context/clientActions";
import { next_step } from "../../../../../context/clientActions";
import { useCallback, useState, type Dispatch } from "react";
import StyleModule from "./Step1.module.css";
import { Bookmark } from "lucide-react";

interface IStep1 {
    state: ClientState;
    dispatch: Dispatch<ClientAction>;
    onDiscard: () => void;
}

const Step1 = ({
    state,
    dispatch,
    onDiscard
}: IStep1) => {

    const [company_name, setCompanyName] = useState<string | null>(state.draft?.company_name ?? null);
    const [cfdi, setCfdi] = useState<string | null>(state.draft?.cfdi ?? null);
    const [phone, setPhone] = useState<string | null>(state.draft?.phone ?? null);
    const [email, setEmail] = useState<string | null>(state.draft?.email ?? null);
    const [taxId, setTaxId] = useState<string | null>(state.draft?.tax_id ?? null);

    const handleOnClickNext = useCallback(() => {
        if (
            company_name === "" || company_name === null ||
            phone === "" || phone === null ||
            email === "" || email === null ||
            cfdi === "" || cfdi === null ||
            taxId === "" || taxId === null
        ) {
            ToastMantine.feedBackForm({
                message: "Debe completar todos los campos",
            });
            return;
        }
        dispatch(update_draft_client({
            company_name: company_name,
            cfdi: cfdi,
            phone: phone,
            email: email,
            tax_id: taxId
        }));
        dispatch(next_step());
    }, [dispatch, company_name, cfdi, phone, email, taxId]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>

                <UnderlineLabelInputText
                    value={company_name}
                    onChange={setCompanyName}
                    label="Nombre"
                    withValidation
                />
                <UnderlineLabelInputText
                    value={taxId}
                    onChange={setTaxId}
                    label="RFC"
                    withValidation
                />
                <UnderlineLabelInputText
                    value={cfdi}
                    onChange={setCfdi}
                    label="Cfdi"
                    withValidation
                />
                <span className={`nunito-bold ${StyleModule.subTitle}`}>Contacto principal</span>
                <div className={StyleModule.blockContact}>
                    <UnderlineLabelInputPhone
                        value={phone}
                        onChange={setPhone}
                        label="Teléfono"
                        withValidation
                    />
                    <UnderlineLabelInputMail
                        value={email}
                        onChange={setEmail}
                        label="Correo electrónico"
                        withValidation
                    />
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onDiscard}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
                    onClick={handleOnClickNext}
                    icon={<Bookmark />}
                />
            </div>
        </div>
    );
};

export default Step1;
