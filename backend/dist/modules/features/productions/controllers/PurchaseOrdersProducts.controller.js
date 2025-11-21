import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { PurchaseOrderProductModel, PurchasedOrderModel, ProductModel, ClientModel, ClientAddressesModel, ShippingOrderPurchaseOrderProductModel, PurchasedOrdersProductsLocationsProductionLinesModel, ProductionLineModel, LocationsProductionLinesModel, LocationModel } from "../../../associations.js";
import { validateSafeParseAsync } from "../schemas/PurchaseOrderProduct.schema.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { Op, QueryTypes } from "sequelize";
class PurchaseOrderProductController {
    static getAll = async (req, res, next) => {
        try {
            const response = await PurchaseOrderProductModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "PurchasedOrder-Product no found"
                });
                return;
            }
            const relationship = response.map(lp => lp.toJSON());
            res.status(200).json(relationship);
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
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await PurchaseOrderProductModel.findByPk(id);
            if (!response) {
                res.status(200).json({
                    validation: "PurchasedOrder-Product relationship no found"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
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
    static getPopsByClientAddress = async (req, res, next) => {
        const { client_address_id } = req.params;
        try {
            const response = await PurchaseOrderProductModel.findAll({
                attributes: PurchaseOrderProductModel
                    .getAllFields(),
                include: [
                    {
                        model: PurchasedOrderModel,
                        as: "purchase_order",
                        required: true,
                        attributes: PurchasedOrderModel
                            .getAllFields(),
                        include: [
                            {
                                model: ClientModel,
                                as: "client",
                                attributes: ClientModel
                                    .getAllFields()
                            },
                            {
                                model: ClientAddressesModel,
                                as: "client_address",
                                attributes: ClientAddressesModel
                                    .getAllFields(),
                                where: {
                                    id: client_address_id
                                },
                                required: true
                            }
                        ]
                    },
                    {
                        model: ShippingOrderPurchaseOrderProductModel,
                        as: "shipping_order_purchase_order_product",
                        attributes: ShippingOrderPurchaseOrderProductModel
                            .getAllFields()
                    },
                    {
                        model: PurchasedOrdersProductsLocationsProductionLinesModel,
                        as: "purchase_order_product_location_production_line",
                        attributes: PurchasedOrdersProductsLocationsProductionLinesModel
                            .getAllFields(),
                        include: [
                            {
                                model: ProductionLineModel,
                                as: "production_line",
                                attributes: ProductionLineModel
                                    .getAllFields(),
                                include: [
                                    {
                                        model: LocationsProductionLinesModel,
                                        as: "location_production_line",
                                        attributes: LocationsProductionLinesModel
                                            .getAllFields(),
                                        include: [
                                            {
                                                model: LocationModel,
                                                as: "location",
                                                attributes: LocationModel
                                                    .getAllFields()
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (!(response.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const pos = response.map((po) => po.toJSON());
            res.status(200).json(pos);
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
    static getByIdPO = async (req, res, next) => {
        const { purchase_order_id } = req.params;
        try {
            const response = await PurchaseOrderProductModel.findAll({
                where: {
                    purchase_order_id: purchase_order_id
                }
            });
            if (!response) {
                res.status(200).json([]);
                return;
            }
            const pos = response.map((po) => po.toJSON());
            res.status(200).json(pos);
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
        const { purchase_order_id, product_id, qty, status } = req.body;
        try {
            const [validatePurchaseOrder, validateProduct] = await Promise.all([
                PurchasedOrderModel.findByPk(purchase_order_id),
                ProductModel.findByPk(product_id)
            ]);
            if (!validatePurchaseOrder) {
                res.status(404).json({
                    validation: "The assigned purcharse order does not exist"
                });
                return;
            }
            if (!validateProduct) {
                res.status(404).json({
                    validation: "The assigned product does not exist"
                });
                return;
            }
            const validation = await PurchaseOrderProductModel.findOne({
                where: {
                    [Op.and]: [
                        { purchase_order_id: purchase_order_id },
                        { product_id: product_id }
                    ]
                }
            });
            if (validation) {
                res.status(409).json({
                    validation: "PurchasedOrder-Product relationship already exists"
                });
                return;
            }
            const recorded_price = Number(validateProduct.toJSON().sale_price);
            const product_name = validateProduct.toJSON().name;
            const response = await PurchaseOrderProductModel.create({
                purchase_order_id,
                product_id,
                qty,
                recorded_price,
                product_name: product_name ?? "",
                status: status || "pending",
                original_price: recorded_price
            });
            if (!response) {
                res.status(400).json({
                    validation: "The purchaseOrder-product could not be created"
                });
                return;
            }
            const pop = response.dataValues;
            // const pop = response.toJSON();
            await sequelize.query(`CALL validate_order_completed(:order_id, :order_type);`, {
                replacements: {
                    order_id: pop.id,
                    order_type: 'client'
                }
            });
            res.status(200).json({
                validation: "PurchasedOrder-Product relationship created successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
                console.log(error.message);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static createBatchToPurchaseOrder = async (req, res, next) => {
        const { purchase_order_id } = req.params;
        const { products } = req.body; // Espera un array de objetos { product_id, qty }
        if (!Array.isArray(products) || products.length === 0) {
            res.status(400).json({
                validation: "Invalid or empty product list."
            });
            return;
        }
        try {
            const productIds = products.map(p => Number(p.product_id));
            const [validatePurchaseOrder, existingProducts] = await Promise.all([
                PurchasedOrderModel.findByPk(purchase_order_id),
                ProductModel.findAll({
                    where: { id: { [Op.in]: productIds } }
                })
            ]);
            if (!validatePurchaseOrder) {
                res.status(404).json({
                    validation: "The assigned purchase order does not exist"
                });
                return;
            }
            if (existingProducts.length !== productIds.length) {
                res.status(409).json({
                    validation: "One or more products do not exist or are repeated"
                });
                return;
            }
            const validateExistingProductsOnOrders = await PurchaseOrderProductModel.findAll({
                where: {
                    purchase_order_id: purchase_order_id,
                    product_id: { [Op.in]: productIds }
                }
            });
            if (validateExistingProductsOnOrders.length > 0) {
                res.status(409).json({
                    validation: "One or more products already exists on Purcharsed order"
                });
                return;
            }
            const productToAdd = existingProducts.map(ep => ep.toJSON());
            const newProductsToOrders = products.map((value) => {
                const product = productToAdd.find((product) => {
                    if (Number(product.id) === Number(value.product_id))
                        return product;
                });
                if (product) {
                    value["purchase_order_id"] = Number(purchase_order_id);
                    value["recorded_price"] = Number(product.sale_price);
                    value["product_name"] = product.name;
                    return value;
                }
            });
            const validationPromises = newProductsToOrders.map(async (value) => {
                const validate = await validateSafeParseAsync(value);
                if (!validate.success) {
                    return {
                        success: false,
                        zod_errors: validate.error.errors
                    };
                }
                return { success: true };
            });
            const validationResults = await Promise.all(validationPromises);
            for (const result of validationResults) {
                if (!result.success) {
                    res.status(400).json({
                        zod_validation: result.zod_errors
                    });
                    return;
                }
            }
            const response = await PurchaseOrderProductModel.bulkCreate(newProductsToOrders);
            if (!(response.length > 0)) {
                res.status(400).json({
                    validation: "Products could not be added to the Purchased Order"
                });
                return;
            }
            res.status(201).json({
                validation: "Products successfully added to the Purchased Order"
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
    static revertProductionOfPop = async (req, res, next) => {
        const { id } = req.params;
        try {
            await sequelize.query('CALL revert_asign_purchased_order_product_after_update(:id)', {
                replacements: {
                    id: id
                },
                type: QueryTypes.RAW
            });
            res.sendStatus(200);
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
        const { id } = req.params;
        const body = req.body;
        try {
            const validateRelationship = await PurchaseOrderProductModel.findByPk(id);
            if (!validateRelationship) {
                res.status(200).json({
                    validation: "PurchasedOrder-Product relationship no found for update"
                });
                return;
            }
            const relationship = validateRelationship.toJSON();
            const editableFields = PurchaseOrderProductModel.getEditableFields();
            const fieldBlockedProduction = ["product_id", "purcahsed_order_id", "qty"];
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "No validated properties were found for updating" +
                        "the product assignment to the purchased order"
                });
                return;
            }
            const isContainBlockField = fieldBlockedProduction.some((element, index) => {
                return element in update_values;
            });
            const validateOrderHasProductionResponse = await sequelize.query("SELECT order_has_production(:order_id, :order_type) AS has_production;", {
                replacements: {
                    order_id: id,
                    order_type: "client"
                },
                type: QueryTypes.SELECT
            });
            const validateOrderHasProduction = validateOrderHasProductionResponse.shift();
            const isOrderHasProduction = validateOrderHasProduction.has_production;
            if (isContainBlockField && isOrderHasProduction === 1) {
                res.status(400).json({
                    validation: "You can't change the product, purchase order, "
                        + "or quantity because production has already "
                        + "started for this item."
                });
                return;
            }
            let props_products = {};
            if (update_values?.qty) {
                if (!(update_values.qty > 0)) {
                    res.status(200).json({
                        validation: "Quantity must be greater than zero"
                    });
                    return;
                }
            }
            if (update_values?.purchase_order_id || update_values?.product_id) {
                const [validatePurchaseOrder, validateProduct] = await Promise.all([
                    update_values?.purchase_order_id
                        ? PurchasedOrderModel.findByPk(update_values.purchase_order_id)
                        : null,
                    update_values?.product_id
                        ? ProductModel.findByPk(update_values.product_id)
                        : null
                ]);
                if (update_values?.purchase_order_id && !validatePurchaseOrder) {
                    res.status(404).json({
                        validation: "The assigned purchase order does not exist"
                    });
                    return;
                }
                if (update_values?.product_id && !validateProduct) {
                    res.status(404).json({
                        validation: "The assigned product does not exist"
                    });
                    return;
                }
                if (update_values?.product_id && validateProduct) {
                    const props = validateProduct.toJSON();
                    props_products = {
                        recorded_price: props.sale_price,
                        product_name: props.name
                    };
                }
            }
            const validateDuplicate = await PurchaseOrderProductModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            purchase_order_id: update_values.purchase_order_id
                                || relationship.purchase_order_id
                        },
                        {
                            product_id: update_values.product_id
                                || relationship.product_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(409).json({
                    validate: "PurchasedOrder-Product relationship already exists"
                });
                return;
            }
            if (isContainBlockField && isOrderHasProduction === 0) {
                await sequelize.query("CALL delete_pending_production_order_by_reference "
                    + "(:order_id, :order_type);", {
                    replacements: {
                        order_id: id,
                        order_type: "client"
                    }
                });
            }
            const response = await PurchaseOrderProductModel.update({ ...update_values, ...props_products }, { where: { id: id }, individualHooks: true });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the pruchasedorder-product "
                        + "relationship"
                });
                return;
            }
            res.status(200).json({
                message: "PurchasedOrder-Product relationship updated succefally"
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
    static deleteById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validateOrderHasProductionResponse = await sequelize.query("SELECT order_has_production(:order_id, :order_type) "
                + "AS has_production;", {
                replacements: {
                    order_id: id,
                    order_type: "client"
                },
                type: QueryTypes.SELECT
            });
            const validateOrderHasProduction = validateOrderHasProductionResponse.shift();
            const isOrderHasProduction = validateOrderHasProduction.has_production;
            if (isOrderHasProduction === 1) {
                res.status(400).json({
                    validation: "You can't delete this product order because "
                        + "production is already in progress."
                });
                return;
            }
            console.log('Eliminando...');
            const response = await PurchaseOrderProductModel.destroy({
                where: { id: id }, individualHooks: true
            });
            console.log('Eliminado...');
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "PurchasedOrder-Product relationship no found for delete"
                });
                return;
            }
            res.status(200).json({
                message: "PurchasedOrder-Producto relationship deleted successfully"
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
}
export default PurchaseOrderProductController;
