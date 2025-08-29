interface IPurchasedOrder {
  id: number;
  order_code: string;
  delivery_date: string;
  status: string;
  client_id: number | null;
  company_name: string;
  tax_id: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  address: string;
  payment_terms: string;
  zip_code: string;
  tax_regimen: string;
  cfdi: string;
  payment_method: string;
  client_address_id: number | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_zip_code: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

type IPartialPurchasedOrder = Partial<IPurchasedOrder>;

const defaultValuePurchasedOrder: IPurchasedOrder = {
  id: 0,
  order_code: "",
  delivery_date: "",
  status: "",
  client_id: null,
  company_name: "",
  tax_id: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  address: "",
  payment_terms: "",
  zip_code: "",
  tax_regimen: "",
  cfdi: "",
  payment_method: "",
  client_address_id: null,
  shipping_address: "",
  shipping_city: "",
  shipping_state: "",
  shipping_country: "",
  shipping_zip_code: "",
  total_price: 0,
  created_at: "",
  updated_at: ""
};

const defaultValuePartialPurchasedOrder: Partial<IPurchasedOrder> = {
  order_code: "",
  delivery_date: "",
  client_id: null,
  client_address_id: null,
  total_price: 0,
};

interface IClientAddress {
  id: number;
  client_id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
}

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
  is_active: number; // 0 o 1
  created_at: string;
  updated_at: string;
  addresses?: IClientAddress[]
}

type IPartialClient = Partial<IClient>;

const defaultValueClient: IClient = {
  id: 0,
  company_name: "",
  tax_id: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  address: "",
  payment_terms: "",
  credit_limit: 0,
  zip_code: "",
  tax_regimen: "",
  cfdi: "",
  payment_method: "",
  is_active: 1,
  created_at: "",
  updated_at: "",
};

const defaultValuePartialClient: IPartialClient = {
  company_name: "",
  tax_id: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  address: "",
  payment_terms: "",
  credit_limit: 0,
  zip_code: "",
  tax_regimen: "",
  cfdi: "",
  payment_method: "",
};


export type {
  IPurchasedOrder,
  IPartialPurchasedOrder,
  IPartialClient,
  IClient,
  IClientAddress
};

export {
  defaultValuePurchasedOrder,
  defaultValuePartialPurchasedOrder,
  defaultValueClient,
  defaultValuePartialClient
};
