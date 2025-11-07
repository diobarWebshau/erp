import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { useCallback, useState, type Dispatch } from "react";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Bookmark, MailIcon, Phone, Text } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import InputTextCustom from "../../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { update_draft_client } from "../../../../../context/clientActions";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import StyleModule from "./Step1.module.css";
import { next_step } from "../../../../../context/clientActions";

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

    const [company_name, setCompanyName] = useState<string>(state.draft?.company_name ?? "");
    const [cfdi, setCfdi] = useState<string>(state.draft?.cfdi ?? "");
    const [phone, setPhone] = useState<string>(state.draft?.phone ?? "");
    const [email, setEmail] = useState<string>(state.draft?.email ?? "");
    const [taxId, setTaxId] = useState<string>(state.draft?.tax_id ?? "");

    const handleOnClickNext = useCallback(() => {
        if (company_name === "" || phone === "" || email === "" || cfdi === "" || taxId === "") {
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
                <InputTextCustom
                    value={company_name}
                    onChange={setCompanyName}
                    icon={<Text />}
                    placeholder="Nombre"
                    classNameInput={StyleModule.inputTextCustom}
                    classNameContainer={StyleModule.containerInputText}
                    withValidation
                />
                <InputTextCustom
                    value={taxId}
                    onChange={setTaxId}
                    icon={<Text />}
                    placeholder="RFC"
                    classNameInput={StyleModule.inputTextCustom}
                    classNameContainer={StyleModule.containerInputText}
                    withValidation
                />
                <InputTextCustom
                    value={cfdi}
                    onChange={setCfdi}
                    icon={<Text />}
                    placeholder="Cfdi"
                    classNameInput={StyleModule.inputTextCustom}
                    classNameContainer={StyleModule.containerInputText}
                    withValidation
                />
                <span className={`nunito-bold ${StyleModule.subTitle}`}>Contacto principal</span>
                <div className={StyleModule.blockContact}>
                    <InputTextCustom
                        value={phone}
                        onChange={setPhone}
                        icon={<Phone />}
                        placeholder="Teléfono"
                        classNameInput={StyleModule.inputTextCustom}
                        classNameContainer={StyleModule.containerInputText}
                        withValidation
                    />
                    <InputTextCustom
                        value={email}
                        onChange={setEmail}
                        icon={<MailIcon />}
                        placeholder="Correo electrónico"
                        classNameInput={StyleModule.inputTextCustom}
                        classNameContainer={StyleModule.containerInputText}
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
