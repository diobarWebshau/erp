import type { IClientAddressesManager, IPartialClientAddress } from "./clientAddress";
import type { IPartialProductDiscountClient, IProductDiscountClientManager } from "./product-discounts-clients";

interface IClient {
    id: number;
    company_name: string;
    tax_id: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    payment_terms: string;
    credit_limit: number;
    zip_code: number;
    tax_regimen: string;
    cfdi: string;
    payment_method: string;
    street: string;
    street_number: number;
    neighborhood: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    addresses?: IPartialClientAddress[]
    addresses_update?: IClientAddressesManager,
    product_discounts_client?: IPartialProductDiscountClient[]
    product_discounts_client_manager?: IProductDiscountClientManager
}

type IPartialClient = Partial<IClient>;

const defaultValueClient: IClient = {
    id: 0,
    company_name: '',
    tax_id: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    street_number: 0,
    neighborhood: '',
    state: '',
    country: '',
    payment_terms: '',
    credit_limit: 0,
    zip_code: 0,
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
    street: '',
    street_number: 0,
    neighborhood: '',
    state: '',
    country: '',
    payment_terms: '',
    credit_limit: 0,
    zip_code: 0,
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