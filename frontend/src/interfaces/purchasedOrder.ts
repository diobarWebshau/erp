import type { IPartialPurchasedOrderProduct, IPurchasedOrderProductManager } from "./purchasedOrdersProducts";
import type { IPartialClient } from "./clients";
import type { IPartialClientAddress } from "./clientAddress";

interface IPurchasedOrder {
  id: number;
  order_code?: string;
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
  street: string;
  street_number: string;
  neighborhood: string;
  zip_code: string;
  tax_regimen: string;
  cfdi: string;
  payment_method: string;
  client_address_id: number | null;
  shipping_street: string;
  shipping_street_number: string;
  payment_terms: string;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_zip_code: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  client?: IPartialClient,
  client_address?: IPartialClientAddress,
  purchase_order_products?: IPartialPurchasedOrderProduct[],
  purchase_order_product_manager?: IPurchasedOrderProductManager
}

type IPartialPurchasedOrder =
  Partial<IPurchasedOrder>;

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
  street: "",
  street_number: "",
  neighborhood: "",
  zip_code: "",
  tax_regimen: "",
  cfdi: "",
  payment_method: "",
  client_address_id: null,
  shipping_street: "",
  shipping_street_number: "",
  payment_terms: "",
  shipping_neighborhood: "",
  shipping_city: "",
  shipping_state: "",
  shipping_country: "",
  shipping_zip_code: "",
  total_price: 0,
  created_at: "",
  updated_at: ""
};

const defaultValuePartialPurchasedOrder: Partial<IPurchasedOrder> = {
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
  street: "",
  street_number: "",
  neighborhood: "",
  zip_code: "",
  tax_regimen: "",
  cfdi: "",
  payment_method: "",
  client_address_id: null,
  shipping_street: "",
  shipping_street_number: "",
  payment_terms: "",
  shipping_neighborhood: "",
  shipping_city: "",
  shipping_state: "",
  shipping_country: "",
  shipping_zip_code: "",
  total_price: 0,
  created_at: "",
  updated_at: "",
  client: undefined,
  client_address: undefined,
  purchase_order_products: [],
};

export type {
  IPurchasedOrder,
  IPartialPurchasedOrder,
};

export {
  defaultValuePurchasedOrder,
  defaultValuePartialPurchasedOrder,
};
