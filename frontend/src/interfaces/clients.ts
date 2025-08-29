import type {
    IClientAddressesManager,
    IPartialClientAddress
} from "./clientAddress";
import type { IPartialProductDiscountClient } from "./product-discounts-clients";

interface IClient {
    id: number;
    company_name: string;
    tax_id: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    address: string;
    payment_terms: string;
    credit_limit: number;
    zip_code: string;
    tax_regimen: string;
    cfdi: string;
    payment_method: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    addresses?: IPartialClientAddress[]
    addresses_update?: IClientAddressesManager,
    pruduct_discounts_client?: IPartialProductDiscountClient[]
}

type IPartialClient =
    Partial<IClient>;

const defaultValueClient: IClient = {
    id: 0,
    company_name: '',
    tax_id: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    address: '',
    payment_terms: '',
    credit_limit: 0,
    zip_code: '',
    tax_regimen: '',
    cfdi: '',
    payment_method: '',
    is_active: false,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialClient:        
    IPartialClient = {
    company_name: '',
    tax_id: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    address: '',
    payment_terms: '',
    credit_limit: 0,
    zip_code: '',
    tax_regimen: '',
    cfdi: '',
    payment_method: '',
    is_active: false,
};

export type {
    IClient,
    IPartialClient,
};

export {
    defaultValueClient,
    defaultValuePartialClient,
};