import SingleSelectCheckSearchCustom from "./../../../../../../../comp/features/select-check-search/single/custom/SingleSelectCheckSearchCustom"
import CriticalActionButton from "./../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "./../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import FadeButton from "../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import type { IPartialPurchasedOrder } from "../../../../../../../interfaces/purchasedOrder";
import { next_step, update_purchase_order, back_step } from "../../context/modalAddActions";
import type { IPartialClientAddress } from "../../../../../../../interfaces/clientAddress";
import { useModalAddDispatch, useModalAddState } from "../../context/modalAddHooks";
import { useCallback, useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import styleModule from "./Step2.module.css"

interface Step2Props {
    onClose: () => void;
}

const Step2 = ({ onClose }: Step2Props) => {

    // ? ************ Hooks para el contexto ************/
    const dispatch = useModalAddDispatch();
    const state = useModalAddState();

    // ? ************ Estados ************/
    const [selectedAddress, setSelectedAddress] = useState<IPartialClientAddress | null>(
        state.data.client?.addresses?.find(
            (address) => address.id === state.data.client_address_id) as (IPartialClientAddress | null)
    );

    const getRowAttr = useMemo(() => (row: IPartialClientAddress) => row?.neighborhood ?? "", []);

    // ? ************ Funciones ************/

    const handleOnClickNextStep = useCallback(() => {
        if (!selectedAddress) return;
        const purchasedOrder: IPartialPurchasedOrder = {
            client_address_id: Number(selectedAddress.id),
            shipping_street: selectedAddress.street,
            shipping_street_number: selectedAddress.street_number ?? undefined,
            shipping_neighborhood: selectedAddress.neighborhood,
            shipping_city: selectedAddress.city,
            shipping_state: selectedAddress.state,
            shipping_country: selectedAddress.country,
            shipping_zip_code: selectedAddress.zip_code ?? undefined,
            client_address: selectedAddress
        }
        dispatch(update_purchase_order(purchasedOrder));
        dispatch(next_step());
    }, [dispatch, selectedAddress])

    const handleOnClickBack = useCallback(() => {
        dispatch((back_step()));
    }, [dispatch])

    // ? ************ Efectos ************/

    return (
        <div className={styleModule.container}>
            <section className={styleModule.headerSection}>
                <h2 className={`nunito-bold`}>Dirección</h2>
                <FadeButton
                    label="Dirección nueva"
                    type="button"
                    typeOrderIcon="first"
                    icon={<Plus className={styleModule.newAddressIcon} />}
                    onClick={() => console.log("Dirección nueva")}
                    classNameButton={styleModule.newAddressButton}
                    classNameLabel={styleModule.newAddressLabel}
                    classNameSpan={styleModule.newAddressSpan}
                />
            </section>
            <div className={styleModule.formSection}>
                <div className={styleModule.formSection}>
                    <div className={styleModule.bodySection}>
                        <SingleSelectCheckSearchCustom
                            options={state.data?.client?.addresses || ([] as IPartialClientAddress[])}
                            rowId={getRowAttr}
                            selected={selectedAddress}
                            setSelected={setSelectedAddress}
                            emptyMessage={"No hay clientes por mostrar"}
                            maxHeight="300px"
                        />
                    </div>
                    <div className={styleModule.footerSection}>
                        <CriticalActionButton
                            label="Cancelar"
                            onClick={onClose}
                        />
                        <CriticalActionButton
                            label="Regresar"
                            onClick={handleOnClickBack}
                        />
                        <MainActionButtonCustom
                            onClick={handleOnClickNextStep}
                            label="Siguiente"
                            icon={<ChevronRight />}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step2;