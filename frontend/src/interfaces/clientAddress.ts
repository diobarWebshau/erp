interface IClientAddress {
    id: number | string;
    client_id: number;
    address: string;
    street: string;
    street_number: number | null;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zip_code: number | null;
    created_at: string;
    updated_at: string;
}

type IPartialClientAddress =
    Partial<IClientAddress>;

interface IClientAddressesManager {
    added: IPartialClientAddress[];
    deleted: IClientAddress[];
    modified: IPartialClientAddress[];
}

const defaultValueClientAddress:
    IClientAddress = {
    id: 0,
    client_id: 0,
    address: '',
    street: '',
    street_number: 0,
    neighborhood: '',
    city: '',
    state: '',
    country: '',
    zip_code: null,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialClientAddress:
    IPartialClientAddress = {
    client_id: 0,
    address: '',
    street: '',
    street_number: null,
    neighborhood: '',
    city: '',
    state: '',
    country: '',
    zip_code: null,
};

export type {
    IClientAddress,
    IPartialClientAddress,
    IClientAddressesManager
};

export {
    defaultValueClientAddress,
    defaultValuePartialClientAddress,
};