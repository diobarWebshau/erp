import ProductDiscountRangeModel 
    from "./models/references/ProductDiscountRanges.model.js";
import ProductModel 
    from "./models/base/Products.model.js";

/* Product - ProductDiscountRange
    Un producto puede tener muchos descuenstos por rango, mientras
    que un descuento por rango solo puede tener un producto.
*/

ProductModel.hasMany(ProductDiscountRangeModel, {
    foreignKey: "product_id",
    as: "product_discount_ranges",
    onDelete: "CASCADE"
})

ProductDiscountRangeModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product"
})

export {
    ProductModel,
    ProductDiscountRangeModel,
};