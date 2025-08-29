import type {
  IPartialPurchasedOrderProduct,
  IPurchasedOrderProduct,
  IPurchasedOrderProductManager
} from "./purchasedOrdersProducts";
import type {
  IClient, IPartialClient
} from "./clients";
import type {
  IClientAddress, IPartialClientAddress
} from "./clientAddress";

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
