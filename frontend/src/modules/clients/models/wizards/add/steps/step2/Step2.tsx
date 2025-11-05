import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { useEffect, useState, type Dispatch } from "react";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Bookmark } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import StyleModule from "./Step2.module.css";
import { useCountryStateCitySeparated } from "../../../../../../../hooks/useCountryStateCity";
import ObjectSelectCustomMemo from "./../../../../../../../comp/features/select/ObjectSelectCustom"
import StandardSelectCustomMemo from "./../../../../../../../comp/features/select/StandardSelectCustom";

interface IStep2 {
    state: ClientState;
    dispatch: Dispatch<ClientAction>;
    onCancel: () => void;
}


interface IUser {
    name: string;
    id: string;
}
const users: IUser[] = [
    { name: "Juan", id: "1" },
    { name: "Maria", id: "2" },
    { name: "Pedro", id: "3" },
    { name: "Ana", id: "4" },
    { name: "Luis", id: "5" },
    { name: "Miguel", id: "6" },
    { name: "Jesus", id: "7" },
    { name: "Eduardo", id: "8" },
    { name: "Itiel", id: "9" },
    { name: "Naylim", id: "10" },
    { name: "Michael", id: "11" },
    { name: "Natalia", id: "12" },
    { name: "Oscar", id: "13" },
    { name: "Pablo", id: "14" },
    { name: "Quintana", id: "15" },
    { name: "Raul", id: "16" },
    { name: "Sofia", id: "17" },
    { name: "Tania", id: "18" },
    { name: "Uriel", id: "19" },
    { name: "Valentina", id: "20" },
    { name: "Ximena", id: "21" },
    { name: "Yael", id: "22" },
    { name: "Zoe", id: "23" },
    { name: "Zuriel", id: "24" },
    { name: "Zulema", id: "25" },
    { name: "Zulema2", id: "26" },
    { name: "Zulema3", id: "27" },
    { name: "Zulema4", id: "28" },
    { name: "Zulema5", id: "29" },
    { name: "Zulema6", id: "30" },
    { name: "Zulema7", id: "31" },
    { name: "Zulema8", id: "32" },
    { name: "Zulema9", id: "33" },
    { name: "Zulema10", id: "34" },
    { name: "Zulema11", id: "35" },
    { name: "Zulema12", id: "36" },
    { name: "Zulema13", id: "37" },
    { name: "Zulema14", id: "38" },
    { name: "Zulema15", id: "39" },
    { name: "Zulema16", id: "40" },
    { name: "Zulema17", id: "41" },
    { name: "Zulema18", id: "42" },
    { name: "Zulema19", id: "43" },
    { name: "Zulema20", id: "44" },
];

const Step2 = ({
    state,
    dispatch,
    onCancel
}: IStep2) => {

    const [countryName, setCountryName] = useState<string>(state?.data?.country ?? "México");
    const [stateName, setStateName] = useState<string>(state?.data?.state ?? "");
    const [cityName, setCityName] = useState<string>(state.data?.city ?? "");

    const [user, setUser] = useState<IUser | null>(null);

    const csc = useCountryStateCitySeparated({
        countryName, onCountryNameChange: setCountryName,
        stateName, onStateNameChange: setStateName,
        cityName, onCityNameChange: setCityName,
        allowedCountries: ["México", "US", "Canada"],
        countryOrderIso: ["MX", "US", "CA"],
    });

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                {/* <StandarSelectCustom
                    options={csc.countryNames}
                    value={countryName}
                    onChange={(e) => setCountryName(e)}
                />
                <StandarSelectCustom
                    options={csc.stateNames}
                    value={stateName}
                    onChange={(e) => setStateName(e)}
                />
                <StandarSelectCustom
                    options={csc.cityNames}
                    value={cityName}
                    onChange={(e) => setCityName(e)}
                /> */}
                <ObjectSelectCustomMemo
                    options={users}
                    value={user}
                    onChange={(e) => setUser(e)}
                    labelKey={"name"}
                    placeholder="Selecciona un usuario"
                    mainColor="var(--color-theme-primary)"
                    withValidation
                />
                <StandardSelectCustomMemo
                    options={csc.countryNames}
                    value={countryName}
                    onChange={(e) => setCountryName(e)}
                    placeholder="Selecciona un pais"
                    mainColor="var(--color-theme-primary)"
                    withValidation
                />
                <StandardSelectCustomMemo
                    options={csc.stateNames}
                    value={stateName}
                    onChange={(e) => setStateName(e)}
                    placeholder="Selecciona un estado"
                    mainColor="var(--color-theme-primary)"
                    withValidation
                />
                <StandardSelectCustomMemo
                    options={csc.cityNames}
                    value={cityName}
                    onChange={(e) => setCityName(e)}
                    placeholder="Selecciona una ciudad"
                    mainColor="var(--color-theme-primary)"
                    withValidation
                />
            </div>
            <div className={StyleModule.containerButtons}>
                {/* <CriticalActionButton
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
                    onClick={() => console.log("guardar y continuar")}
                    icon={<Bookmark />}
                /> */}
            </div>
        </div>
    );
};

export default Step2;
