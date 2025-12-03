import { validateSafeParseAsync } from "../../../features/productions/schemas/PurchaseOrderProduct.schema.js";
import SalesControllers from "../../../services/sales/controllers/index.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { PurchasedOrderModel, ProductModel, PurchaseOrderProductModel, AppliedProductDiscountRangeModel, AppliedProductDiscountClientModel, ClientModel, ProductDiscountClientModel, ProductDiscountRangeModel, ClientAddressesModel, } from "../../../associations.js";
import { Op, QueryTypes, Transaction } from "sequelize";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
class PurchasedOrdersVProduction extends SalesControllers.PurchasedOrderController {
    static getProductsOrderProductByClientAddress = async (req, res, next) => {
        const { client_address_id } = req.params;
        try {
            const response = await PurchasedOrderModel.findAll({
                where: {
                    client_address_id
                },
                attributes: [],
                include: [
                    {
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        attributes: PurchaseOrderProductModel.getAllFields(),
                    }
                ]
            });
            if (!response) {
                res.status(404).json([]);
                return;
            }
            res.status(200).json(response.map((p) => p.toJSON()));
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
    static getProductsInOrder = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validatePurchaseOrder = await PurchasedOrderModel.findByPk(id);
            if (!validatePurchaseOrder) {
                res.status(404).json({
                    validation: "The assigned purchase order does not exist"
                });
                return;
            }
            // await sequelize.query(
            //     `CALL update_purchased_order_total_price(:param1)`, {
            //     replacements: { param1: id },
            // });
            const response = await PurchasedOrderModel.findOne({
                where: { id },
                attributes: PurchasedOrderModel.getAllFields(),
                include: [
                    {
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        attributes: PurchaseOrderProductModel.getAllFields(),
                        include: [
                            {
                                model: ProductModel,
                                as: "product",
                                attributes: ProductModel.getAllFields()
                            }
                        ]
                    }
                ]
            });
            if (!response) {
                res.status(200).json({
                    validation: "Products not found for this purchased order"
                });
                return;
            }
            res.status(200).json(response.toJSON());
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
    static addProductOnOrder = async (req, res, next) => {
        const { id, product_id, } = req.params;
        const { qty, status } = req.body;
        try {
            const validate_purchase_order_id = await PurchasedOrderModel.findOne({
                where: { id: id }
            });
            if (!validate_purchase_order_id) {
                res.status(200).json({
                    validation: "The assigned purcharse order does not exist"
                });
                return;
            }
            const validateproduct = await ProductModel.findOne({ where: { id: product_id } });
            if (!validateproduct) {
                res.status(200).json({ validation: "The assigned product does not exist" });
                return;
            }
            const validation = await PurchaseOrderProductModel.findOne({
                where: {
                    [Op.and]: [
                        { purchase_order_id: id },
                        { product_id: product_id }
                    ]
                }
            });
            if (validation) {
                res.status(200).json({ validation: "Product already exists in Purchased Order" });
                return;
            }
            const price = await ProductModel.findOne({ where: { id: product_id } });
            if (!price) {
                res.status(200).json({ validation: "The product's selling price was not found" });
                return;
            }
            const recorded_price = Number(price.toJSON().sale_price);
            const product_name = price.toJSON().name;
            const response = await PurchaseOrderProductModel.create({
                purchase_order_id: Number(id),
                product_id: Number(product_id),
                qty,
                recorded_price,
                product_name: product_name ?? "",
                status,
                original_price: recorded_price
            });
            if (!response) {
                res.status(200).json({ validation: "Product could not be added to the Purchased Order" });
                return;
            }
            // await sequelize.query(`CALL update_purchased_order_total_price(:param1)`, {
            //     replacements: { param1: id },
            // });
            res.status(200).json({ validation: "Product successfully added to the Purchased Order" });
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
    static addProductsOnOrder = async (req, res, next) => {
        const { id } = req.params;
        const { products } = req.body; // Espera un array de objetos { product_id, qty }
        if (!Array.isArray(products) || products.length === 0) {
            res.status(200).json({ validation: "Invalid or empty product list." });
            return;
        }
        try {
            const validatePurchaseOrder = await PurchasedOrderModel.findOne({ where: { id: id } });
            if (!validatePurchaseOrder) {
                res.status(200).json({ validation: "The assigned purchase order does not exist" });
                return;
            }
            const productIds = products.map(p => Number(p.product_id));
            const existingProducts = await ProductModel.findAll({ where: { id: productIds } });
            if (existingProducts.length !== productIds.length) {
                res.status(200).json({ validation: "One or more products do not exist or are repeated" });
                return;
            }
            const validateExistingProductsOnOrders = await PurchaseOrderProductModel.findAll({
                where: {
                    purchase_order_id: id,
                    product_id: {
                        [Op.in]: productIds
                    }
                }
            });
            if (validateExistingProductsOnOrders.length > 0) {
                res.status(200).json({ validation: "One or more products already exists on Purcharsed order" });
                return;
            }
            const productToAdd = existingProducts.map(ep => ep.toJSON());
            const newProductsToOrders = products.map((value) => {
                const product = productToAdd.find((product) => {
                    if (Number(product.id) === Number(value.product_id))
                        return product;
                });
                if (product) {
                    value["purchase_order_id"] = Number(id);
                    value["recorded_price"] = Number(product.sale_price);
                    value["product_name"] = product.name;
                    return value;
                }
            });
            // console.log(newProductsToOrders);
            // const newProducts = products.filter(p => !existingProductIds.includes(Number(p.product_id)));
            // if (newProducts.length === 0) {
            //     res.status(409).json({ validation: "All products already exist in the Purchased Order" });
            //     return;
            // }
            // const productPrices = existingProducts.reduce((acc, product) => {
            //     acc[product.id] = Number(product.toJSON().sale_price);
            //     return acc;
            // }, {} as Record<number, number>);
            // const productData = newProducts.map(p => ({
            //     purchase_order_id,
            //     product_id: Number(p.product_id),
            //     qty: p.qty,
            //     recorded_price: productPrices[Number(p.product_id)]
            // }));
            const validationPromises = newProductsToOrders.map(async (value) => {
                const validate = await validateSafeParseAsync(value);
                if (!validate.success) {
                    return { success: false, zod_errors: validate.error.errors };
                }
                return { success: true };
            });
            const validationResults = await Promise.all(validationPromises);
            for (const result of validationResults) {
                if (!result.success) {
                    res.status(200).json({ zod_validation: result.zod_errors });
                    return;
                }
            }
            const response = await PurchaseOrderProductModel.bulkCreate(newProductsToOrders);
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Products could not be added to the Purchased Order" });
                return;
            }
            // await sequelize.query(`CALL update_purchased_order_total_price(:param1)`, {
            //     replacements: { param1: id },
            // });
            res.status(201).json({ validation: "Products successfully added to the Purchased Order" });
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
    static removeProductsOnOrder = async (req, res, next) => {
        const { id } = req.params;
        const { products } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            res.status(200).json({ validation: "Invalid or empty product list." });
            return;
        }
        try {
            const validatePurchaseOrder = await PurchasedOrderModel.findOne({ where: { id: id } });
            if (!validatePurchaseOrder) {
                res.status(200).json({ validation: "The assigned purchase order does not exist" });
                return;
            }
            const productIds = products.map(p => Number(p.product_id));
            const existingProducts = await ProductModel.findAll({
                where: { id: productIds }
            });
            if (existingProducts.length !== productIds.length) {
                res.status(200).json({ validation: "One or more products do not exist or are repeated" });
                return;
            }
            const validateExistingProductsOnOrders = await PurchaseOrderProductModel.findAll({
                where: {
                    purchase_order_id: id,
                    product_id: {
                        [Op.in]: productIds
                    }
                }
            });
            if (validateExistingProductsOnOrders.length > 0) {
                res.status(200).json({ validation: "One or more products already exists on Purcharsed order" });
                return;
            }
            const productToAdd = existingProducts.map(ep => ep.toJSON());
            const newProductsToOrders = products.map((value) => {
                const product = productToAdd.find((product) => {
                    if (Number(product.id) === Number(value.product_id))
                        return product;
                });
                if (product) {
                    value["purchase_order_id"] = Number(id);
                    value["recorded_price"] = Number(product.sale_price);
                }
                return value;
            });
            // console.log(newProductsToOrders);
            // const newProducts = products.filter(p => !existingProductIds.includes(Number(p.product_id)));
            // if (newProducts.length === 0) {
            //     res.status(409).json({ validation: "All products already exist in the Purchased Order" });
            //     return;
            // }
            // const productPrices = existingProducts.reduce((acc, product) => {
            //     acc[product.id] = Number(product.toJSON().sale_price);
            //     return acc;
            // }, {} as Record<number, number>);
            // const productData = newProducts.map(p => ({
            //     purchase_order_id,
            //     product_id: Number(p.product_id),
            //     qty: p.qty,
            //     recorded_price: productPrices[Number(p.product_id)]
            // }));
            const validationPromises = newProductsToOrders.map(async (value) => {
                const validate = await validateSafeParseAsync(value);
                if (!validate.success) {
                    return { success: false, zod_errors: validate.error.errors };
                }
                return { success: true };
            });
            const validationResults = await Promise.all(validationPromises);
            for (const result of validationResults) {
                if (!result.success) {
                    res.status(200).json({ zod_validation: result.zod_errors });
                    return;
                }
            }
            const response = await PurchaseOrderProductModel.bulkCreate(newProductsToOrders);
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Products could not be added to the Purchased Order" });
                return;
            }
            // await sequelize.query(`CALL update_purchased_order_total_price(:param1)`, {
            //     replacements: { param1: id },
            // });
            res.status(201).json({ validation: "Products successfully added to the Purchased Order" });
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
    static removeProductOfOrder = async (req, res, next) => {
        const { id, product_id } = req.params;
        try {
            const response = await PurchaseOrderProductModel.destroy({
                where: {
                    [Op.and]: [
                        { product_id: product_id },
                        { purchase_order_id: id }
                    ]
                },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Product not found in the purchased order for deletion" });
                return;
            }
            // await sequelize.query(`CALL update_purchased_order_total_price(:param1)`, {
            //     replacements: { param1: id },
            // });
            res.status(200).json({ message: "Product successfully removed from the purchased order" });
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
    static getAllDetailsOfOrder = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validatePurchaseOrder = await PurchasedOrderModel.findOne({ where: { id: id } });
            if (!validatePurchaseOrder) {
                res.status(200).json({ validation: "The assigned purchase order does not exist" });
                return;
            }
            // await sequelize.query(`CALL update_purchased_order_total_price(:param1)`, {
            //     replacements: { param1: id },
            // });
            const response = await PurchasedOrderModel.findAll({
                where: { id },
                attributes: [...PurchasedOrderModel.getAllFields()],
                include: [
                    {
                        model: ClientModel,
                        as: "client",
                        attributes: ClientModel.getAllFields(),
                    },
                    {
                        model: ClientAddressesModel,
                        as: 'client_address',
                        attributes: ClientAddressesModel.getAllFields()
                    },
                    {
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        attributes: [...PurchaseOrderProductModel.getAllFields()],
                        include: [
                            {
                                model: ProductModel,
                                as: "product",
                                attributes: [...ProductModel.getAllFields()],
                            },
                            {
                                model: AppliedProductDiscountRangeModel,
                                as: "applied_product_discount_range",
                                include: [
                                    {
                                        model: ProductDiscountRangeModel,
                                        as: "product_discount_range",
                                        attributes: [],
                                    }
                                ],
                                attributes: [...AppliedProductDiscountRangeModel.getAllFields()],
                            },
                            {
                                model: AppliedProductDiscountClientModel,
                                as: "applied_product_discount_client",
                                include: [
                                    {
                                        model: ProductDiscountClientModel,
                                        as: "product_discount_client",
                                        attributes: [],
                                    }
                                ],
                                attributes: [...AppliedProductDiscountClientModel.getAllFields()],
                            }
                        ]
                    }
                ]
            });
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Details not found" });
                return;
            }
            const details = response.map(u => u.toJSON());
            res.status(200).json(details);
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
    static createComplete2 = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .READ_COMMITTED
        });
        let isSuccess = false;
        try {
            const { delivery_date, status, client_id, client_address_id, total_price, created_at, purchase_order_products, } = req.body;
            const objectOrderCode = await sequelize.query(`SELECT func_generate_next_purchase_order_code() AS order_code;`, {
                type: QueryTypes.SELECT,
                transaction
            });
            const orderCode = objectOrderCode[0].order_code;
            const [validateClientId, validateClientsAddress] = await Promise.all([
                ClientModel.findByPk(client_id),
                ClientAddressesModel.findByPk(client_address_id)
            ]);
            if (!validateClientId) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "The assigned client does not exist"
                });
                return;
            }
            if (!validateClientsAddress) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "The assigned client address does not exist"
                });
                return;
            }
            const client = validateClientId.toJSON();
            const clientAddress = validateClientsAddress.toJSON();
            const response = await PurchasedOrderModel.create({
                order_code: orderCode,
                delivery_date: delivery_date,
                status: status || "pending",
                // client fields
                client_id: client.id,
                company_name: client.company_name,
                tax_id: client.tax_id,
                email: client.email,
                phone: client.phone,
                city: client.city,
                state: client.state,
                country: client.country,
                street: client.street,
                street_number: client.street_number,
                neighborhood: client.neighborhood,
                payment_terms: client.payment_terms,
                zip_code: client.zip_code,
                tax_regimen: client.tax_regimen,
                cfdi: client.cfdi,
                payment_method: client.payment_method,
                // shipping fields
                client_address_id: clientAddress.id,
                shipping_street: clientAddress.street,
                shipping_street_number: clientAddress.street_number,
                shipping_neighborhood: clientAddress.neighborhood,
                shipping_city: clientAddress.city,
                shipping_state: clientAddress.state,
                shipping_country: clientAddress.country,
                shipping_zip_code: clientAddress.zip_code,
                created_at: created_at,
                total_price,
            }, { transaction });
            if (!response) {
                await transaction.rollback();
                res.status(400).json({
                    message: "The purchase order could not be created"
                });
                return;
            }
            const purchased_order_id = response.toJSON().id;
            if (!Array.isArray(purchase_order_products)
                || purchase_order_products.length === 0) {
                await transaction.rollback();
                res.status(200).json({
                    validation: "Invalid or empty product list."
                });
                return;
            }
            const productIds = purchase_order_products.map(p => Number(p.product_id));
            // Validar que los productos existan
            const existingProducts = await ProductModel.findAll({
                where: {
                    id: {
                        [Op.in]: productIds
                    }
                },
                transaction,
                lock: transaction.LOCK.SHARE,
            });
            if (existingProducts.length !== productIds.length) {
                await transaction.rollback();
                res.status(200).json({
                    validation: "One or more products do not "
                        + "exist"
                });
                return;
            }
            // Validar que los productos no esten repetidos
            const validateExistingProductsOnOrders = await PurchaseOrderProductModel.findAll({
                where: {
                    purchase_order_id: purchased_order_id,
                    product_id: {
                        [Op.in]: productIds
                    }
                }
            });
            if (validateExistingProductsOnOrders.length > 0) {
                await transaction.rollback();
                res.status(200).json({
                    validation: "One or more products already exists "
                        + "on Purcharsed order"
                });
                return;
            }
            // Crear un map para los pops para poder guardar las referencia de los precios editados
            const wasEditedMap = new Map();
            // Recorrer el array de pops y agregarlos al map
            purchase_order_products.forEach(p => {
                wasEditedMap.set(Number(p.product_id), {
                    was_price_edited_manually: p.was_price_edited_manually ?? null,
                    recorded_price: p.recorded_price,
                    original_price: p.original_price,
                    product_id: Number(p.product_id),
                    product_name: p.product_name
                });
            });
            const productToAdd = existingProducts.map(p => p.toJSON());
            const newProductsToOrders = purchase_order_products.map((value) => {
                const product = productToAdd.find((product) => {
                    if (Number(product.id) ===
                        Number(value.product_id))
                        return product;
                });
                if (product) {
                    value.purchase_order_id =
                        Number(purchased_order_id);
                    value.status = "pending";
                    return value;
                }
            });
            const responseCreatePops = await PurchaseOrderProductModel
                .bulkCreate(newProductsToOrders, { transaction });
            if (!responseCreatePops) {
                await transaction.rollback();
                res.status(200).json({
                    validation: "Some Products could not be added to "
                        + "the Purchased Order"
                });
                return;
            }
            const responseCreatePopsJSON = responseCreatePops.map(p => p.toJSON());
            for (const p of responseCreatePopsJSON) {
                const wasEdited = wasEditedMap.get(Number(p.product_id));
                // Si el precio fue editado manualmente o es el precio original, no aplicar descuentos
                if (wasEdited?.was_price_edited_manually === true
                    || wasEdited?.was_price_edited_manually === null) {
                    continue;
                }
                else {
                    // Aplicar descuentos por rango y/o cliente si existen
                    const [responseDiscountClient, responseDiscountRange] = await Promise.all([
                        ProductDiscountClientModel.findOne({
                            where: {
                                product_id: p.product_id,
                                client_id: client.id
                            }
                        }),
                        ProductDiscountRangeModel.findOne({
                            where: {
                                product_id: p.product_id,
                                min_qty: { [Op.lte]: p.qty },
                                max_qty: { [Op.gte]: p.qty }
                            }
                        })
                    ]);
                    const discountRange = responseDiscountRange?.toJSON() ?? null;
                    const discountClient = responseDiscountClient?.toJSON() ?? null;
                    if (discountRange) {
                        await AppliedProductDiscountRangeModel.create({
                            purchase_order_product_id: p.id,
                            product_discount_range_id: discountRange.id,
                            unit_discount: discountRange.unit_price,
                            min_qty: discountRange.min_qty,
                            max_qty: discountRange.max_qty,
                        }, { transaction });
                    }
                    if (discountClient) {
                        await AppliedProductDiscountClientModel.create({
                            purchase_order_product_id: p.id,
                            product_discount_client_id: discountClient.id,
                            discount_percentage: discountClient.discount_percentage,
                        }, { transaction });
                    }
                }
            }
            await transaction.commit();
            isSuccess = true;
            const newPurcahsedOrderProduct = responseCreatePopsJSON.map(p => p.id);
            // La respuesta es [ [ { conn_id: number } ], ... ]
            const responsesdadas = await sequelize.query('SELECT CONNECTION_ID() AS conn_id', { type: QueryTypes.SELECT });
            console.log('CONNECTION_ID justo antes de CALL:', responsesdadas);
            console.log(responseCreatePopsJSON);
            console.log('Antes de morir');
            if (true) {
                await sequelize.query("CALL process_purchased_order_product_multiple(:pop_ids_json)", // usa el nombre real del parámetro
                {
                    replacements: {
                        pop_ids_json: JSON.stringify(newPurcahsedOrderProduct)
                    }
                });
            }
            console.log('Despues de morir');
            const responsePurchasedOrderFeedBack = await PurchasedOrderModel.findOne({
                where: { id: purchased_order_id },
                attributes: PurchasedOrderModel.getAllFields(),
                include: [
                    {
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        attributes: PurchaseOrderProductModel.getAllFields(),
                        include: [
                            {
                                model: ProductModel,
                                as: "product",
                                attributes: ProductModel.getAllFields(),
                                include: [
                                    {
                                        model: ProductDiscountRangeModel,
                                        as: "product_discount_ranges",
                                        attributes: ProductDiscountRangeModel.getAllFields()
                                    }
                                ]
                            },
                            {
                                model: AppliedProductDiscountClientModel,
                                as: "applied_product_discount_client",
                                attributes: AppliedProductDiscountClientModel.getAllFields(),
                                include: [
                                    {
                                        model: ProductDiscountClientModel,
                                        as: "product_discount_client",
                                        attributes: ProductDiscountClientModel.getAllFields()
                                    }
                                ]
                            },
                            {
                                model: AppliedProductDiscountRangeModel,
                                as: "applied_product_discount_range",
                                attributes: AppliedProductDiscountRangeModel.getAllFields(),
                                include: [
                                    {
                                        model: ProductDiscountRangeModel,
                                        as: "product_discount_range",
                                        attributes: ProductDiscountRangeModel.getAllFields()
                                    }
                                ]
                            }
                        ],
                    },
                    {
                        model: ClientModel,
                        as: "client",
                        attributes: ClientModel.getAllFields()
                    },
                    {
                        model: ClientAddressesModel,
                        as: "client_address",
                        attributes: ClientAddressesModel.getAllFields()
                    }
                ],
            });
            const purchasedOrderFeedBackJSON = await responsePurchasedOrderFeedBack?.toJSON();
            console.log(purchasedOrderFeedBackJSON);
            res.status(200).json(purchasedOrderFeedBackJSON);
        }
        catch (error) {
            if (!isSuccess) {
                await transaction.rollback();
            }
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static updateComplete = async (req, res, next) => {
        // * Inicializar transacción
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .REPEATABLE_READ
        });
        // * obtener los parametros de la ruta y el body
        const { id } = req.params;
        const completeBody = req.body;
        try {
            // * obtener los campos editables
            const editableFields = PurchasedOrderModel.getEditableFields();
            // * filtrar los campos editables del body
            const update_values = collectorUpdateFields(editableFields, req.body);
            // * validar que la orden de compra a actualizar exista
            const responseValidatePurchaseOrder = await PurchasedOrderModel.findByPk(id, { transaction });
            if (!responseValidatePurchaseOrder) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Purchased order does not exist"
                });
                return;
            }
            const purchaseOrder = responseValidatePurchaseOrder.toJSON();
            // * validar que haya campos para actualizar
            if (Object.keys(update_values)?.length > 0) {
                // * validar que el cliente a actualizar exista
                if (update_values?.client_id) {
                    const responseValidateClient = await ClientModel.findByPk(update_values.client_id, { transaction });
                    if (!responseValidateClient) {
                        await transaction.rollback();
                        res.status(404).json({
                            validation: `The assigned client `
                                + `does not exist`
                        });
                        return;
                    }
                }
                // * validar que la direccion del cliente a actualizar exista
                if (update_values?.client_address_id) {
                    const responseValidateClientAddress = await ClientAddressesModel.findByPk(update_values.client_address_id, { transaction });
                    if (!responseValidateClientAddress) {
                        await transaction.rollback();
                        res.status(404).json({
                            validation: `The assigned client `
                                + `address does not exist`
                        });
                        return;
                    }
                }
            }
            // * actualizar la orden de compra
            const responseUpdatePurchasedOrder = await PurchasedOrderModel.update({
                ...update_values,
            }, {
                transaction,
                where: { id: purchaseOrder.id }
            });
            if (responseUpdatePurchasedOrder[0] === 0) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Purchased order does not exist"
                });
                return;
            }
            // * actualizar los productos de la orden de compra
            if (completeBody?.purchase_order_product_manager) {
                // * obtener el manager de los productos
                const popManager = completeBody?.purchase_order_product_manager;
                // * validar si hay productos para actualizar
                const flagPopUpdate = [
                    popManager.added,
                    popManager.deleted,
                    popManager.modified
                ].some((p) => p?.length > 0);
                if (flagPopUpdate) {
                    // * obtener los productos a agregar, eliminar y modificar
                    const added = popManager.added;
                    const deleted = popManager.deleted;
                    const modified = popManager.modified;
                    // * validar que existan productos a eliminar
                    if (deleted?.length > 0) {
                        // * obtener los productos validos para eliminar
                        const deleteFiltered = deleted.filter(d => d.id !== undefined);
                        console.log("deleted");
                        console.log(deleted);
                        console.log(deleteFiltered);
                        // * validar que los productos a eliminar existan
                        const responseExistingPops = await PurchaseOrderProductModel.findAll({
                            where: {
                                id: { [Op.in]: deleteFiltered.map(d => d.id) }
                            }, transaction,
                            lock: transaction.LOCK.SHARE,
                        });
                        console.log(responseExistingPops);
                        if (responseExistingPops.length !== deleteFiltered.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: `Some products of the purchase order you`
                                    + ` are trying to delete do not exist`,
                            });
                            return;
                        }
                        // * eliminar los productos de la orden de compra
                        const responseDelete = await PurchaseOrderProductModel.destroy({
                            where: {
                                id: {
                                    [Op.in]: deleteFiltered.map(d => d.id)
                                }
                            },
                            transaction
                        });
                        if (!responseDelete) {
                            await transaction.rollback();
                            res.status(400).json({
                                validation: `The purchased order products of the `
                                    + `purchase order could not be deleted`
                            });
                            return;
                        }
                    }
                    // * validar que existan productos a modificar
                    if (modified.length > 0) {
                        console.log('modified', modified);
                        // * filtrar los productos validos para modificar
                        const modifiedFiltered = modified.filter(d => d.id !== undefined);
                        // * Validar que los productos a modificar existan
                        const responseExistingPops = await PurchaseOrderProductModel.findAll({
                            where: {
                                id: { [Op.in]: modifiedFiltered.map(d => d.id) }
                            }, transaction,
                            lock: transaction.LOCK.SHARE,
                        });
                        console.log(responseExistingPops);
                        console.log(modifiedFiltered);
                        if (responseExistingPops.length !== modifiedFiltered.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: `Some products of the purchase order you`
                                    + ` are trying to modify do not exist`,
                            });
                            return;
                        }
                        // * Por seguridad se empleara un for en vez de Promise.all, para evitar problemas de deadlocks
                        // Deadlocks: varias operaciones bloquean un mismo recurso, y por ende, se bloquea la transacción provocando un error.
                        // * actualizar los productos en la compra y su precio en dado caso de descuento
                        for (const pop of modifiedFiltered) {
                            // * obtener informacion del pop con los descuentos aplicados anteriores
                            const responsePurchasedOrderProduct = await PurchaseOrderProductModel.findByPk(pop.id, {
                                include: [
                                    {
                                        model: AppliedProductDiscountClientModel,
                                        as: "applied_product_discount_client",
                                        attributes: AppliedProductDiscountClientModel
                                            .getAllFields()
                                    },
                                    {
                                        model: AppliedProductDiscountRangeModel,
                                        as: "applied_product_discount_range",
                                        attributes: AppliedProductDiscountRangeModel
                                            .getAllFields()
                                    }
                                ],
                                transaction
                            });
                            // * Validar que el pop exista, sino continuar con el siguiente ciclo
                            if (!responsePurchasedOrderProduct) {
                                continue;
                            }
                            const purchasedOrderProduct = responsePurchasedOrderProduct.toJSON();
                            // * Obtenemos unicamente los campos validos para actualizar
                            const validateField = collectorUpdateFields(PurchaseOrderProductModel
                                .getEditableFields(), pop);
                            if (Object.keys(validateField).length > 0) {
                                // * actualizacion de descuentos aplicados en el pop
                                await PurchaseOrderProductModel.update(validateField, {
                                    where: { id: pop.id },
                                    transaction
                                });
                                // MARK: !AQUI ACTUALIZAR!
                                console.log('pop', pop.was_price_edited_manually);
                                // * en el caso de true, significa que el precio se edito manualmente y ese se gestiona en el mismo registro
                                // * en el campo recorded_price
                                if (pop.was_price_edited_manually === null) {
                                    console.log('Entro', pop);
                                    // * Caso del que el nuevo precio no tiene ningun tipo de descuento aplicado
                                    // * en dado caso tenga un descuento aplicado por rango, lo eliminamos
                                    if (purchasedOrderProduct.applied_product_discount_range) {
                                        await AppliedProductDiscountRangeModel.destroy({
                                            where: { purchase_order_product_id: pop.id },
                                            transaction
                                        });
                                    }
                                    // * en dado caso tenga un descuento aplicado por cliente, lo eliminamos
                                    if (purchasedOrderProduct.applied_product_discount_client) {
                                        await AppliedProductDiscountClientModel.destroy({
                                            where: { purchase_order_product_id: pop.id },
                                            transaction
                                        });
                                    }
                                }
                                else if (pop.was_price_edited_manually === false) {
                                    // * Caso en el que tiene un descuento aplicado(client o descuento por rango)
                                    // * obtenemos el descuento aplicados en el pop anteriormente
                                    console.log('antes del error');
                                    const [responseDiscountClient, responseDiscountRange] = await Promise.all([
                                        ProductDiscountClientModel.findOne({
                                            where: {
                                                product_id: purchasedOrderProduct.product_id,
                                                client_id: purchaseOrder.client_id
                                            }
                                        }),
                                        ProductDiscountRangeModel.findOne({
                                            where: {
                                                product_id: purchasedOrderProduct.product_id,
                                                min_qty: { [Op.lte]: pop.qty },
                                                max_qty: { [Op.gte]: pop.qty }
                                            }
                                        })
                                    ]);
                                    console.log('despues del error');
                                    const discountRange = responseDiscountRange?.toJSON() ?? null;
                                    const discountClient = responseDiscountClient?.toJSON() ?? null;
                                    // * si actualmente tiene un descuento anterior aplicado y un descuento nuevo
                                    console.log(`antes del error2`);
                                    if (discountRange && purchasedOrderProduct.applied_product_discount_range) {
                                        // * si el descuento por rango es diferente al actual
                                        if (purchasedOrderProduct.applied_product_discount_range?.id !== discountRange.id) {
                                            // * eliminamos el descuento por rango anterior
                                            await AppliedProductDiscountRangeModel.destroy({
                                                where: { id: purchasedOrderProduct.applied_product_discount_range?.id },
                                                transaction
                                            });
                                            // * creamos el nuevo descuento por rango
                                            await AppliedProductDiscountRangeModel.create({
                                                purchase_order_product_id: Number(pop.id),
                                                product_discount_range_id: discountRange.id,
                                                unit_discount: discountRange.unit_price,
                                                min_qty: discountRange.min_qty,
                                                max_qty: discountRange.max_qty,
                                            }, { transaction });
                                        }
                                    }
                                    else if (discountRange) {
                                        // * si no tiene un descuento anterior aplicado y un descuento nuevo
                                        // * creamos el nuevo descuento por rango
                                        await AppliedProductDiscountRangeModel.create({
                                            purchase_order_product_id: Number(pop.id),
                                            product_discount_range_id: discountRange.id,
                                            unit_discount: discountRange.unit_price,
                                            min_qty: discountRange.min_qty,
                                            max_qty: discountRange.max_qty,
                                        }, { transaction });
                                    }
                                    console.log(`despues del error2`);
                                    console.log(`antes del error3`);
                                    // * si tiene un descuento anterior aplicado y un descuento nuevo
                                    if (discountClient && purchasedOrderProduct.applied_product_discount_client) {
                                        // * si el descuento por cliente es diferente al actual
                                        if (purchasedOrderProduct.applied_product_discount_client?.id !== discountClient.id) {
                                            await AppliedProductDiscountClientModel.destroy({
                                                where: { id: purchasedOrderProduct.applied_product_discount_client?.id },
                                                transaction
                                            });
                                            await AppliedProductDiscountClientModel.create({
                                                purchase_order_product_id: Number(pop.id),
                                                product_discount_client_id: discountClient.id,
                                                discount_percentage: discountClient.discount_percentage,
                                            }, { transaction });
                                        }
                                    }
                                    else if (discountClient) {
                                        // * si no tiene un descuento anterior aplicado y un descuento nuevo
                                        // * creamos el nuevo descuento por cliente
                                        await AppliedProductDiscountClientModel.create({
                                            purchase_order_product_id: Number(pop.id),
                                            product_discount_client_id: discountClient.id,
                                            discount_percentage: discountClient.discount_percentage,
                                        }, { transaction });
                                    }
                                    console.log(`despues del error3`);
                                }
                            }
                        }
                    }
                    if (added.length > 0) {
                        console.log('added', added);
                        // * obtenemos los productos que se van a agregar
                        const addsFiltered = added;
                        // * obtenemos los ids de los productos
                        const popProductId = addsFiltered.map(d => d.product_id);
                        // * validamos que los productos existan
                        const responseExistingProducts = await ProductModel.findAll({
                            where: {
                                id: { [Op.in]: popProductId }
                            }, transaction,
                            lock: transaction.LOCK.SHARE,
                        });
                        if (responseExistingProducts.length !== popProductId.length) {
                            await transaction.rollback();
                            res.status(200).json({
                                validation: `One or more products tried`
                                    + ` to add do not exist`
                            });
                            return;
                        }
                        const productToAdd = responseExistingProducts.map(p => p.toJSON());
                        // * Validamos que los productos no esten repetidos
                        const responseValidateExistingProductsOnOrders = await PurchaseOrderProductModel.findAll({
                            where: {
                                purchase_order_id: purchaseOrder.id,
                                product_id: {
                                    [Op.in]: popProductId
                                }
                            }
                        });
                        if (responseValidateExistingProductsOnOrders.length > 0) {
                            await transaction.rollback();
                            res.status(200).json({
                                validation: "One or more products already exists "
                                    + "on Purcharsed order"
                            });
                            return;
                        }
                        // *  Crear un map para los pops para poder guardar las referencia de los precios editados
                        const wasEditedMap = new Map();
                        // * Recorrer el array de pops y agregarlos al map
                        addsFiltered.forEach(p => {
                            wasEditedMap.set(Number(p.product_id), {
                                was_price_edited_manually: p.was_price_edited_manually ?? null,
                                recorded_price: p.recorded_price,
                                original_price: p.original_price,
                                product_id: Number(p.product_id),
                                product_name: p.product_name
                            });
                        });
                        // * Crear un array de pops para agregarlos a la orden
                        const newProductsToOrders = addsFiltered.map((value) => {
                            const product = productToAdd.find((product) => {
                                if (Number(product.id) ===
                                    Number(value.product_id))
                                    return product;
                            });
                            if (product) {
                                value.purchase_order_id =
                                    Number(purchaseOrder.id);
                                value.status = "pending";
                                value.original_price = product.sale_price ?? 0;
                                return value;
                            }
                        });
                        console.log('newProductsToOrders', newProductsToOrders);
                        // * Crear los nuevos pops
                        const responseCreatePops = await PurchaseOrderProductModel
                            .bulkCreate(newProductsToOrders, { transaction });
                        console.log('Bandera 1');
                        if (!responseCreatePops) {
                            await transaction.rollback();
                            res.status(200).json({
                                validation: "Some Products could not be added to "
                                    + "the Purchased Order"
                            });
                            return;
                        }
                        const responseCreatePopsJSON = responseCreatePops.map(p => p.toJSON());
                        console.log('Bandera 2');
                        // * Aplicar descuentos por rango y/o cliente si existen
                        for (const p of responseCreatePopsJSON) {
                            const wasEdited = wasEditedMap.get(Number(p.product_id));
                            // * Si el precio fue editado manualmente o es el precio original, no aplicar descuentos
                            if (wasEdited?.was_price_edited_manually === true
                                || wasEdited?.was_price_edited_manually === null) {
                                continue;
                            }
                            else {
                                // *Aplicar descuentos por rango y/o cliente si existen
                                const [responseDiscountClient, responseDiscountRange] = await Promise.all([
                                    ProductDiscountClientModel.findOne({
                                        where: {
                                            product_id: p.product_id,
                                            client_id: purchaseOrder.client_id
                                        }
                                    }),
                                    ProductDiscountRangeModel.findOne({
                                        where: {
                                            product_id: p.product_id,
                                            min_qty: { [Op.lte]: p.qty },
                                            max_qty: { [Op.gte]: p.qty }
                                        }
                                    })
                                ]);
                                const discountRange = responseDiscountRange?.toJSON() ?? null;
                                const discountClient = responseDiscountClient?.toJSON() ?? null;
                                // * Aplicar descuentos por rango si aplica
                                if (discountRange) {
                                    await AppliedProductDiscountRangeModel.create({
                                        purchase_order_product_id: p.id,
                                        product_discount_range_id: discountRange.id,
                                        unit_discount: discountRange.unit_price,
                                        min_qty: discountRange.min_qty,
                                        max_qty: discountRange.max_qty,
                                    }, { transaction });
                                }
                                // * Aplicar descuentos por cliente si aplica
                                if (discountClient) {
                                    await AppliedProductDiscountClientModel.create({
                                        purchase_order_product_id: p.id,
                                        product_discount_client_id: discountClient.id,
                                        discount_percentage: discountClient.discount_percentage,
                                    }, { transaction });
                                }
                            }
                        }
                        console.log('Bandera 3');
                        const newPurcahsedOrderProduct = responseCreatePopsJSON.map(p => p.id);
                        if (true) {
                            await sequelize.query(`CALL process_purchased_order_product_multiple(:ids)`, {
                                replacements: {
                                    ids: JSON.stringify(newPurcahsedOrderProduct) // convertimos el array a una instancia de un objeto JSON
                                },
                                transaction
                            });
                            console.log('Bandera 4');
                        }
                        console.log('Bandera 5');
                    }
                }
            }
            await transaction.commit();
            res.status(200).json({
                message: "Purchased Order updated successfully"
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred`
                    + ` ${error}`);
            }
        }
    };
    static deleteWhenNoProduction = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validationDelete = await sequelize.query('CALL is_start_production_purchased_order(:id)', {
                replacements: {
                    id: id
                },
                type: QueryTypes.RAW
            });
            const result = validationDelete.shift();
            const isProduced = result.is_produced;
            if (isProduced) {
                res.status(400).json({
                    validation: "This purchase order cannot be deleted " +
                        " because its production process has already started."
                });
                return;
            }
            await PurchaseOrderProductModel.destroy({
                where: {
                    purchase_order_id: id
                },
                individualHooks: true
            });
            const response = await PurchasedOrderModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Purchased order not found for deleted" });
                return;
            }
            res.status(200).json({ message: "Purchased order deleted successfully" });
        }
        catch (error) {
            console.log(error);
            if (error instanceof Error) {
                console.log(error);
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
                ;
            }
        }
    };
}
export default PurchasedOrdersVProduction;
