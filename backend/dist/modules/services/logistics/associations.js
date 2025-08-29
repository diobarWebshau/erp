import ShippingOrderModel from "./models/references/ShippingOrders.model.js";
import CarrierModel from "./models/base/Carriers.model.js";
/** Carrier-ShippingOrder
 * Una shippingOrder solo tiene un carrier
 pero un Carrier puede tener muchos ShippingOrder
 */
CarrierModel.hasMany(ShippingOrderModel, {
    foreignKey: "carrier_id",
    as: "shipping_orders"
});
ShippingOrderModel.belongsTo(CarrierModel, {
    foreignKey: "carrier_id",
    as: "carrier",
    onDelete: "SET NULL"
});
export { CarrierModel, ShippingOrderModel };
