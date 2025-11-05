import { useState, useMemo, useEffect, useCallback } from "react";
import { Country, State, City } from "country-state-city";
import type { ICountry, IState, ICity } from "country-state-city";

/* ============ utils ============ */
const normalize = (s: string) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

function resolveCountryCode(list: ICountry[], input?: string) {
    if (!input) return undefined;
    const n = normalize(input);

    // si ya es código
    const byCode = list.find(c => normalize(c.isoCode) === n);
    if (byCode) return byCode.isoCode;

    // alias comunes
    const ALIASES: Record<string, string> = {
        "united states": "US", "estados unidos": "US", "usa": "US", "us": "US",
        "méxico": "MX", "mexico": "MX", "mx": "MX",
        "canada": "CA", "canadá": "CA", "ca": "CA",
    };
    if (ALIASES[n]) return ALIASES[n];

    // por nombre (exacto → includes)
    return (
        list.find(c => normalize(c.name) === n)?.isoCode ??
        list.find(c => normalize(c.name).includes(n))?.isoCode
    );
}

function buildAllowedIsoSet(all: ICountry[], allowed?: string[]) {
    if (!allowed?.length) return undefined;
    const set = new Set<string>();
    for (const a of allowed) {
        const code = resolveCountryCode(all, a);
        if (code) set.add(code);
    }
    return set.size ? set : undefined;
}

/* ============ tipos públicos ============ */
export type UseCSCSeparatedOptions = {
    // Controlado (opcional) o no-controlado por defaultX
    countryName?: string;
    onCountryNameChange?: (name: string) => void;
    defaultCountryName?: string;

    stateName?: string;
    onStateNameChange?: (name: string) => void;
    defaultStateName?: string;

    cityName?: string;
    onCityNameChange?: (name: string) => void;
    defaultCityName?: string;

    // Catálogo (filtro)
    allowedCountries?: string[];     // nombres o ISO2 (p. ej. ["México","US","Canada"])
    countryOrderIso?: string[];      // orden opcional por ISO2 (p. ej. ["MX","US","CA"])
};

export type UseCSCSeparated = {
    // catálogos
    countryNames: string[];
    stateNames: string[];
    cityNames: string[];

    // selección actual (por nombre)
    countryName: string;
    stateName: string;
    cityName: string;

    // objetos seleccionados
    selectedCountry?: ICountry;
    selectedState?: IState;
    selectedCity?: ICity;

    // setters (por nombre) con reseteo en cascada
    setCountryName: (name: string) => void; // limpia state/city
    setStateName: (name: string) => void;   // limpia city
    setCityName: (name: string) => void;

    // helpers
    clearState: () => void;  // deja state/city en ""
    clearCity: () => void;   // deja city en ""
    resetAll: () => void;    // deja todo en ""

    // códigos resueltos
    countryCode?: string;
    stateCode?: string;
};

/* ============ hook principal ============ */
export function useCountryStateCitySeparated(opts: UseCSCSeparatedOptions = {}): UseCSCSeparated {
    const {
        countryName, onCountryNameChange, defaultCountryName,
        stateName, onStateNameChange, defaultStateName,
        cityName, onCityNameChange, defaultCityName,
        allowedCountries, countryOrderIso,
    } = opts;

    // catálogos base
    const allCountries = useMemo(() => Country.getAllCountries(), []);
    const allowedIso = useMemo(
        () => buildAllowedIsoSet(allCountries, allowedCountries),
        [allCountries, allowedCountries]
    );

    // países visibles (filtrados + orden opcional)
    const countries = useMemo<ICountry[]>(() => {
        let list = allowedIso
            ? allCountries.filter(c => allowedIso.has(c.isoCode))
            : allCountries.slice();
        if (countryOrderIso?.length) {
            const order = new Map(countryOrderIso.map((c, i) => [c, i]));
            list.sort((a, b) => {
                const ia = order.get(a.isoCode); const ib = order.get(b.isoCode);
                if (ia == null && ib == null) return a.name.localeCompare(b.name);
                if (ia == null) return 1;
                if (ib == null) return -1;
                return ia - ib;
            });
        }
        return list;
    }, [allCountries, allowedIso, countryOrderIso]);

    // estado local si no están controlados desde afuera
    const [localCountry, setLocalCountry] = useState(defaultCountryName ?? "");
    const [localState, setLocalState] = useState(defaultStateName ?? "");
    const [localCity, setLocalCity] = useState(defaultCityName ?? "");

    // valor actual (preferir controlado si viene)
    const curCountry = (countryName ?? localCountry) || "";
    const curState = (stateName ?? localState) || "";
    const curCity = (cityName ?? localCity) || "";

    // helpers para settear respetando controlado/no-controlado
    const setCountry = useCallback((v: string) => {
        onCountryNameChange ? onCountryNameChange(v) : setLocalCountry(v);
    }, [onCountryNameChange]);
    const setState = useCallback((v: string) => {
        onStateNameChange ? onStateNameChange(v) : setLocalState(v);
    }, [onStateNameChange]);
    const setCity = useCallback((v: string) => {
        onCityNameChange ? onCityNameChange(v) : setLocalCity(v);
    }, [onCityNameChange]);

    // resolver seleccionados
    const countryCode = useMemo(
        () => resolveCountryCode(countries, curCountry),
        [countries, curCountry]
    );
    const selectedCountry = useMemo(
        () => (countryCode ? countries.find(c => c.isoCode === countryCode) : undefined),
        [countries, countryCode]
    );

    const states = useMemo<IState[]>(() => {
        if (!countryCode) return [];
        return State.getStatesOfCountry(countryCode) ?? [];
    }, [countryCode]);

    const stateCode = useMemo(() => {
        if (!curState) return undefined;
        const n = normalize(curState);
        return (
            states.find(s => normalize(s.name) === n)?.isoCode ??
            states.find(s => normalize(s.name).includes(n))?.isoCode
        );
    }, [states, curState]);

    const selectedState = useMemo(
        () => (stateCode ? states.find(s => s.isoCode === stateCode) : undefined),
        [states, stateCode]
    );

    const cities = useMemo<ICity[]>(() => {
        if (!countryCode || !stateCode) return [];
        return City.getCitiesOfState(countryCode, stateCode) ?? [];
    }, [countryCode, stateCode]);

    const selectedCity = useMemo(() => {
        if (!curCity) return undefined;
        const n = normalize(curCity);
        return (
            cities.find(ci => normalize(ci.name) === n) ??
            cities.find(ci => normalize(ci.name).includes(n))
        );
    }, [cities, curCity]);

    // listas para UI
    const countryNames = useMemo(() => countries.map(c => c.name), [countries]);
    const stateNames = useMemo(() => states.map(s => s.name), [states]);
    const cityNames = useMemo(() => cities.map(ci => ci.name), [cities]);

    // validaciones al cambiar catálogos/filtros: limpieza en cascada si inválido
    useEffect(() => {
        if (!curCountry) return;
        if (!countryCode) {
            // país ya no permitido -> limpia todo
            setCountry("");
            setState("");
            setCity("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countries]);

    useEffect(() => {
        if (!curState) return;
        const n = normalize(curState);
        if (!states.some(s => normalize(s.name) === n)) {
            setState("");
            setCity("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [states]);

    useEffect(() => {
        if (!curCity) return;
        const n = normalize(curCity);
        if (!cities.some(ci => normalize(ci.name) === n)) {
            setCity("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cities]);

    // setters públicos con cascada
    const setCountryName = useCallback((name: string) => {
        setCountry(name || "");
        setState(""); // reset cascada
        setCity("");
    }, [setCountry, setState, setCity]);

    const setStateName = useCallback((name: string) => {
        setState(name || "");
        setCity("");  // reset cascada
    }, [setState, setCity]);

    const setCityName = useCallback((name: string) => {
        setCity(name || "");
    }, [setCity]);

    const clearState = useCallback(() => {
        setState("");
        setCity("");
    }, [setState, setCity]);

    const clearCity = useCallback(() => setCity(""), [setCity]);

    const resetAll = useCallback(() => {
        setCountry("");
        setState("");
        setCity("");
    }, [setCountry, setState, setCity]);

    return {
        countryNames,
        stateNames,
        cityNames,
        countryName: curCountry,
        stateName: curState,
        cityName: curCity,
        selectedCountry,
        selectedState,
        selectedCity,
        setCountryName,
        setStateName,
        setCityName,
        clearState,
        clearCity,
        resetAll,
        countryCode,
        stateCode,
    };
}
