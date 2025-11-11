import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import UnderlineLabelInputPhone from "../../../../../../../comp/primitives/input/layouts/underline-label/phone/UnderlineLabelInputPhone";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import UnderlineLabelInputMail from "../../../../../../../comp/primitives/input/layouts/underline-label/mail/UnderlineLabelInputMail";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import { validateCompanyName } from "../../../../../../../modelos/clients/queries/clientsQueries";
import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { update_client } from "../../../../../context/clientActions";
import { next_step } from "../../../../../context/clientActions";
import { useCallback, useState, type Dispatch } from "react";
import StyleModule from "./Step1.module.css";
import { Bookmark } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "store/store";
import FloatingLabelInput from "../../../../../../../comp/primitives/input/layouts/floating-label/FloatingLabelInput";

interface IStep1 {
    state: ClientState;
    dispatch: Dispatch<ClientAction>;
    onCancel: () => void;
}

const Step1 = ({
    state,
    dispatch,
    onCancel
}: IStep1) => {

    const dispatchRedux = useDispatch<AppDispatchRedux>();

    const [company_name, setCompanyName] = useState<string>(state.data?.company_name ?? "");
    const [cfdi, setCfdi] = useState<string>(state.data?.cfdi ?? "");
    const [phone, setPhone] = useState<string>(state.data?.phone ?? "");
    const [email, setEmail] = useState<string>(state.data?.email ?? "");
    const [taxId, setTaxId] = useState<string>(state.data?.tax_id ?? "");

    const handleOnClickNext = useCallback(() => {
        if (company_name === "" || phone === "" || email === "" || cfdi === "" || taxId === "") {
            ToastMantine.feedBackForm({
                message: "Debe completar todos los campos",
            });
            return;
        }
        dispatch(update_client({
            company_name: company_name,
            cfdi: cfdi,
            phone: phone,
            email: email,
            tax_id: taxId
        }));
        dispatch(next_step());
    }, [dispatch, company_name, cfdi, phone, email, taxId]);

    const validateCompanyNameAsync = useCallback(async () => {
        const isValid = await validateCompanyName(company_name, dispatchRedux);
        return isValid;
    }, [company_name, dispatchRedux, validateCompanyName]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <UnderlineLabelInputText
                    value={company_name}
                    onChange={setCompanyName}
                    label="Nombre"
                    withValidation
                    isValidAsync={validateCompanyNameAsync}
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
                    label="CURP"
                    withValidation
                />
                <FloatingLabelInput
                    value={cfdi}
                    onChange={setCfdi}
                    label="CURP"
                />
                <FloatingLabelInput
                    value={cfdi}
                    onChange={setCfdi}
                    label="CURP"
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
                        withValidation
                        label="Correo electrónico"
                    />
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
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
