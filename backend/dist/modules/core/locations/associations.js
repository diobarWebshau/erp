import LocationLocationTypeModel from "./models/junctions/locations-location-types.model.js";
import LocationTypeModel from "./models/base/LocationTypes.model.js";
import LocationModel from "./models/base/Locations.model.js";
/* Location - LocationType
    
    Una Location tiene un muchas LocationLocationType, pero LocationLocationType
    tiene solo un Location
    
    Una LocationType tiene muchas LocationLocationTypes, pero una LocationLocationType
    tiene solo un LocationType
    
    Una location puede tener muchos LocationTypes, pero un LocationType puede tener
    muchas Locations
*/
LocationModel.hasMany(LocationLocationTypeModel, {
    foreignKey: "location_id",
    as: "location_location_type"
});
LocationTypeModel.hasMany(LocationLocationTypeModel, {
    foreignKey: "location_type_id",
    as: "location_location_type"
});
LocationLocationTypeModel.belongsTo(LocationModel, {
    foreignKey: "location_id",
    as: "location",
    onDelete: "CASCADE"
});
LocationLocationTypeModel.belongsTo(LocationTypeModel, {
    foreignKey: "location_type_id",
    as: "location_type",
    onDelete: "CASCADE"
});
export { LocationModel, LocationLocationTypeModel, LocationTypeModel };
