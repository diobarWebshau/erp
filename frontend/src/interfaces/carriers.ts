interface ICarrier {
    id: number;
    name: string;
    rfc: string;
    company_name: string;
    type: string;
    phone: string;
    vehicle: string;
    plates: string;
    license_number: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

type IPartialCarrier = Partial<ICarrier>;

const defaultValueCarrier: ICarrier = {
    id: 0,
    name: '',
    rfc: '',
    company_name: '',
    type: '',
    phone: '',
    vehicle: '',
    plates: '',
    license_number: '',
    active: true,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialCarrier: IPartialCarrier = {
    name: '',
    rfc: '',
    company_name: '',
    type: '',
    phone: '',
    vehicle: '',
    plates: '',
    license_number: '',
    active: true,
};

export type {
    ICarrier,
    IPartialCarrier,
};

export {
    defaultValueCarrier,
    defaultValuePartialCarrier,
};
