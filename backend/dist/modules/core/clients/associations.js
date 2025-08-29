import ClientModel from "./models/base/Clients.model.js";
import ClientAddressesModel from "./models/references/ClientAddress.model.js";
// Associations for ClientAddressesModel- ClientModel
// Un cliente puede tener muchas direcciones
// Una direccion pertenece a un cliente
ClientModel.hasMany(ClientAddressesModel, {
    foreignKey: "client_id",
    as: "addresses",
});
ClientAddressesModel.belongsTo(ClientModel, {
    foreignKey: "client_id",
    onDelete: "CASCADE",
    as: "client"
});
export { ClientModel, ClientAddressesModel };
