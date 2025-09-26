interface IInventoryMovement {
    id: number;
    location_id: number | null;
    location_name: string;
    item_id: number;
    item_type: "product" | "input";
    item_name: string;
    qty: number;
    movement_type: "in" | "out";
    reference_id: number | null;
    reference_type: "Production Order" | "Order" | "Transfer" | "Purchased" | "Scrap" | "Internal Production Order";
    production_id: number | null;
    description: string | null;
    is_locked: 1 | 0;
    created_at: string;
  }
  
  type IPartialInventoryMovement = Partial<IInventoryMovement>;
  
  const defaultValueInventoryMovement: IInventoryMovement = {
    id: 0,
    location_id: null,
    location_name: '',
    item_id: 0,
    item_type: "product",
    item_name: '',
    qty: 0,
    movement_type: "in",
    reference_id: null,
    reference_type: "Purchased",
    production_id: null,
    description: '',
    is_locked: 0,
    created_at: '',
  };
  
  const defaultValuePartialInventoryMovement: IPartialInventoryMovement = {
    location_id: null,
    location_name: '',
    item_id: 0,
    item_type: "product",
    item_name: '',
    qty: 0,
    movement_type: "in",
    reference_id: null,
    reference_type: "Purchased",
    production_id: null,
    description: '',
    is_locked: 0,
  };
  
  export type {
    IInventoryMovement,
    IPartialInventoryMovement,
  };
  
  export {
    defaultValueInventoryMovement,
    defaultValuePartialInventoryMovement,
  };  