import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import ImageHandler from "../../../../classes/ImageHandler.js";
import { ProductDiscountRangeModel, ProductModel } from "../../../associations.js";
import { Op, QueryTypes } from "sequelize";
import { formatWithBase64 } from "../../../../scripts/formatWithBase64.js";
import sequelize from "../../../../mysql/configSequelize.js";
import sequelize2 from "sequelize";
class ProductController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ProductModel.findAll();
            if (response.length === 0) {
                res.status(200).json({ validation: "Products no found" });
                return;
            }
            const formattedProducts = await formatWithBase64(response, "photo");
            res.status(200).json(formattedProducts);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ProductModel.findOne({ where: { id } });
            if (!response) {
                res.status(200).json({ validation: "Product no found" });
                return;
            }
            const [formattedProduct] = await formatWithBase64([response], "photo");
            res.status(200).json(formattedProduct);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getByLike = async (req, res, next) => {
        const { filter } = req.params;
        try {
            const results = await ProductModel.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `${filter}%` } },
                        { description: { [Op.like]: `${filter}%` } },
                        { sku: { [Op.like]: `${filter}%` } },
                    ],
                },
                include: [
                    {
                        model: ProductDiscountRangeModel,
                        as: "product_discount_ranges",
                        attributes: ProductDiscountRangeModel.getAllFields()
                    }
                ],
                attributes: ProductModel.getAllFields(),
            });
            if (!(results.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const products = results.map(p => p.toJSON());
            const productsWithStock = await Promise.all(products.map(async (product) => {
                const stockSummary = await sequelize.query(`SELECT funct_get_info_location_stock_product(:productId) AS summary_location`, {
                    replacements: { productId: product.id },
                    type: QueryTypes.SELECT,
                });
                const summaryLocation = stockSummary[0].summary_location;
                return {
                    ...product,
                    summary_location: summaryLocation
                };
            }));
            res.status(200).json(productsWithStock);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getByLikeExcludeIds = async (req, res, next) => {
        const { filter } = req.params;
        const { excludeIds } = req.body; // o req.query según cómo lo envíes
        try {
            const results = await ProductModel.findAll({
                // logging: console.log,
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `${filter}%` } },
                        { description: { [Op.like]: `${filter}%` } },
                        { sku: { [Op.like]: `${filter}%` } },
                    ],
                    ...(excludeIds && Array.isArray(excludeIds) && excludeIds.length > 0
                        ? { id: { [Op.notIn]: excludeIds } }
                        : {}),
                },
                include: [
                    {
                        model: ProductDiscountRangeModel,
                        as: "product_discount_ranges",
                        attributes: ProductDiscountRangeModel.getAllFields(),
                    },
                ],
                attributes: [
                    ...ProductModel.getAllFields(),
                    [
                        sequelize2.literal("funct_get_stock_available_of_pop_on_location(`ProductModel`.`id`)"),
                        "stock_available"
                    ],
                    [
                        sequelize2.literal("funct_get_info_location_stock_product(`ProductModel`.`id`)"),
                        "summary_location"
                    ]
                ],
            });
            if (!(results.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const products = results.map((p) => p.toJSON());
            res.status(200).json(products);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getProductsByExcludeIds = async (req, res, next) => {
        const raw = req.query.excludeIds;
        const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const ids = arr.map(Number).filter(Number.isFinite);
        try {
            const results = await ProductModel.findAll({
                where: { id: { [Op.notIn]: ids } },
                attributes: ProductModel.getAllFields()
            });
            if (!(results.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const products = results.map((p) => p.toJSON());
            res.status(200).json(products);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getByName = async (req, res, next) => {
        const { name } = req.params;
        try {
            const response = await ProductModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Product no found" });
                return;
            }
            const [formattedProduct] = await formatWithBase64([response], "photo");
            res.status(200).json(formattedProduct);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { name, description, type, sku, active, sale_price, photo } = req.body;
        try {
            const validateName = await ProductModel.findOne({ where: { name: name } });
            if (validateName) {
                await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "The name is already currently in use by a product"
                });
                return;
            }
            const response = await ProductModel.create({
                name,
                description,
                type,
                sku,
                active,
                sale_price,
                photo
            });
            if (!response) {
                await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "The product could not be created"
                });
            }
            res.status(201).json({ message: "Product created successfully" });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static update = async (req, res, next) => {
        const body = req.body;
        const { id } = req.params;
        try {
            const editableFields = ProductModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                if (update_values?.photo) {
                    await ImageHandler.removeImageIfExists(update_values.photo);
                }
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            if (update_values?.name) {
                const validateName = await ProductModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    if (update_values?.photo) {
                        await ImageHandler.removeImageIfExists(update_values.photo);
                    }
                    res.status(200).json({
                        validation: "The name is already currently in use by a product"
                    });
                    return;
                }
            }
            const response = await ProductModel.update(update_values, { where: { id: id } });
            if (!(response[0] > 0)) {
                if (update_values?.photo) {
                    await ImageHandler.removeImageIfExists(update_values.photo);
                }
                res.status(200).json({
                    validation: "No changes were made to the product"
                });
                return;
            }
            if (update_values?.photo) {
                await ImageHandler.removeImageIfExists(validateProduct.toJSON().photo);
            }
            res.status(200).json({ message: "Product updated successfully" });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validateProduct = await ProductModel.findByPk(id);
            if (!validateProduct) {
                res.status(200).json({
                    validation: "Product not found"
                });
                return;
            }
            const validateDeleteProduct = await sequelize.query(`SELECT func_validate_delete_product(:id) `
                + `AS validate_delete_product;`, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            });
            const validateDeleteProductInfo = validateDeleteProduct.shift();
            const { pending_production_qty, inventory_qty } = validateDeleteProductInfo.validate_delete_product;
            if (pending_production_qty > 0 || inventory_qty > 0) {
                res.status(400).json({
                    validation: `This product cannot be deleted because it ` +
                        `has pending production orders or existing `
                        + ` inventory in one or more locations.`
                });
                return;
            }
            const response = await ProductModel.destroy({ where: { id: id } });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Product not found for deleted"
                });
                return;
            }
            await ImageHandler
                .removeImageIfExists(validateProduct.toJSON().photo);
            res.status(200).json({
                message: "Product deleted successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static getDiscountsRanges = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ProductModel.findAll({
                where: { id: id },
                attributes: ProductModel.getAllFields(),
                include: [{
                        model: ProductDiscountRangeModel,
                        as: "product_discount_ranges",
                        attributes: ProductDiscountRangeModel.getAllFields()
                    }]
            });
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "Product discounts ranges not found for this product"
                });
                return;
            }
            const discountRanges = await formatWithBase64(response, "photo");
            res.status(200).json(discountRanges);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
}
export default ProductController;
