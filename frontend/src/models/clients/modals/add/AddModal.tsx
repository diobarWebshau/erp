import {
    useEffect,
    useState
} from "react";
import type {
    Dispatch,
    FormEvent,
    SetStateAction
} from "react"
import {
    useDispatch,
    useSelector
} from "react-redux";
import type {
    AppDispatchRedux,
    RootState
} from "../../../../store/store";
import {
    X
} from "lucide-react";
import {
    clearAllErrors
} from "../../../../store/slicer/errorSlicer"
import type {
    IPartialClient
} from "../../../../interfaces/clients";
import {
    Country, State, City,
} from "country-state-city";
import type {
    ICity, IState, ICountry
} from "country-state-city";
import InputText
    from "../../../../components/ui/general/input-text/InputText";
import InputSelect
    from "../../../../components/ui/general/input-select/InputSelect";
import InputNumber
    from "../../../../components/ui/general/input-number/InputNamber";
import {
    SelectableCardList
} from "../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import {
    ListItem
} from "../../../../components/ui/general/listItem/ListItem";
import type {
    IPartialClientAddress
} from "../../../../interfaces/clientAddress";

interface IAddModalProps {
    onClose: Dispatch<SetStateAction<boolean>>,
    onCreate: (
        client: IPartialClient,
        addresses: IPartialClientAddress[]
    ) => void
}

const AddModal = ({
    onClose,
    onCreate
}: IAddModalProps) => {

    const paymentMethodOptions: string[] = [
        "Cash",
        "Credit Card",
        "Debit Card",
        "PayPal",
        "Bank Transfer",
    ];

    const dispatch: AppDispatchRedux =
        useDispatch();
    const validation =
        useSelector((state: RootState) => state.error);

    const [states, setStates] =
        useState<IState[]>([]);
    const [cities, setCities] =
        useState<ICity[]>([]);
    const [countries, setCountries] =
        useState<ICountry[]>([]);
    const [countryOptionSelected, setCountryOptionSelected] =
        useState<ICountry | undefined>(undefined);
    const [stateOptionSelected, setStateOptionSelected] =
        useState<IState | undefined>(undefined);
    const [cityOptionSelected, setCityOptionSelected] =
        useState<ICity | undefined>(undefined);
    const [citySelected, setCitySelected] =
        useState<string | undefined>(undefined);
    const [stateSelected, setStateSelected] =
        useState<string | undefined>(undefined);
    const [countrySelected, setCountrySelected] =
        useState<string | undefined>(undefined);
    const [address, setAddress] =
        useState<string | undefined>(undefined);
    const [zipCode, setZipCode] =
        useState<string | undefined>(undefined);

    const [statesAddress, setStatesAddress] =
        useState<IState[]>([]);
    const [citiesAddress, setCitiesAddress] =
        useState<ICity[]>([]);
    const [countriesAddress, setCountriesAddress] =
        useState<ICountry[]>([]);
    const [countryOptionSelectedAddress, setCountryOptionSelectedAddress] =
        useState<ICountry | undefined>(undefined);
    const [stateOptionSelectedAddress, setStateOptionSelectedAddress] =
        useState<IState | undefined>(undefined);
    const [cityOptionSelectedAddress, setCityOptionSelectedAddress] =
        useState<ICity | undefined>(undefined);
    const [citySelectedAddress, setCitySelectedAddress] =
        useState<string | undefined>(undefined);
    const [stateSelectedAddress, setStateSelectedAddress] =
        useState<string | undefined>(undefined);
    const [countrySelectedAddress, setCountrySelectedAddress] =
        useState<string | undefined>(undefined);
    const [addressAddress, setAddressAddress] =
        useState<string | undefined>(undefined);
    const [zipCodeAddress, setZipCodeAddress] =
        useState<string | undefined>(undefined);

    const [companyName, setCompanyName] =
        useState<string | undefined>(undefined);
    const [taxId, setTaxId] =
        useState<string | undefined>(undefined);
    const [email, setEmail] =
        useState<string | undefined>(undefined);
    const [phone, setPhone] =
        useState<string | undefined>(undefined);
    const [paymentTerms, setPaymentTerms] =
        useState<string | undefined>(undefined);
    const [creditLimit, setCreditLimit] =
        useState<number>(0);
    const [taxRegimen, setTaxRegimen] =
        useState<string | undefined>(undefined);
    const [cfdi, setCfdi] =
        useState<string | undefined>(undefined);
    const [paymentMethod, setPaymentMethod] =
        useState<string | undefined>(undefined);
    const [isActive, setIsActive] =
        useState<boolean | undefined>(undefined);
    const [clientAddrresses, setClientAddrresses] =
        useState<IPartialClientAddress[]>([]);
    const [hasAddresses, setHasAddresses] =
        useState<boolean | undefined>(undefined);
    const [isAddAddresses, setIsAddAddresses] =
        useState<boolean | undefined>(undefined);

    const handleOnClickAddAddresses = () => {
        if (
            countrySelectedAddress !== undefined &&
            stateSelectedAddress !== undefined &&
            citySelectedAddress !== undefined &&
            addressAddress !== undefined &&
            zipCodeAddress !== undefined
        ) {
            const newAddress: IPartialClientAddress = {
                id: Date.now() + Math.random(),
                country: countrySelectedAddress,
                state: stateSelectedAddress,
                city: citySelectedAddress,
                address: addressAddress,
                zip_code: zipCodeAddress,
            };
            setClientAddrresses(
                (prev) => [...prev, newAddress]
            );
            setIsAddAddresses(false);
            setCountrySelectedAddress(undefined);
            setStateSelectedAddress(undefined);
            setCitySelectedAddress(undefined);
            setAddressAddress(undefined);
            setZipCodeAddress(undefined);
        }
    }

    const handleActiveModalClickAddAddresses = () => {
        setCountrySelectedAddress(undefined);
        setStateSelectedAddress(undefined);
        setCitySelectedAddress(undefined);
        setAddressAddress(undefined);
        setZipCodeAddress(undefined);
        setIsAddAddresses(!isAddAddresses);
    }

    const handleCancelAddAddresses = () => {
        setIsAddAddresses(false);
        setCountrySelectedAddress(undefined);
        setStateSelectedAddress(undefined);
        setCitySelectedAddress(undefined);
        setAddressAddress(undefined);
        setZipCodeAddress(undefined);
    }

    const handleOnClickAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            companyName !== undefined && companyName !== '' &&
            taxId !== undefined && taxId !== '' &&
            email !== undefined && email !== '' &&
            phone !== undefined && phone !== '' &&
            address !== undefined && address !== '' &&
            paymentTerms !== undefined && paymentTerms !== '' &&
            creditLimit !== undefined && creditLimit !== 0 &&
            zipCode !== undefined && zipCode !== '' &&
            taxRegimen !== undefined && taxRegimen !== '' &&
            cfdi !== undefined && cfdi !== '' &&
            paymentMethod !== undefined && paymentMethod !== '' &&
            isActive !== undefined &&
            hasAddresses !== undefined
        ) {
            const newClient: IPartialClient = {
                company_name: companyName,
                tax_id: taxId,
                email: email,
                phone: phone,
                payment_terms: paymentTerms,
                credit_limit: creditLimit,
                tax_regimen: taxRegimen,
                cfdi: cfdi,
                payment_method: paymentMethod,
                is_active: isActive,
                address: address,
                zip_code: zipCode,
                country: countrySelected,
                state: stateSelected,
                city: citySelected,
            };
            onCreate(newClient, clientAddrresses || []);
        }
    }

    useEffect(() => {
        dispatch(clearAllErrors());
        const countryList =
            Country.getAllCountries();
        setCountries(countryList);
        setCountriesAddress(countryList);
    }, []);


    useEffect(() => {
        if (countrySelected) {
            const option =
                countries.find(
                    c => c.name === countrySelected
                );
            setCountryOptionSelected(option);
        }
    }, [countrySelected]);

    useEffect(() => {
        if (countryOptionSelected) {
            const list = State.getStatesOfCountry(
                countryOptionSelected.isoCode
            );
            setStates(list);
            setCities([]);
        }
    }, [countryOptionSelected]);

    useEffect(() => {
        if (stateSelected && countryOptionSelected) {
            const state =
                states.find(s => s.name === stateSelected);
            if (state) {
                const list = City.getCitiesOfState(
                    countryOptionSelected.isoCode, state.isoCode
                );
                setCities(list);
            }
        }
    }, [stateSelected]);

    useEffect(() => {
        if (countrySelectedAddress) {
            const option =
                countriesAddress.find(
                    c => c.name === countrySelectedAddress
                );
            setCountryOptionSelectedAddress(option);
        }
    }, [countrySelectedAddress]);

    useEffect(() => {
        if (countryOptionSelectedAddress) {
            const list =
                State.getStatesOfCountry(
                    countryOptionSelectedAddress.isoCode
                );
            setStatesAddress(list);
            setCitiesAddress([]);
        }
    }, [countryOptionSelectedAddress]);

    useEffect(() => {
        if (stateSelectedAddress && countryOptionSelectedAddress) {
            const state =
                statesAddress.find(
                    s => s.name === stateSelectedAddress
                );
            if (state) {
                const list =
                    City.getCitiesOfState(
                        countryOptionSelectedAddress.isoCode,
                        state.isoCode
                    );
                setCitiesAddress(list);
            }
        }
    }, [stateSelectedAddress]);

    // useEffect(() => {
    //     if (countrySelected) {
    //         const option = countries.find(c => c.name === countrySelected);
    //         setCountryOptionSelected(option);
    //     }
    // }, [countrySelected]);

    // useEffect(() => {
    //     if (countrySelectedAddress) {
    //         const option = countriesAddress.find(c => c.name === countrySelectedAddress);
    //         setCountryOptionSelectedAddress(option);
    //     }
    // }, [countrySelectedAddress]);


    // useEffect(() => {
    //     if (stateSelected) {
    //         const option = states.find(s => s.name === stateSelected);
    //         setStateOptionSelected(option);
    //     }
    // }, [stateSelected]);

    // useEffect(() => {
    //     if (stateSelectedAddress) {
    //         const option = statesAddress.find(s => s.name === stateSelectedAddress);
    //         setStateOptionSelectedAddress(option);
    //     }
    // }, [stateSelectedAddress]);


    // useEffect(() => {
    //     if (citySelected) {
    //         const option = cities.find(c => c.name === citySelected);
    //         setCityOptionSelected(option);
    //     }
    // }, [citySelected]);

    // useEffect(() => {
    //     if (citySelectedAddress) {
    //         const option =
    //             citiesAddress.find(
    //                 c => c.name === citySelectedAddress
    //             );
    //         setCityOptionSelectedAddress(option);
    //     }
    // }, [citySelectedAddress]);


    // useEffect(() => {
    //     if (countryOptionSelected) {
    //         setCountrySelected(countryOptionSelected.name);
    //         setStateSelected(undefined);
    //         setCitySelected(undefined);
    //     }
    // }, [countryOptionSelected]);

    // useEffect(() => {
    //     if (countryOptionSelectedAddress) {
    //         setCountrySelectedAddress(countryOptionSelectedAddress.name);
    //         setStateSelectedAddress(undefined);
    //         setCitySelectedAddress(undefined);
    //     }
    // }, [countryOptionSelectedAddress]);

    // useEffect(() => {
    //     if (countrySelected) {
    //         const country = countries.find(c => c.name === countrySelected);
    //         const list = State.getStatesOfCountry(country?.isoCode);
    //         setStates(list);
    //         setCities([]);
    //     }
    // }, [countrySelected]);

    // useEffect(() => {
    //     if (countrySelectedAddress) {
    //         const country = countriesAddress.find(c => c.name === countrySelectedAddress);
    //         const list = State.getStatesOfCountry(country?.isoCode);
    //         setStatesAddress(list);
    //         setCitiesAddress([]);
    //     }
    // }, [countrySelectedAddress]);


    // useEffect(() => {
    //     if (stateSelected && countryOptionSelected) {
    //         const state = states.find(s => s.name === stateSelected);
    //         if (state) {
    //             const list = City.getCitiesOfState(
    //                 countryOptionSelected.isoCode,
    //                 state.isoCode
    //             );
    //             setCities(list);
    //         }
    //     }
    // }, [stateSelected]);

    // useEffect(() => {
    //     if (stateSelectedAddress && countryOptionSelectedAddress) {
    //         const state = statesAddress.find(s => s.name === stateSelectedAddress);
    //         if (state) {
    //             const list = City.getCitiesOfState(
    //                 countryOptionSelectedAddress.isoCode,
    //                 state.isoCode
    //             );
    //             setCitiesAddress(list);
    //         }
    //     }
    // }, [stateSelectedAddress]);


    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    zIndex: 10,
                    padding: "1rem",
                    overflowY: "auto",
                    width: "30%",
                    height: "50%",
                    backgroundColor: "black",
                }}
            >
                <div>
                    <div
                        style={{
                            position: "absolute",
                            top: 5,
                            right: 5
                        }}
                        onClick={() => onClose(false)}
                    >
                        <X size={20} />
                    </div>
                    <form
                        onSubmit={handleOnClickAdd}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}
                    >
                        <h2> New client</h2>
                        <InputText
                            id="companyName"
                            label="Company Name"
                            type="text"
                            name="companyName"
                            placeholder="Company Name"
                            value={companyName || ''}
                            onChange={setCompanyName}
                        />
                        <fieldset>
                            <legend><strong> {"Contact Information"} </strong></legend>
                            <InputText
                                id="email"
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={email || ''}
                                onChange={setEmail}
                            />
                            <InputText
                                id="phone"
                                label="Phone"
                                type="phone"
                                name="phone"
                                placeholder="Phone"
                                value={phone || ''}
                                onChange={setPhone}
                            />
                        </fieldset>
                        <fieldset>
                            <legend><strong> {"Tax Information"} </strong></legend>
                            <InputText
                                id="taxRegimen"
                                label="Tax Regimen"
                                type="text"
                                name="taxRegimen"
                                placeholder="Tax Regimen"
                                value={taxRegimen || ''}
                                onChange={setTaxRegimen}
                            />
                            <InputText
                                id="paymentTerms"
                                label="Payment Terms"
                                type="text"
                                name="paymentTerms"
                                placeholder="Payment Terms"
                                value={paymentTerms || ''}
                                onChange={setPaymentTerms}
                            />
                            <InputSelect
                                id="paymentMethod"
                                label="Payment Method"
                                name="paymentMethod"
                                placeholder="Payment Method"
                                options={paymentMethodOptions}
                                value={paymentMethod || ''}
                                onChange={setPaymentMethod}
                            />
                            <InputText
                                id="taxId"
                                label="Tax ID"
                                type="text"
                                name="taxId"
                                placeholder="Tax ID"
                                value={taxId || ''}
                                onChange={setTaxId}
                            />
                            <InputText
                                id="cfdi"
                                label="Cfdi"
                                type="text"
                                name="cfdi"
                                placeholder="Cfdi"
                                value={cfdi || ''}
                                onChange={setCfdi}
                            />
                            <InputNumber
                                id="creditLimit"
                                label="Credit Limit"
                                name="creditLimit"
                                placeholder="Credit Limit"
                                value={creditLimit || 0}
                                onChange={setCreditLimit}
                                min={0}
                                max={1000000}
                            />
                            <InputSelect
                                id="country"
                                label="Country"
                                name="country"
                                placeholder="Country"
                                value={countrySelected || ''}
                                onChange={setCountrySelected}
                                options={countries.map((country) => country.name)}
                            />
                            {
                                states.length > 0 &&
                                countrySelected &&
                                <InputSelect
                                    id="state"
                                    label="State"
                                    name="state"
                                    placeholder="State"
                                    value={stateSelected || ''}
                                    onChange={setStateSelected}
                                    options={states.map((state) => state.name)}
                                />

                            }
                            {
                                cities.length > 0 &&
                                countrySelected &&
                                stateSelected &&
                                <InputSelect
                                    id="city"
                                    label="City"
                                    name="city"
                                    placeholder="City"
                                    value={citySelected || ''}
                                    onChange={setCitySelected}
                                    options={cities.map((city) => city.name)}
                                />
                            }
                            <InputText
                                id="address"
                                label="Address"
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={address || ''}
                                onChange={setAddress}
                            />
                            <InputText
                                id="zipCode"
                                label="Zip Code"
                                type="text"
                                name="zipCode"
                                placeholder="Zip Code"
                                value={zipCode || ''}
                                onChange={setZipCode}
                            />
                        </fieldset>
                        <fieldset>
                            <legend><strong> {"Other Information"} </strong></legend>
                            <SelectableCardList
                                name="addresses"
                                items={[true, false]}
                                getId={(value) => Number(value)}
                                renderFields={(value) => (
                                    <>
                                        <div>{value ? "Yes" : "No"}</div>
                                    </>
                                )}
                                selectedItem={hasAddresses}
                                onChange={setHasAddresses}
                                label={`Addresses? `}
                                emptyMessage=""
                            />
                            {
                                hasAddresses && <div>
                                    <button
                                        type="button"
                                        onClick={handleActiveModalClickAddAddresses}
                                    >Add addresses</button>
                                    {
                                        isAddAddresses && <div>
                                            <InputSelect
                                                id="country"
                                                label="Country"
                                                name="country"
                                                placeholder="Country"
                                                value={countrySelectedAddress || ''}
                                                onChange={setCountrySelectedAddress}
                                                options={countriesAddress.map((country) => country.name)}
                                            />
                                            {
                                                statesAddress.length > 0 &&
                                                countrySelectedAddress &&
                                                <InputSelect
                                                    id="state"
                                                    label="State"
                                                    name="state"
                                                    placeholder="State"
                                                    value={stateSelectedAddress || ''}
                                                    onChange={setStateSelectedAddress}
                                                    options={statesAddress.map((state) => state.name)}
                                                />

                                            }
                                            {
                                                citiesAddress.length > 0 &&
                                                countrySelectedAddress &&
                                                stateSelectedAddress &&
                                                <InputSelect
                                                    id="city"
                                                    label="City"
                                                    name="city"
                                                    placeholder="City"
                                                    value={citySelectedAddress || ''}
                                                    onChange={setCitySelectedAddress}
                                                    options={citiesAddress.map((city) => city.name)}
                                                />
                                            }
                                            <InputText
                                                id="address"
                                                label="Address"
                                                type="text"
                                                name="address"
                                                placeholder="Address"
                                                value={addressAddress || ''}
                                                onChange={setAddressAddress}
                                            />
                                            <InputText
                                                id="zipCode"
                                                label="Zip Code"
                                                type="text"
                                                name="zipCode"
                                                placeholder="Zip Code"
                                                value={zipCodeAddress || ''}
                                                onChange={setZipCodeAddress}
                                            />

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelAddAddresses}
                                                > Cancel </button>
                                                <button type="button" onClick={handleOnClickAddAddresses}>
                                                    Add address
                                                </button>
                                            </div>
                                        </div>
                                    }
                                    <ListItem
                                        items={clientAddrresses}
                                        label="Addresses assigned"
                                        getId={(item) => Number(item?.id)}
                                        renderFields={(item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent: "space-evenly",
                                                    color: "black"
                                                }}
                                            >
                                                <small><strong>Country : </strong>{item.country}</small>
                                                <small><strong>State : </strong>{item.state}</small>
                                                <small><strong>City : </strong>{item.city}</small>
                                                <small><strong>Address : </strong>{item.address}</small>
                                                <small><strong>Zip code : </strong>{item.zip_code}</small>
                                            </div>
                                        )}
                                        emptyMessage={"No addresses assigned"}
                                        onDelete={(item) => {
                                            setClientAddrresses((prev) =>
                                                prev.filter((i) => i.id !== item.id)
                                            );
                                        }}
                                    />
                                </div>
                            }
                            <SelectableCardList
                                name="status"
                                items={[true, false]}
                                getId={(value) => Number(value)}
                                renderFields={(value) => (
                                    <>
                                        <div>{value ? "Active" : "Inactive"}</div>
                                    </>
                                )}
                                selectedItem={isActive}
                                onChange={setIsActive}
                                label={`Select status`}
                                emptyMessage="No status available to select"
                            />
                        </fieldset>
                        <div>

                            {
                                Object.keys(validation).length > 0 &&
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        color: "red"
                                    }}
                                >
                                    {
                                        Object.keys(validation).map((key) => {
                                            const errorValue = validation[key];
                                            if (!errorValue) return null;
                                            if (Array.isArray(errorValue)) {
                                                return errorValue.map((msg, index) => (
                                                    <small key={`${key}-${index}`}>{msg}</small>
                                                ));
                                            }
                                            return <small key={key}>{errorValue}</small>;
                                        })
                                    }
                                </div>
                            }
                            <div>
                                <button
                                    type="button"
                                    onClick={() => onClose(false)}
                                >Cancel</button>
                                <button type="submit">Accept</button>
                            </div>
                        </div>
                    </form>
                </div >
            </div >
        </>
    );
}

export default AddModal;