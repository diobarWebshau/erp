import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { ClientModel, ClientAddressesModel, ProductModel } from "../../associations.js";
import { Request, Response, NextFunction } from "express";
import { Op, QueryTypes, Transaction } from "sequelize";
import { ClientCreateAttributes, ClientAddressesManager, ClientAddressesCreateAttributes, ClientAddressesAttributes } from "../types.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { ProductDiscountClientModel } from "../../../../modules/associations.js";
import { ProductDiscountClientCreateAttributes, ProductDiscountClientManager } from "../../../types.js";

class ClientController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {

        const { filter, ...rest } = req.query as {
            filter?: string;    
        } & Partial<ClientCreateAttributes>;

        try {

            // 1️⃣ Condición base (para exclusiones)
            const excludePerField = Object.fromEntries(
                Object.entries(rest)
                    .filter(([k, v]) => v !== undefined && k !== "name")
                    .map(([k, v]) => [
                        k,
                        Array.isArray(v) ? { [Op.notIn]: v } : { [Op.ne]: v },
                    ])
            );

            // 2️⃣ Filtro de búsqueda general
            const filterConditions: any[] = [];
            if (filter && filter.trim()) {
                const f = `%${filter.trim()}%`; // busca en cualquier parte
                filterConditions.push(
                    { company_name: { [Op.like]: f } },
                    { cfdi: { [Op.like]: f } },
                    { phone: { [Op.like]: f } },
                    { email: { [Op.like]: f } },
                    { street: { [Op.like]: f } },
                    { city: { [Op.like]: f } },
                    { state: { [Op.like]: f } },
                    { country: { [Op.like]: f } },
                    { tax_id: { [Op.like]: f } },
                    { neighborhood: { [Op.like]: f } },
                    { tax_regimen: { [Op.like]: f } },
                    { payment_terms: { [Op.like]: f } },
                );
            }

            // 3️⃣ Construimos el WHERE principal
            const where: any = {
                ...excludePerField,
                ...(filterConditions.length > 0 ? { [Op.or]: filterConditions } : {}),
            };

            const response =
                await ClientModel.findAll({
                    where,
                    attributes:
                        ClientModel.getAllFields(),
                    include: [
                        {
                            model: ClientAddressesModel,
                            as: "addresses",
                            attributes:
                                ClientAddressesModel.getAllFields()
                        },
                        {
                            model: ProductDiscountClientModel,
                            as: "product_discounts_client",
                            attributes: ProductDiscountClientModel.getAllFields(),
                            include: [
                                {
                                    model: ProductModel,
                                    as: "product",
                                    attributes: ProductModel.getAllFields()
                                }
                            ]
                        },
                    ]
                });
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Clients no found" });
                return;
            }
            const clients = response.map(c => c.toJSON());
            res.status(200).json(clients);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await ClientModel.findByPk(id, {
                attributes:
                    ClientModel.getAllFields(),
                include: [
                    {
                        model: ClientAddressesModel,
                        as: "addresses",
                        attributes:
                            ClientAddressesModel.getAllFields()
                    },
                    {
                        model: ProductDiscountClientModel,
                        as: "product_discounts_client",
                        attributes: ProductDiscountClientModel.getAllFields(),
                        include: [
                            {
                                model: ProductModel,
                                as: "product",
                                attributes: ProductModel.getAllFields()
                            }
                        ]
                    },
                ]
            });
            if (!response) {
                res.status(200).json({
                    validation: "Client no found"
                });
                return;
            }
            const client = response.toJSON();
            res.status(200).json(client);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static getByCompanyName =
        async (req: Request, res: Response, next: NextFunction) => {
            const { company_name } = req.params;
            try {
                const response = await ClientModel.findOne({
                    where: { company_name: company_name }
                });
                if (!response) {
                    res.status(200).json({ validation: "Client no found" });
                    return;
                }
                const client = response.toJSON();
                res.status(200).json(client);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`An unexpected error occurred: ${error}`);
                }
            }
        }

    static getByLike = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { filter } = req.params;
        try {
            const results = await ClientModel.findAll({
                where: {
                    [Op.or]: [
                        { company_name: { [Op.like]: `${filter ?? ''}%` } },
                        { email: { [Op.like]: `${filter ?? ''}%` } },
                        { phone: { [Op.like]: `${filter ?? ''}%` } },
                    ],
                },
                attributes:
                    ClientModel.getAllFields(),
                include: [
                    {
                        model: ProductDiscountClientModel,
                        as: "product_discounts_client",
                        attributes:
                            ProductDiscountClientModel.getAllFields()
                    },
                    {
                        model: ClientAddressesModel,
                        as: "addresses",
                        attributes:
                            ClientAddressesModel.getAllFields()
                    }
                ]
            });

            if (!(results.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const clients = results.map(c => c.toJSON());
            res.status(200).json(clients);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static create =
        async (req: Request, res: Response, next: NextFunction) => {
            const {
                company_name, tax_id, email,
                phone, city, state, country,
                street, street_number, neighborhood,
                payment_terms, credit_limit,
                zip_code, tax_regimen, cfdi, payment_method
            } = req.body;
            try {
                const validateCompanyName = await ClientModel.findOne({
                    where: { company_name: company_name }
                })
                if (validateCompanyName) {
                    res.status(200).json({
                        validation:
                            "The company name is already currently in use by a client"
                    });
                    return;
                }
                const validateTaxId = await ClientModel.findOne({
                    where: { tax_id: tax_id }
                });
                if (validateTaxId) {
                    res.status(200).json({
                        validation:
                            "The tax id is already currently in use by a client"
                    });
                    return;
                }
                const response = await ClientModel.create({
                    company_name, tax_id, email,
                    phone, city, state, country,
                    street, street_number, neighborhood,
                    payment_terms, credit_limit,
                    zip_code, tax_regimen, cfdi, payment_method
                });
                if (!response) {
                    res.status(200).json({ message: "The client could not be created" });
                    return;
                }
                res.status(201).json({ message: "Client created successfully" });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`An unexpected error occurred: ${error}`);
                }
            }
        }

    static createComplete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        const {
            company_name, tax_id, email,
            phone, city, state, country,
            street, street_number, neighborhood,
            payment_terms, credit_limit,
            zip_code, tax_regimen, cfdi, payment_method,
            is_active, addresses, product_discounts_client
        } = req.body as ClientCreateAttributes;

        try {

            const validateName: ClientModel | null =
                await ClientModel.findOne({
                    where: { company_name: company_name }
                });

            if (validateName) {
                await transaction.rollback();
                res.status(409).json({
                    validation:
                        `The name is already used in `
                        + `a client`
                });
                return;
            }

            const validateTaxId: ClientModel | null =
                await ClientModel.findOne({
                    where: { tax_id: tax_id }
                });

            if (validateTaxId) {
                await transaction.rollback();
                res.status(409).json({
                    validation:
                        `The tax id is already used in `
                        + `a client`
                });
                return;
            }

            const responseClient: ClientModel | null =
                await ClientModel.create({
                    company_name, tax_id, email,
                    phone, city, state, country,
                    street, street_number, neighborhood,
                    payment_terms, credit_limit,
                    zip_code, tax_regimen, cfdi, payment_method,
                    is_active: Number(is_active) || 1,
                }, { transaction });

            if (!responseClient) {
                await transaction.rollback();
                res.status(409).json({
                    validation:
                        `The client could not be created`
                });
                return;
            }

            const client_id = responseClient.toJSON().id;

            if (addresses && addresses.length > 0) {

                const newAddress = addresses.map(
                    (a) => {
                        const { id: _, ...rest } = a;
                        return { ...rest, client_id: client_id };
                    }
                );

                const addressesCreated: ClientAddressesModel[] | null =
                    await ClientAddressesModel
                        .bulkCreate(newAddress, { transaction });

                if (addressesCreated.length
                    !== addresses.length) {
                    await transaction.rollback();
                    res.status(409).json({
                        validation:
                            `Some addresses could not be created`
                    });
                    return;
                }
            }

            if (product_discounts_client && product_discounts_client?.length > 0) {

                const discountsClients = product_discounts_client.map((p) => {
                    const { id: _, ...rest } = p;
                    return { ...rest, client_id: client_id };
                });

                const discountsClientsCreated: ProductDiscountClientModel[] | null =
                    await ProductDiscountClientModel
                        .bulkCreate(discountsClients, { transaction });

                if (discountsClientsCreated.length
                    !== product_discounts_client.length) {
                    await transaction.rollback();
                    res.status(409).json({
                        validation:
                            `Some discounts could not be created`
                    });
                    return;
                }
            }

            await transaction.commit();

            res.status(201).json({
                message:
                    "Client created successfully"
            });

        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`
                );
            }
        }
    }

    static updateComplete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;

        const completeBody = req.body as ClientCreateAttributes;

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        try {

            const validateClient =
                await ClientModel.findByPk(id);

            if (!validateClient) {
                await transaction.rollback();
                res.status(404).json({
                    validation:
                        "Client not found for update"
                });
                return;
            }

            const editableFields: string[] =
                ClientModel.getEditableFields();
            const update_values =
                collectorUpdateFields(
                    editableFields,
                    completeBody
                ) as ClientCreateAttributes;


            if (Object.keys(update_values).length > 0) {

                if (update_values?.company_name) {

                    const validateCompanyName =
                        await ClientModel.findOne({
                            where: {
                                [Op.and]: [
                                    {
                                        company_name:
                                            update_values
                                                .company_name
                                    },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateCompanyName) {
                        await transaction.rollback();
                        res.status(200).json({
                            validation:
                                `The company name is already `
                                + `currently in use by a client`
                        });
                        return;
                    }
                }

                if (update_values?.tax_id) {

                    const validateTaxId =
                        await ClientModel.findOne({
                            where: {
                                [Op.and]: [
                                    {
                                        tax_id:
                                            update_values
                                                .tax_id
                                    },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateTaxId) {
                        await transaction.rollback();
                        res.status(200).json({
                            validation:
                                `The tax id is already `
                                + `currently in use by a client`
                        });
                        return;
                    }
                }

                if (update_values?.email) {

                    const validateEmail =
                        await ClientModel.findOne({
                            where: {
                                [Op.and]: [
                                    {
                                        email:
                                            update_values
                                                .email
                                    },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateEmail) {
                        await transaction.rollback();
                        res.status(200).json({
                            validation:
                                `The email is already `
                                + `currently in use by a client`
                        });
                        return;
                    }
                }

                const responseUpdate = await ClientModel.update(
                    update_values,
                    { where: { id: id }, transaction }
                );

                if (responseUpdate[0] === 0) {
                    await transaction.rollback();
                    res.status(200).json({
                        validation:
                            "Client not found for update"
                    });
                    return;
                }
            }

            if (completeBody?.addresses_update) {

                const addressesManager =
                    completeBody.addresses_update as ClientAddressesManager;;

                const flagAddressesUpdate: boolean = [
                    addressesManager.added,
                    addressesManager.deleted,
                    addressesManager.modified
                ].some((p) => p.length > 0);

                if (flagAddressesUpdate) {

                    const add: ClientAddressesCreateAttributes[] =
                        addressesManager.added;
                    const deletes: ClientAddressesAttributes[] =
                        addressesManager.deleted;
                    const modified: ClientAddressesCreateAttributes[] =
                        addressesManager.modified;

                    if (add.length > 0) {

                        const newAddress = add.map(
                            (a) => {
                                const { id: _, ...rest } = a;
                                return { ...rest, client_id: Number(id) };
                            }
                        );

                        const responseAdd =
                            await ClientAddressesModel.bulkCreate(
                                newAddress, { transaction }
                            );

                        if (responseAdd.length !== add.length) {
                            await transaction.rollback();
                            res.status(409).json({
                                validation:
                                    `Some addresses could not be created`
                            });
                            return;
                        }
                    }

                    if (deletes.length > 0) {
                        const responseDelete =
                            await ClientAddressesModel.destroy({
                                where: { id: { [Op.in]: deletes.map(d => d.id) } },
                                transaction
                            });

                        if (!responseDelete) {
                            await transaction.rollback();
                            res.status(409).json({
                                validation:
                                    `Some addresses could not be deleted`
                            });
                            return;
                        }
                    }

                    if (modified.length > 0) {

                        const modifiedFiltered: number[] =
                            modified.filter(p => p.id !== undefined)
                                .map((p) => p.id!);

                        const validateAddresses =
                            await ClientAddressesModel.findAll({
                                where: { id: { [Op.in]: modifiedFiltered } },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (validateAddresses.length
                            !== modifiedFiltered.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation:
                                    `Some of the assigned addresses do`
                                    + ` not exist`,
                            });
                            return;
                        }

                        const results = [];

                        for (const p of modified) {
                            const addressId: number = p.id!;
                            const { id: _, ...rest } = p;
                            const result =
                                await ClientAddressesModel
                                    .update(rest, {
                                        where: { id: addressId },
                                        transaction,
                                    });
                            results.push(result);
                        }

                        const allUpdated =
                            results.every(
                                ([affectedCount]) => affectedCount > 0
                            );

                        if (!allUpdated) {
                            await transaction.rollback();
                            res.status(400).json({
                                validation:
                                    `The addresses could not be `
                                    + `modified for the client`
                            });
                            return;
                        }
                    }

                }
            }

            if (completeBody?.product_discounts_client_manager) {

                const discountsClientsManager =
                    completeBody.product_discounts_client_manager as ProductDiscountClientManager;

                const flagDiscountsClientsUpdate: boolean = [
                    discountsClientsManager.added,
                    discountsClientsManager.deleted,
                    discountsClientsManager.modified
                ].some((p) => p.length > 0);

                if (flagDiscountsClientsUpdate) {

                    const added = discountsClientsManager.added;
                    const deleted = discountsClientsManager.deleted;
                    const modified = discountsClientsManager.modified;

                    if (added.length > 0) {

                        const newDiscountsClients = added.map((p) => {
                            const { id: _, ...rest } = p;
                            return { ...rest, client_id: Number(id) };
                        });

                        const discountsClientsCreated: ProductDiscountClientModel[] | null =
                            await ProductDiscountClientModel
                                .bulkCreate(newDiscountsClients, { transaction });

                        if (discountsClientsCreated.length
                            !== added.length) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation:
                                    `Some discounts could not be created`
                            });
                            return;
                        }

                    }

                    if (deleted.length > 0) {

                        const discountsClientsDeleted: number | null =
                            await ProductDiscountClientModel
                                .destroy({
                                    where: { id: { [Op.in]: deleted.map(d => d.id) } },
                                    transaction
                                });

                        if (!discountsClientsDeleted) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation:
                                    `Some discounts could not be deleted`
                            });
                            return;
                        }

                    }

                    if (modified.length > 0) {

                        const modifiedFiltered: number[] =
                            modified.filter(p => p.id !== undefined)
                                .map(p => p.id!);

                        const validateDiscountsClients =
                            await ProductDiscountClientModel.findAll({
                                where: { id: { [Op.in]: modifiedFiltered } },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (validateDiscountsClients.length
                            !== modifiedFiltered.length) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation:
                                    `Some discounts could not be updated`
                            });
                            return;
                        }

                        const results = [];

                        for (const p of modified) {
                            const discountClientId: number = p.id!;
                            const { id: _, ...rest } = p;
                            const result =
                                await ProductDiscountClientModel
                                    .update(rest, {
                                        where: { id: discountClientId },
                                        transaction,
                                    });
                            results.push(result);
                        }

                        const allUpdated =
                            results.every(
                                ([affectedCount]) => affectedCount > 0
                            );

                        if (!allUpdated) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation:
                                    `The discounts could not be `
                                    + `modified for the client`
                            });
                            return;
                        }
                    }
                }
            }

            await transaction.commit();

            res.status(200).json({
                message:
                    "Client updated successfully"
            });

        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error occurred: `
                    + `${error}`
                );
            }
        }
    }

    static update =
        async (req: Request, res: Response, next: NextFunction) => {
            const body = req.body;
            const { id } = req.params;
            try {
                const editableFields =
                    ClientModel.getEditableFields();
                const update_values =
                    collectorUpdateFields(editableFields, body);
                if (Object.keys(update_values).length === 0) {
                    res.status(400).json({
                        validation:
                            `There are no validated client`
                            + ` properties for the update.`
                    });
                    return;
                }

                const validateClient =
                    await ClientModel.findOne({ where: { id: id } });

                if (!validateClient) {
                    res.status(200).json({
                        validation: "Client does not exist"
                    });
                    return;
                }
                if (update_values?.company_name) {
                    const validateCompanyName = await ClientModel.findOne({
                        where: {
                            [Op.and]: [
                                { company_name: update_values.company_name },
                                { id: { [Op.ne]: id } }
                            ]
                        }
                    });
                    if (validateCompanyName) {
                        res.status(200).json({
                            validation:
                                `The company name is already`
                                + ` currently in use by a client`
                        });
                        return;
                    }
                }
                if (update_values?.tax_id) {
                    const validateTaxId = await ClientModel.findOne({
                        where: {
                            [Op.and]: [
                                { tax_id: update_values.tax_id },
                                { id: { [Op.ne]: id } }
                            ]
                        }
                    });
                    if (validateTaxId) {
                        res.status(200).json({
                            validation:
                                `The tax_id is already`
                                + `currently in use by a client`
                        });
                        return;
                    }
                }
                const response = await ClientModel.update(
                    update_values,
                    {
                        where: { id: id },
                        individualHooks: true,
                    }
                );
                if (!(response[0] > 0)) {
                    res.status(200).json({
                        validation:
                            `No changes were made to the client`
                    });
                    return;
                }
                res.status(200).json({
                    message:
                        "Client updated succefally"
                });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`An unexpected error occurred: ${error}`);
                }
            }
        }
    static delete =
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            try {

                interface PurchasedOrdersActiveResponse {
                    has_pos_active: number;
                }

                const purchasedOrdersActiveResponse:
                    PurchasedOrdersActiveResponse[] =
                    await sequelize.query(
                        `SELECT funct_client_has_pos_active(${id})`
                        + ` AS has_pos_active`,
                        {
                            replacements: { id },
                            type: QueryTypes.SELECT
                        }
                    );

                const hasPosActive: PurchasedOrdersActiveResponse =
                    purchasedOrdersActiveResponse
                        .shift() as PurchasedOrdersActiveResponse;


                if (hasPosActive.has_pos_active > 0) {
                    res.status(400).json({
                        validation:
                            `The client can't be deleted because `
                            + `has active purchased orders`
                    });
                    return;
                }

                const response = await ClientModel.destroy({
                    where: { id: id },
                    individualHooks: true
                });
                if (!(response > 0)) {
                    res.status(404).json({
                        validation: "Client not found for deleted"
                    });
                    return;
                }
                res.status(200).json({
                    message:
                        "Client deleted successfully"
                });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(
                        `An unexpected error occurred:`
                        + ` ${error}`
                    );
                }
            }
        }
    static getAddresses =
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            try {
                const response =
                    await ClientModel.findOne({
                        where: { id: id },
                        attributes:
                            ClientModel
                                .getAllFields(),
                        include: [{
                            model: ClientAddressesModel,
                            as: "addresses",
                            attributes:
                                ClientAddressesModel
                                    .getAllFields()
                        }]
                    });
                if (!response) {
                    res.status(200).json({
                        validation:
                            "Addresses no found for this client"
                    });
                    return;
                }
                const addresses = response.toJSON();
                res.status(200).json(addresses);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(
                        `An unexpected error occurred: `
                        + `${error}`
                    );
                }
            }
        }
}
export default ClientController;