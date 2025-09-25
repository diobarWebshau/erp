// interfaces/inventoryTransfer.ts

import type { ILocation } from "./locations";

interface IInventoryTransfer {
    id: number;
    item_type: 'product' | 'input';
    item_id: number;
    item_name: string;
    qty: number;
    destination_location_id: number | null;
    source_location_id: number | null;
    reason: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    destination_location?: ILocation;
    source_location?: ILocation;
  }
  
  type IPartialInventoryTransfer = Partial<IInventoryTransfer>;
  
  const defaultValueInventoryTransfer: IInventoryTransfer = {
    id: 0,
    item_type: 'product',
    item_id: 0,
    item_name: '',
    qty: 0,
    destination_location_id: null,
    source_location_id: null,
    reason: '',
    status: '',
    created_at: '',
    updated_at: '',
  };
  
  const defaultValuePartialInventoryTransfer: IPartialInventoryTransfer = {
    item_type: 'product',
    item_id: 0,
    item_name: '',
    qty: 0,
    destination_location_id: null,
    source_location_id: null,
    reason: '',
    status: '',
  };
  
  export type {
    IInventoryTransfer,
    IPartialInventoryTransfer,
  };
  
  export {
    defaultValueInventoryTransfer,
    defaultValuePartialInventoryTransfer,
  };
  