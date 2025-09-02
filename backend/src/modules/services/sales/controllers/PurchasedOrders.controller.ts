import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    PurchasedOrderModel, ClientModel,
    ClientAddressesModel,
    ProductModel,
    ProductDiscountRangeModel,
} from "../../../associations.js";
import { Request, Response, NextFunction }
    from "express";
import { Op } from "sequelize";
import {
    AppliedProductDiscountClientModel,
    AppliedProductDiscountRangeModel,
    ProductDiscountClientModel,
    PurchaseOrderProductModel
} from "../associations.js";
import sequelize from "sequelize";

class PurchasedOrderController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await PurchasedOrderModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json([]);
                return;
            }
            const purchasedOrder = response.map(c => c.toJSON());
            res.status(200).json(purchasedOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await PurchasedOrderModel.findOne({
                where: { id },
                attributes: PurchasedOrderModel.getAllFields(),
                include: [
                    {
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        attributes: [
                            ...PurchaseOrderProductModel.getAllFields(),
                            [
                                sequelize.literal("func_get_production_summary_of_pop(`purchase_order_products`.id)"),
                                "production_summary"
                            ],
                            [
                                sequelize.literal("funct_get_stock_available_of_pop_on_location(`purchase_order_products`.id)"),
                                "stock_available"
                            ],
                            [
                                sequelize.literal("func_summary_shipping_on_client_order(`purchase_order_products`.id)"),
                                "shipping_summary"
                            ]
                        ],
                        include: [
                            {
                                model: ProductModel,
                                as: "product",
                                attributes: [
                                    ...ProductModel.getAllFields(),
                                    [
                                        sequelize.literal("funct_get_info_location_stock_product(`purchase_order_products->product`.id)"),
                                        "summary_location"
                                    ]
                                ],
                                include: [
                                    {
                                        model: ProductDiscountRangeModel,
                                        as: "product_discount_ranges",
                                        attributes:
                                            ProductDiscountRangeModel.getAllFields()
                                    }
                                ]
                            },
                            {
                                model: AppliedProductDiscountClientModel,
                                as: "applied_product_discount_client",
                                attributes:
                                    AppliedProductDiscountClientModel.getAllFields(),
                                include: [
                                    {
                                        model: ProductDiscountClientModel,
                                        as: "product_discount_client",
                                        attributes:
                                            ProductDiscountClientModel.getAllFields()
                                    }
                                ]
                            },
                            {
                                model: AppliedProductDiscountRangeModel,
                                as: "applied_product_discount_range",
                                attributes:
                                    AppliedProductDiscountRangeModel.getAllFields(),
                                include: [
                                    {
                                        model: ProductDiscountRangeModel,
                                        as: "product_discount_range",
                                        attributes:
                                            ProductDiscountRangeModel.getAllFields()
                                    }
                                ]
                            }
                        ],
                    },
                    {
                        model: ClientModel,
                        as: "client",
                        attributes:
                            ClientModel.getAllFields(),
                        include: [{
                            model: ProductDiscountClientModel,
                            as: "pruduct_discounts_client",
                            attributes: ProductDiscountClientModel.getAllFields()
                        }, {
                            model: ClientAddressesModel,
                            as: "addresses",
                            attributes:
                                ClientAddressesModel.getAllFields()
                        }]
                    },
                    {
                        model: ClientAddressesModel,
                        as: "client_address",
                        attributes:
                            ClientAddressesModel.getAllFields()
                    }
                ]
            });

            if (!response) {
                res.status(404).json([]);
                return;
            }
            const purchasedOrder = response.toJSON();
            res.status(200).json(purchasedOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static getByLike = async (req: Request, res: Response, next: NextFunction) => {
        const { filter } = req.params;
        try {
            const response = await PurchasedOrderModel.findAll({
                where: {
                    [Op.or]: [
                        { order_code: { [Op.like]: `${filter}%` } },
                        { company_name: { [Op.like]: `${filter}%` } },
                        { email: { [Op.like]: `${filter}%` } },
                        { phone: { [Op.like]: `${filter}%` } },
                    ],
                },
                attributes: PurchasedOrderModel.getAllFields(),
                include: [
                    {
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        attributes: [
                            ...PurchaseOrderProductModel.getAllFields(),
                        ],
                        include: [
                            {
                                model: ProductModel,
                                as: "product",
                                attributes: [
                                    ...ProductModel.getAllFields(),
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
            const purchasedOrders = response.map(c => c.toJSON());
            res.status(200).json(purchasedOrders);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static getByClientId = async (req: Request, res: Response, next: NextFunction) => {
        const { client_id } = req.params;
        try {
            const response = await PurchasedOrderModel.findOne({ where: { client_id: client_id } });
            if (!response) {
                res.status(404).json([]);
                return;
            }
            const purchasedOrder = response.toJSON();
            res.status(200).json(purchasedOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const {
            order_code, delivery_date, status,
            client_id, client_address_id, total_price,
            created_at
        } = req.body;
        try {
            const valiadateOrderCode = await PurchasedOrderModel.findOne(
                { where: { order_code: order_code } }
            );
            if (valiadateOrderCode) {
                res.status(409).json({
                    validation:
                        "The order code is already currently in use by a purchased order"
                });
                return;
            }
            const validateClientId =
                await ClientModel.findByPk(client_id);
            if (!validateClientId) {
                res.status(404).json({
                    validation: "The assigned client does not exist"
                });
                return;
            }
            const validateClientsAddress =
                await ClientAddressesModel.findByPk(client_address_id);
            if (!validateClientsAddress) {
                res.status(404).json({
                    validation:
                        "The assigned client address does not exist"
                });
                return;
            }
            const client = validateClientId.toJSON();
            const clientAddress = validateClientsAddress.toJSON();
            const response = await PurchasedOrderModel.create({
                order_code: order_code,
                delivery_date: delivery_date,
                status: status,
                // client fields
                client_id: client.id,
                company_name: client.company_name,
                tax_id: client.tax_id,
                email: client.email,
                phone: client.phone,
                city: client.city,
                state: client.state,
                country: client.country,
                address: client.address,
                payment_terms: client.payment_terms,
                zip_code: client.zip_code,
                tax_regimen: client.tax_regimen,
                cfdi: client.cfdi,
                payment_method: client.payment_method,
                // shipping fields
                client_address_id: clientAddress.id,
                shipping_address: clientAddress.address,
                shipping_city: clientAddress.city,
                shipping_state: clientAddress.state,
                shipping_country: clientAddress.country,
                shipping_zip_code: clientAddress.zip_code,
                total_price,
                created_at: created_at,
            });
            if (!response) {
                res.status(400).json({
                    message: "The purchase order could not be created"
                });
                return;
            }
            res.status(201).json({ message: "Purchased order created successfully" })
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const { id } = req.params;

        try {
            const editableFields = PurchasedOrderModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);

            const existingOrder = await PurchasedOrderModel.findOne({ where: { id } });
            if (!existingOrder) {
                res.status(404).json({ validation: "Purchase order not found" });
                return;
            }

            const orderData = existingOrder.toJSON();

            // Validación de código de orden duplicado
            if (update_values.order_code) {
                const existingCode = await PurchasedOrderModel.findOne({
                    where: {
                        [Op.and]: [
                            { order_code: update_values.order_code },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (existingCode) {
                    res.status(409).json({
                        validation: "The order code is already currently in use by a purchased order"
                    });
                    return;
                }
            }

            // Validación y rastreo de client_id
            let updatedClientData = null;
            if (update_values.client_id) {
                const client = await ClientModel.findByPk(update_values.client_id);
                if (!client) {
                    res.status(404).json({ validation: "The assigned client does not exist" });
                    return;
                }
                updatedClientData = client.toJSON();
            }

            // Validación y rastreo de client_address_id
            let updatedClientAddressData = null;
            if (update_values.client_address_id) {
                const client_id_to_check = update_values.client_id ?? orderData.client_id;
                const address = await ClientAddressesModel.findOne({
                    where: {
                        id: update_values.client_address_id,
                        client_id: client_id_to_check
                    }
                });
                if (!address) {
                    res.status(404).json({ validation: "The assigned client address does not exist" });
                    return;
                }
                updatedClientAddressData = address.toJSON();
            }

            // Validación cruzada: si cambia client_id, asegurarse que la dirección actual pertenezca al nuevo client_id
            if (update_values.client_id && !update_values.client_address_id) {
                const addressStillValid = await ClientAddressesModel.findOne({
                    where: {
                        id: orderData.client_address_id,
                        client_id: update_values.client_id
                    }
                });
                if (!addressStillValid) {
                    res.status(400).json({
                        validation: "The current client address does not belong to the updated client"
                    });
                    return;
                }
            }

            // Asignar campos de rastreabilidad si se cambiaron client_id o client_address_id
            if (updatedClientData) {
                Object.assign(update_values, {
                    company_name: updatedClientData.company_name,
                    tax_id: updatedClientData.tax_id,
                    email: updatedClientData.email,
                    phone: updatedClientData.phone,
                    city: updatedClientData.city,
                    state: updatedClientData.state,
                    country: updatedClientData.country,
                    address: updatedClientData.address,
                    payment_terms: updatedClientData.payment_terms,
                    zip_code: updatedClientData.zip_code,
                    tax_regimen: updatedClientData.tax_regimen,
                    cfdi: updatedClientData.cfdi,
                    payment_method: updatedClientData.payment_method,
                });
            }

            if (updatedClientAddressData) {
                Object.assign(update_values, {
                    shipping_address: updatedClientAddressData.address,
                    shipping_city: updatedClientAddressData.city,
                    shipping_state: updatedClientAddressData.state,
                    shipping_country: updatedClientAddressData.country,
                    shipping_zip_code: updatedClientAddressData.zip_code,
                });
            }

            // Si no hay cambios después de todo
            if (Object.keys(update_values).length === 0) {
                res.status(200).json({
                    validation: "No changes detected. The provided values are identical to the current ones."
                });
                return;
            }

            const response = await PurchasedOrderModel.update(
                update_values,
                { where: { id }, individualHooks: true }
            );

            if (response[0] === 0) {
                res.status(200).json({ validation: "No changes were made to the purchased order" });
                return;
            }

            res.status(200).json({ message: "Purchased order updated successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };

    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await PurchasedOrderModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Purchased order not found for deleted" });
                return;
            }
            res.status(200).json({ message: "Purchased order deleted successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);;
            }
        }
    }
}
export default PurchasedOrderController;