import sequelize 
    from "../../mysql/configSequelize.js";
// Modulos core
import { ClientModel, ClientAddressesModel } 
    from "./clients/associations.js";
import { ProductModel, ProductDiscountRangeModel } 
    from "./products/associations.js";
import { LocationModel, LocationLocationTypeModel, LocationTypeModel } 
    from "./locations/associations.js";
    
// Actualizacion de las tablas en la bd
sequelize.sync({ force: false })
    .then(() => {
        console.log("Modelos bases sincronizados correctamente");
    })
    .catch(err => {
        console.error("Error al sincronizar los modelos:", err);
    });

export {
    ClientModel, ClientAddressesModel,
    ProductModel, ProductDiscountRangeModel,
    LocationModel, LocationTypeModel, 
    LocationLocationTypeModel
}