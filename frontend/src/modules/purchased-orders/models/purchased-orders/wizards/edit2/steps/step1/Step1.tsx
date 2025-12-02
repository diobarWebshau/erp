import { ChevronRight, CircleX, Plus, Search } from "lucide-react"
import FadeButton from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton"
import type { IClient } from "../../../../../../../../interfaces/clients"
import { useModalEditState, useModalEditDispatch } from "../../context/modalEditHooks"
import { next_step, set_step, update_update_data } from "../../context/modalEditActions"
import type { IPartialPurchasedOrder } from "../../../../../../../../interfaces/purchasedOrder"
import SingleSelectSearchCheck from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheck";
import useClientById from "./../../../../../../../../modelos/clients/react-hooks/useClientById"
import { useEffect, useState } from "react"
import StyleModule from "./Step1.module.css"

const Step1 = () => {

    // ? ************ Hooks ************/

    const state = useModalEditState();
    const dispatch = useModalEditDispatch();

    const {
        clientById,
        loadingClientById,
    } = useClientById(
        state.updated?.client_id ?? null
    );

    // ? ************ Estados ************/

    const [validation, setValidation] =
        useState<string | null>(null);
    const [selectedSingle, setSelectedSingle] =
        useState<IClient | null>(null);
    const [searchSingle, setSearchSingle] = useState("");
    const [openSingle, setOpenSingle] = useState(false);

    // ? ************ Funciones ************/

    const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSingle) {
            setValidation("Por favor, selecciona un cliente");
            return;
        } else {
            if (state.current_step + 1 < state.total_steps + 1 &&
                selectedSingle
            ) {
                console.log(selectedSingle);
                const purchasedOrder: IPartialPurchasedOrder = {
                    client_id: selectedSingle.id,
                    company_name: selectedSingle.company_name,
                    tax_id: selectedSingle.tax_id,
                    email: selectedSingle.email,
                    phone: selectedSingle.phone,
                    city: selectedSingle.city,
                    state: selectedSingle.state,
                    country: selectedSingle.country,
                    street: selectedSingle.street,
                    street_number: selectedSingle.street_number,
                    neighborhood: selectedSingle.neighborhood,
                    payment_terms: selectedSingle.payment_terms,
                    zip_code: selectedSingle.zip_code,
                    tax_regimen: selectedSingle.tax_regimen,
                    cfdi: selectedSingle.cfdi,
                    payment_method: selectedSingle.payment_method,
                    client: selectedSingle,
                }
                console.log(purchasedOrder);
                dispatch(update_update_data(purchasedOrder));
                dispatch(next_step());
            }
        }
    }

    useEffect(() => {
        if (selectedSingle) {
            setValidation(null);
        }
    }, [selectedSingle]);

    const fetchClientsLike = async (query: string): Promise<IClient[]> => {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const encodedQuery = encodeURIComponent(query);

        try {
            const response =
                await fetch(`http://localhost:3003/clients/clients/filter/${encodedQuery}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // El backend responde directamente con un array de clientes
            const clients: IClient[] = await response.json();

            return clients;

        } catch (error) {
            console.error("Error fetching clients:", error);
            return [];
        }
    };

    // Sincronizar el texto input con el valor seleccionado
    useEffect(() => {
        if (selectedSingle) {
            setSearchSingle(selectedSingle.company_name ?? "");
        } else {
            setSearchSingle("");
        }
    }, [selectedSingle]);

    // Opcional: cerrar dropdown cuando se cambia de paso (como antes)
    useEffect(() => {
        setOpenSingle(false);
    }, [state.current_step]);

    useEffect(() => {
        if (clientById && !selectedSingle) {
            setSelectedSingle(clientById);
            setSearchSingle(clientById.company_name ?? "");
        }
    }, [clientById, selectedSingle]);


    const handleOnClickBack = () => {
        dispatch(set_step(3));
    }

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h2 className={`nunito-bold`}>Clientes</h2>
                <FadeButton
                    label="Cliente nuevo"
                    type="button"
                    typeOrderIcon="first"
                    icon={<Plus className={StyleModule.newClientIcon} />}
                    onClick={() => console.log("Cliente nuevo")}
                    classNameButton={StyleModule.newClientButton}
                    classNameLabel={StyleModule.newClientLabel}
                    classNameSpan={StyleModule.newClientSpan}

                />
            </section>
            <form onSubmit={handleNextStep} className={StyleModule.formSection}>
                <section className={StyleModule.bodySection}>
                    {
                        !loadingClientById && (
                            <SingleSelectSearchCheck<IClient>
                                rowId="company_name"
                                search={searchSingle}
                                setSearch={setSearchSingle}
                                open={openSingle}
                                setOpen={setOpenSingle}
                                emptyMessage="No hay clientes"
                                icon={<Search size={16} />}
                                placeholder="Buscar clientes..."
                                classNameDropDownSelectItemInput={StyleModule.selectSearchMultiCheckDropDownSelectItemInput}
                                classNameContainer={StyleModule.selectSearchMultiCheckContainer}
                                classNameInputContainer={StyleModule.selectSearchMultiCheckInputContainer}
                                classNameDropDown={StyleModule.selectSearchMultiCheckDropDown}
                                classNameDropDownSelect={StyleModule.selectSearchMultiCheckDropDownSelect}
                                classNameButtonInput={StyleModule.selectSearchMultiCheckButtonInput}
                                classNameInput={`nunito-semibold ${StyleModule.selectSearchMultiCheckInput}`}
                                classNameDropDownSelectItemSelected={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
                                classNameDropDownSearch={StyleModule.selectSearchMultiCheckDropDownSearch}
                                classNameDropDownSearchItem={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSearchItem}`}
                                classNameSeparator={StyleModule.selectSearchMultiCheckSeparator}
                                classNameDropDownHeader={`nunito-bold ${StyleModule.selectSearchMultiCheckDropDownHeader}`}
                                classNameEmptyMessage={`nunito-semibold ${StyleModule.selectSearchMultiCheckEmptyMessage}`}
                                loadOptions={fetchClientsLike}
                                selected={selectedSingle}
                                setSelected={setSelectedSingle}
                            />
                        )
                    }
                    {
                        validation && (
                            <p className={StyleModule.validation}>{validation}</p>
                        )
                    }
                </section>
                <section className={StyleModule.footerSection}>
                    <FadeButton
                        label="Cancelar"
                        type="button"
                        typeOrderIcon="first"
                        classNameButton={StyleModule.cancelButton}
                        classNameLabel={StyleModule.cancelButtonLabel}
                        classNameSpan={StyleModule.cancelButtonSpan}
                        icon={<CircleX className={StyleModule.cancelButtonIcon} />}
                        onClick={handleOnClickBack}
                    />
                    <FadeButton
                        label="Siguiente"
                        type="submit"
                        typeOrderIcon="first"
                        classNameButton={StyleModule.nextButton}
                        classNameLabel={StyleModule.nextButtonLabel}
                        classNameSpan={StyleModule.nextButtonSpan}
                        icon={<ChevronRight className={StyleModule.nextButtonIcon} />}
                    />
                </section>
            </form>
        </div>
    )
}

export default Step1