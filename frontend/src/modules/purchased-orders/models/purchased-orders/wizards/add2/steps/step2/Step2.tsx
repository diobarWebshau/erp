import {
    useEffect, useState,
    type FormEvent, type MouseEvent
} from "react";
import type {
    IClientAddress
} from "../../../../../../../../interfaces/clientAddress";
import styleModule from "./Step2.module.css"
import {
    useModalAddDispatch, useModalAddState
} from "../../context/modalAddHooks";
import FadeButton
    from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import {
    ChevronLeft, ChevronRight,
    CircleX, Plus, Search
} from "lucide-react";
import type {
    IPartialPurchasedOrder
} from "../../../../../../../../interfaces/purchasedOrder";
import {
    next_step, update_purchase_order, back_step
} from "../../context/modalAddActions";
import SingleSelectSearchCheck
    from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheck";

interface Step2Props {
    onClose: () => void;
}

const Step2 = ({
    onClose,
}: Step2Props) => {

    // ? ************ Hooks para el contexto ************/
    const dispatch = useModalAddDispatch();
    const state = useModalAddState();

    // ? ************ Estados ************/
    const [selectedAddress, setSelectedAddress] =
        useState<IClientAddress | null>(
            state.data.client?.addresses?.find(
                (address) =>
                    address.id === state.data.client_address_id
            ) as IClientAddress
            || null
        );
    const [addresses, setAddresses] = useState<IClientAddress[]>(
        state.data.client?.addresses as IClientAddress[] ?? []
    );

    const [validation, setValidation] =
        useState<string | null>(null);

    const [searchSingle, setSearchSingle] = useState("");
    const [openSingle, setOpenSingle] = useState(false);

    // ? ************ Funciones ************/


    const handleOnClickNextStep = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedAddress) {
            setValidation("Por favor, selecciona una direccion");
            return;
        } else {
            if (state.current_step + 1 < state.total_steps + 1 &&
                selectedAddress
            ) {
                const purchasedOrder: IPartialPurchasedOrder = {
                    client_address_id: selectedAddress.id,
                    shipping_address: selectedAddress.address,
                    shipping_city: selectedAddress.city,
                    shipping_state: selectedAddress.state,
                    shipping_country: selectedAddress.country,
                    shipping_zip_code: selectedAddress.zip_code,
                    client_address: selectedAddress
                }
                dispatch(update_purchase_order(purchasedOrder));
                dispatch(next_step());
            }
        }
    }

    // const fetchAddressesLike = async (query: string): Promise<IClientAddress[]> => {
    //     if (!query || query.trim().length === 0) {
    //         return [];
    //     }

    //     const encodedQuery = encodeURIComponent(query);
    //     try {
    //         const response =
    //             await fetch(`http://localhost:3003/clients/client-addresses/filter/${encodedQuery}/${state.data.client_id}`);

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         // El backend responde directamente con un array de clientes
    //         const clients: IClientAddress[] = await response.json();

    //         return clients;

    //     } catch (error) {
    //         console.error("Error fetching clients:", error);
    //         return [];
    //     }
    // };



    const handleOnClickBack = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch((back_step()));
    }

    // ? ************ Efectos ************/
    useEffect(() => {
        if (selectedAddress) {
            setValidation(null);
        }
    }, [selectedAddress]);

    // useEffect(() => {
    //     if (state.data.client_id) {
    //         refetchAddresses();
    //     }
    // }, [state.data.client_id, refetchAddresses])

    // Sincronizar el texto input con el valor seleccionado
    useEffect(() => {
        if (selectedAddress) {
            setSearchSingle(selectedAddress.address ?? "");
        } else {
            setSearchSingle("");
        }
    }, [selectedAddress]);

    // Opcional: cerrar dropdown cuando se cambia de paso (como antes)
    useEffect(() => {
        setOpenSingle(false);
    }, [state.current_step]);

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
            <form onSubmit={handleOnClickNextStep} className={styleModule.formSection}>
                <section className={styleModule.bodySection}>
                    <section className={styleModule.bodySection}>
                        {/* { !loadingAddresses && ( } */}
                        <SingleSelectSearchCheck<IClientAddress>
                            rowId="address"
                            search={searchSingle}
                            setSearch={setSearchSingle}
                            options={addresses}
                            open={openSingle}
                            setOpen={setOpenSingle}
                            emptyMessage="No hay direcciones"
                            labelSelect="Direcciones"
                            icon={<Search size={16} />}
                            placeholder="Buscar direcciones..."
                            classNameDropDownSelectItemInput={styleModule.selectSearchMultiCheckDropDownSelectItemInput}
                            classNameContainer={styleModule.selectSearchMultiCheckContainer}
                            classNameInputContainer={styleModule.selectSearchMultiCheckInputContainer}
                            classNameDropDown={styleModule.selectSearchMultiCheckDropDown}
                            classNameDropDownSelect={styleModule.selectSearchMultiCheckDropDownSelect}
                            classNameButtonInput={styleModule.selectSearchMultiCheckButtonInput}
                            classNameInput={`nunito-semibold ${styleModule.selectSearchMultiCheckInput}`}
                            classNameDropDownSelectItemSelected={`nunito-semibold ${styleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
                            classNameDropDownSearch={styleModule.selectSearchMultiCheckDropDownSearch}
                            classNameDropDownSearchItem={`nunito-semibold ${styleModule.selectSearchMultiCheckDropDownSearchItem}`}
                            classNameSeparator={styleModule.selectSearchMultiCheckSeparator}
                            classNameDropDownHeader={`nunito-bold ${styleModule.selectSearchMultiCheckDropDownHeader}`}
                            classNameEmptyMessage={`nunito-semibold ${styleModule.selectSearchMultiCheckEmptyMessage}`}
                            selected={selectedAddress}
                            setSelected={setSelectedAddress}
                        />
                        {
                            validation && (
                                <p className={styleModule.validation}>{validation}</p>
                            )
                        }
                    </section>
                </section>
                <section className={styleModule.footerSection}>
                    <FadeButton
                        label="Cancelar"
                        type="button"
                        typeOrderIcon="first"
                        classNameButton={styleModule.cancelButton}
                        classNameLabel={styleModule.cancelButtonLabel}
                        classNameSpan={styleModule.cancelButtonSpan}
                        icon={<CircleX className={styleModule.cancelButtonIcon} />}
                        onClick={onClose}
                    />
                    <FadeButton
                        label="Regresar"
                        type="button"
                        typeOrderIcon="first"
                        classNameButton={styleModule.backButton}
                        classNameLabel={styleModule.backButtonLabel}
                        classNameSpan={styleModule.backButtonSpan}
                        icon={<ChevronLeft className={styleModule.backButtonIcon} />}
                        onClick={handleOnClickBack}
                    />
                    <FadeButton
                        label="Siguiente"
                        type="submit"
                        typeOrderIcon="first"
                        classNameButton={styleModule.nextButton}
                        classNameLabel={styleModule.nextButtonLabel}
                        classNameSpan={styleModule.nextButtonSpan}
                        icon={<ChevronRight className={styleModule.nextButtonIcon} />}
                    />
                </section>
            </form>
        </div>
    )
}

export default Step2;