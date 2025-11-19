import ProductsControllers
    from "../../../core/products/controllers/index.js";
import ImageHandler
    from "../../../../classes/ImageHandler.js";
import {
    ProductModel, ProcessModel,
    InputModel,
    ProductDiscountRangeModel,
    ProductInputModel,
    ProductProcessModel,
} from "../../../associations.js";
import {
    Request, Response,
    NextFunction
} from "express";
import {
    Op,
    QueryTypes,
    Transaction
} from "sequelize";
import sequelize
    from "../../../../mysql/configSequelize.js"
import {
    ProductCreateAttributes,
    ProductDiscountRangeCreateAttributes,
    ProductInputCreateAttributes,
    ProductProcessCreateAttributes,
    ProductProcessManager,
    ProductInputManager,
    ProductDiscountRangeManager,
    ProductDiscountRangeAttributes,
    ProductProcessAttributes,
    ProductInputAttributes
} from "../../../types.js";
import {
    formatImagesDeepRecursive
} from "../../../../scripts/formatWithBase64.js";
import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import toBoolean from "../../../../scripts/toBolean.js";


class ProductVProductionController extends ProductsControllers.ProductController {
    static getInputsOfProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            const response = await ProductModel.findAll({
                where: { id: id },
                attributes: ProductModel.getAllFields(),
                include: [{
                    model: ProductInputModel,
                    as: "products_inputs",
                    attributes: ProductInputModel.getAllFields(),
                    include: [{
                        model: InputModel,
                        as: "inputs",
                        attributes: InputModel.getAllFields()
                    }],
                    where: { product_id: id },
                }],
            });
            if (!(response.length > 0)) {
                res.status(202).json({ validation: "Inputs not found for this product" });
                return;
            }
            // const inputsOfProducts = response.map(ip => ip.toJSON());
            // console.log(inputsOfProducts);
            // const inputsOfProductsDetails = await Promise.all(inputsOfProducts.map(async (product: any) => {
            //     const imagePath = product.photo;
            //     const imageBase64 = await ImageHandler.convertToBase64(imagePath);
            //     product.photo = imageBase64 || null
            //     const inputs = product.products_inputs;
            //     const inputDetails = await Promise.all(inputs.map(async (input: any) => {
            //         const imgPath = input.photo;
            //         const imgBase64 = await ImageHandler.convertToBase64(imgPath);
            //         input.photo = imgBase64;
            //         return input;
            //     }));
            //     product.products_inputs = inputDetails;
            //     return product;
            // }));
            const inputsOfProducts = response.map(ip => ip.toJSON());
            const inputsOfProductsDetails = await Promise.all(inputsOfProducts.map(async (product: any) => {
                const imagePath = product.photo;
                const imageBase64 = await ImageHandler.convertToBase64(imagePath);
                product.photo = imageBase64 || null
                const products_inputs = product.products_inputs;
                const product_inputs_details = await Promise.all(products_inputs.map(async (product_input: any) => {
                    if (Array.isArray(product_input)) {
                        const inputsDetails = await Promise.all(product_input.map(async (input: any) => {
                            const imgPath = input.photo;
                            const imgBase64 = await ImageHandler.convertToBase64(imgPath);
                            input.photo = imgBase64;
                            return input;
                        }));
                        return inputsDetails;
                    } else {
                        const input = product_input.inputs;
                        const imgPath = input.photo;
                        const imgBase64 = await ImageHandler.convertToBase64(imgPath);
                        input.photo = imgBase64;
                        product_input.inputs = input;
                        return product_input;
                    }
                }));
                product.products_inputs = product_inputs_details;
                return product;
            }));
            res.status(200).json(inputsOfProductsDetails);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static addInputToProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { id, input_id } = req.params;
        const { equivalence } = req.body;
        try {
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            const validateInput = await InputModel.findOne({ where: { id: input_id } });
            if (!validateInput) {
                res.status(200).json({ validation: "The assigned input does not exist" });
                return;
            }
            const validationExistsInputInProduct = await ProductInputModel.findOne({
                where: {
                    [Op.and]: [
                        { product_id: id },
                        { input_id: input_id }
                    ]
                }
            });
            if (validationExistsInputInProduct) {
                res.status(200).json({ validation: "The product already has that input assigned" });
                return;
            }
            if (isNaN(equivalence)) {
                res.status(200).json({ validation: "The equivalence must be numerical" })
                return;
            }
            const response = await ProductInputModel.create({
                product_id: Number(id),
                input_id: Number(input_id),
                equivalence: Number(equivalence)
            });
            if (!response) {
                res.status(200).json({ validation: "The input could not be added to the product" });
                return;
            }
            res.status(200).json({ message: "The input has been assigned to the product" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static deleteInput = async (req: Request, res: Response, next: NextFunction) => {
        const { id, input_id } = req.params;
        try {
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            const response = await ProductInputModel.destroy({
                where: {
                    [Op.and]: [
                        { product_id: id },
                        { input_id: input_id }
                    ]
                },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Input not found in the product to be removed" });
                return;
            }
            res.status(200).json({ message: "Input removed from product" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static EditEquivalenceInProductInput = async (req: Request, res: Response, next: NextFunction) => {
        const { id, input_id } = req.params;
        const { equivalence } = req.body;
        try {
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            const validateProductInput = await ProductInputModel.findOne({
                where: { [Op.and]: [{ product_id: id }, { input_id: input_id }] }
            })
            if (!validateProductInput) {
                res.status(200).json({ validation: "Input no found on product" })
                return;
            }
            if (isNaN(equivalence)) {
                res.status(200).json({ validation: "The equivalence must be numerical" });
                return;
            }
            const response = await ProductInputModel.update(
                { equivalence: equivalence },
                {
                    where: {
                        [Op.and]: [
                            { product_id: id },
                            { input_id: input_id }
                        ]
                    },
                    individualHooks: true
                });
            if (!(response[0] > 0)) {
                res.status(200).json({ validation: "No changes were made to the product input" });
                return;
            }
            res.status(200).json({ message: "Product input updated" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getProcessesOfProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            const response = await ProductModel.findAll({
                where: { id }, // Condición para filtrar por el id del producto
                attributes: ProductModel.getAllFields(), // Obtener todos los campos de ProductModel
                include: [
                    {
                        model: ProductProcessModel, // Incluir la tabla puente ProductProcessModel
                        as: "product_processes", // Alias de la relación uno a muchos
                        attributes: ProductProcessModel.getAllFields(), // Obtener todos los campos de la tabla ProductProcessModel
                        include: [
                            {
                                model: ProcessModel, // Incluir los procesos relacionados
                                as: "process", // Alias de la relación inversa
                                attributes: ProcessModel.getAllFields() // Obtener todos los campos de ProcessModel
                            }
                        ]
                    }
                ]
            });

            // const response = await ProductModel.findAll({
            //     where: { id },
            //     attributes: ProductModel.getAllFields(),
            //     include: [
            //         {
            //             model: ProductProcessModel,
            //             as: "products-processes",
            //             attributes: ProductProcessModel.getAllFields(),
            //             include: [{
            //                 model: ProcessModel,
            //                 as: "processes",
            //                 attributes: ProcessModel.getAllFields()
            //             }]
            //         }
            //     ]
            // });
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Processes not found for this product" });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static assignProcessToProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { id, process_id } = req.params;
        try {
            const validateProduct = await ProductModel.findOne({ where: { id: id } });
            if (!validateProduct) {
                res.status(200).json({ validation: "Product not found" });
                return;
            }
            const validateProcess = await ProcessModel.findOne({ where: { id: process_id } });
            if (!validateProcess) {
                res.status(200).json({ validation: "The assigned process does not exist" });
                return;
            }
            const validation = await ProductProcessModel.findOne({
                where: {
                    [Op.and]: [
                        { product_id: id },
                        { process_id: process_id }
                    ]
                }
            });
            if (validation) {
                res.status(200).json({ validation: "The product already has that process assigned" });
                return;
            }
            const response = await ProductProcessModel.create({
                product_id: Number(id),
                process_id: Number(process_id),
                sort_order: 1
            });
            if (!response) {
                res.status(200).json({ validation: "The process could not be added to the product" });
                return;
            }
            res.status(200).json({ message: "Process assigned successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static deleteProcess = async (req: Request, res: Response, next: NextFunction) => {
        const { id, process_id } = req.params;
        try {
            const validateProduct =
                await ProductModel.findByPk(id);

            if (!validateProduct) {
                res.status(200).json({
                    validation:
                        "Product not found"
                });
                return;
            }
            const response =
                await ProductProcessModel.destroy({
                    where: {
                        [Op.and]: [
                            { product_id: id },
                            { process_id: process_id }
                        ]
                    },
                    individualHooks: true
                });

            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Process not found in product to be deleted"
                });
                return;
            }

            res.status(200).json({
                message:
                    "Process deleted successfully"
            });

        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static createCompleteProduct =
        async (req: Request, res: Response, next: NextFunction) => {

            const {
                name, description, type,
                sku, active, sale_price, custom_id,
                photo, product_processes, products_inputs,
                product_discount_ranges, barcode
            } = req.body;

            const transaction = await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

            try {

                const [validateName, validateSku] =
                    await Promise.all([
                        ProductModel.findOne({ where: { name: name } }),
                        ProductModel.findOne({ where: { sku: sku } })
                    ]);

                if (validateName) {
                    await transaction.rollback();
                    await ImageHandler.removeImageIfExists(photo);
                    res.status(409).json({
                        validation:
                            `The name is already currently `
                            + `in use by a product`
                    });
                    return;
                }

                if (validateSku) {
                    await transaction.rollback();
                    await ImageHandler.removeImageIfExists(photo);
                    res.status(409).json({
                        validation:
                            `The sku is already currently `
                            + `in use by a product`
                    });
                    return;
                }

                const responseProduct =
                    await ProductModel.create(
                        {
                            name, description, type, custom_id,
                            sku, active, sale_price, photo,
                            barcode: barcode ?? null
                        }, {
                        individualHooks: true,
                        transaction: transaction
                    }
                    );

                if (!responseProduct) {
                    await transaction.rollback();
                    await ImageHandler.removeImageIfExists(photo);
                    res.status(400).json({
                        validation:
                            "The product could not be created"
                    });
                    return;
                }

                const product =
                    await responseProduct.toJSON();

                if (product_processes) {

                    const processesObject: ProductProcessCreateAttributes[] =
                        JSON.parse(product_processes.toString());

                    if (processesObject.length > 0) {

                        const processesIds: number[] = processesObject.map((p) => p.process?.id)
                            .filter((id): id is number => id !== undefined);

                        const responseValidationProcesses: ProductProcessModel[] =
                            await ProductProcessModel.findAll({
                                where: {
                                    product_id: product.id,
                                    process_id: processesIds
                                }
                            });

                        if (responseValidationProcesses.length > 0) {
                            await transaction.rollback();
                            await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation:
                                    `Some processes are already assigned `
                                    + `to this product`
                            });
                            return;
                        }

                        const productProcess: ProductProcessCreateAttributes[] =
                            processesObject
                                .map((p) => ({
                                    product_id: product.id,
                                    process_id: p.process?.id,
                                    sort_order: p.sort_order
                                }))
                                .filter(
                                    (p): p is ProductProcessCreateAttributes =>
                                        p.process_id !== undefined
                                );

                        const responseProcesses: ProductProcessModel[] =
                            await ProductProcessModel.bulkCreate(productProcess, {
                                individualHooks: true,
                                transaction: transaction
                            });

                        if (!responseProcesses) {
                            await transaction.rollback();
                            await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation:
                                    "The processes could not be created"
                            });
                            return;
                        }
                    }
                }

                if (products_inputs) {

                    const productsInputsObject: ProductInputCreateAttributes[] =
                        JSON.parse(products_inputs.toString());

                    if (productsInputsObject.length > 0) {

                        const inputsIds: number[] = productsInputsObject
                            .map((i) => i.inputs?.id)
                            .filter((id): id is number => id !== undefined);

                        const responseValidationInputs: ProductInputModel[] =
                            await ProductInputModel.findAll({
                                where: {
                                    product_id: product.id,
                                    input_id: inputsIds
                                }
                            });

                        if (responseValidationInputs.length > 0) {
                            await transaction.rollback();
                            await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation:
                                    "Some inputs are already assigned to this product"
                            });
                            return;
                        }

                        const productInputs = productsInputsObject
                            .map((i) => ({
                                product_id: product.id,
                                input_id: i.inputs?.id ?? null,
                                equivalence: i.equivalence
                            }))

                        const productInputsFiltered = productInputs
                            .filter(
                                (i): i is ProductInputCreateAttributes =>
                                    i.input_id !== null
                            );

                        const responseInputs: ProductInputModel[] =
                            await ProductInputModel.bulkCreate(productInputsFiltered, {
                                individualHooks: true,
                                transaction: transaction
                            });

                        if (!responseInputs) {
                            await transaction.rollback();
                            await ImageHandler.removeImageIfExists(photo);
                            console.log("Error al crear los insumos");
                            res.status(400).json({
                                validation:
                                    "The inputs could not be created"
                            });
                            return;
                        }
                    }
                }

                if (product_discount_ranges) {

                    const productDiscountRangesObject: ProductDiscountRangeCreateAttributes[] =
                        JSON.parse(product_discount_ranges.toString());

                    if (productDiscountRangesObject.length > 0) {

                        const productDiscountRanges: ProductDiscountRangeCreateAttributes[] =
                            productDiscountRangesObject
                                .map((pdr) => ({
                                    product_id: product.id,
                                    unit_price: Number(pdr.unit_price),
                                    min_qty: Number(pdr.min_qty),
                                    max_qty: Number(pdr.max_qty)
                                }));

                        const validateDiscountRanges: ProductDiscountRangeModel[] =
                            await ProductDiscountRangeModel.findAll({
                                where: {
                                    product_id: product.id,
                                    unit_price: productDiscountRanges.map((pdr) => pdr.unit_price),
                                    min_qty: productDiscountRanges.map((pdr) => pdr.min_qty),
                                    max_qty: productDiscountRanges.map((pdr) => pdr.max_qty)
                                }
                            });

                        if (validateDiscountRanges.length > 0) {
                            await transaction.rollback();
                            await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation:
                                    `Some discount ranges are already`
                                    + ` assigned to this product`
                            });
                            return;
                        }

                        const responseDiscountRanges: ProductDiscountRangeModel[] =
                            await ProductDiscountRangeModel.bulkCreate(productDiscountRanges, {
                                transaction: transaction,
                                individualHooks: true
                            });
                        if (!responseDiscountRanges) {
                            await transaction.rollback();
                            await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation:
                                    "The discount ranges could not be created"
                            });
                            return;
                        }
                    }
                }

                await transaction.commit();

                res.status(200).json({
                    message:
                        "Product created successfully"
                });

            } catch (error: unknown) {
                await transaction.rollback();
                await ImageHandler.removeImageIfExists(photo);
                if (error instanceof Error) {
                    next(error)
                } else {
                    console.error(`An unexpected error ocurred ${error}`);
                }
            }
        }


    static updateCompleteProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        let urlImageOld: string = "";
        let IsupdateImage: boolean = false;
        let isSuccessFully: boolean = false;

        const { id } = req.params;

        const productBody =
            req.body as ProductCreateAttributes;

        console.log(productBody)

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS.REPEATABLE_READ
            });

        try {

            const validateProduct: ProductModel | null =
                await ProductModel.findByPk(id);

            if (!validateProduct) {
                await transaction.rollback();
                if (productBody.photo) {
                    await ImageHandler.removeImageIfExists(productBody.photo);
                }
                res.status(404).json({
                    validation:
                        "Product not found"
                });
                return;
            }

            const product = validateProduct.toJSON();

            const editableFields =
                ProductModel.getEditableFields();
            const update_values =
                collectorUpdateFields(
                    editableFields,
                    productBody
                ) as ProductCreateAttributes;

            // console.log("valores a actualizar")
            // console.log(update_values);


            if (Object.keys(update_values).length > 0) {
                if (update_values?.name) {
                    const validateName =
                        await ProductModel.findOne({
                            where: {
                                [Op.and]: [
                                    { name: update_values.name },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateName) {
                        await transaction.rollback();
                        if (productBody?.photo) {
                            await ImageHandler
                                .removeImageIfExists(
                                    productBody.photo
                                );
                        }
                        res.status(200).json({
                            validation:
                                `The name is already currently in `
                                + ` use by a product`
                        });
                        return;
                    }
                }

                if (update_values?.sku) {
                    const validateSku =
                        await ProductModel.findOne({
                            where: {
                                [Op.and]: [
                                    { sku: update_values.sku },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateSku) {
                        await transaction.rollback();
                        if (productBody?.photo) {
                            await ImageHandler
                                .removeImageIfExists(
                                    productBody.photo
                                );
                        }
                        res.status(200).json({
                            validation:
                                `The sku is already currently in use`
                                + ` by a product`
                        });
                        return;
                    }
                }

                if (update_values?.photo) {
                    IsupdateImage = true;
                    console.log(typeof product.photo);
                    console.log(update_values.photo);
                    urlImageOld = product.photo;
                }

                if (update_values?.active) {
                    update_values.active =
                        toBoolean(update_values.active);
                }

                const responseProduct =
                    await ProductModel.update(update_values, {
                        where: { id },
                        transaction: transaction
                    });

                if (!responseProduct) {
                    await transaction.rollback();
                    if (productBody?.photo) {
                        await ImageHandler
                            .removeImageIfExists(
                                productBody.photo
                            );
                    }
                    res.status(400).json({
                        validation:
                            "The product could not be updated"
                    });
                    return;
                }

            }


            if (productBody.product_processes_updated) {

                const productProcessesObject:
                    ProductProcessManager =
                    JSON.parse(
                        productBody
                            .product_processes_updated
                            .toString()
                    );

                // console.log(productProcessesObject);

                const flagProccessUpdate = [
                    productProcessesObject.added,
                    productProcessesObject.deleted,
                    productProcessesObject.modified
                ].some((p) => p.length > 0);

                if (flagProccessUpdate) {
                    console.log("Inicio de actualizacion de procesos");
                    const adds: ProductProcessCreateAttributes[] =
                        productProcessesObject.added;
                    const deletes: ProductProcessAttributes[] =
                        productProcessesObject.deleted;
                    const modifies: ProductProcessCreateAttributes[] =
                        productProcessesObject.modified;

                    if (deletes.length > 0) {
                        console.log("Inicio de eliminacion de procesos");
                        const deleteIds: number[] =
                            deletes.map(p => p.process_id);

                        // console.log(deletes)

                        const validateProcess = await ProductProcessModel.findAll({
                            where: {
                                product_id: id,
                                process_id: deleteIds
                            },
                            transaction,
                        });

                        // console.log("validacion diobar");
                        // console.log(validateProcess);
                        // console.log(deleteIds);

                        if (validateProcess.length !== deleteIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some of the assigned processes do`
                                    + ` not exist`,
                            });
                            return;
                        }

                        // console.log(deleteIds);
                        // console.log(id);

                        const responseDelete =
                            await ProductProcessModel.destroy({
                                where: {
                                    product_id: id,
                                    process_id: deleteIds,
                                },
                                transaction,
                            });

                        // console.log(responseDelete);
                        console.log("Fin de eliminacion de procesos");
                    }

                    if (adds.length > 0) {
                        console.log("Inicio de adicion de procesos");
                        const addIds: number[] =
                            adds.map(p => p.product_id);

                        const alreadyAssigned =
                            await ProductProcessModel.findAll({
                                where: {
                                    product_id: id,
                                    process_id: addIds,
                                },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            }
                            );

                        if (alreadyAssigned.length > 0) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(409).json({
                                validation:
                                    `Some processes have already been assigned `
                                    + `to the product`,
                            });
                            return;
                        }

                        const assignments: ProductProcessCreateAttributes[] =
                            adds.map((e: ProductProcessCreateAttributes) => ({
                                product_id: Number(id),
                                process_id: e.process_id,
                                sort_order: e.sort_order,
                            }
                            ));

                        // console.log(assignments);
                        // console.log("Entro");
                        const responseAdd =
                            await ProductProcessModel
                                .bulkCreate(assignments, {
                                    transaction
                                });
                        // console.log("Salio");

                        if (!responseAdd) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The processes could not be `
                                    + `added to the product`
                            });
                            return;
                        }
                        console.log("Fin de adicion de procesos");
                    }

                    if (modifies.length > 0) {

                        const modifyIds: number[] =
                            modifies.filter(p => p.id !== undefined)
                                .map(p => p.id as number);

                        const validateProductProcess: ProductProcessModel[] =
                            await ProductProcessModel.findAll({
                                where: { id: modifyIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });
                        if (validateProductProcess.length !== modifyIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some of the assigned processes do`
                                    + ` not exist`,
                            });
                            return;
                        }

                        const results = [];
                        for (const p of modifies) {
                            const productProcess: number = p.id!;
                            const { id: _, ...rest } = p;
                            console.log(productProcess);
                            console.log(rest);
                            const result =
                                await ProductProcessModel
                                    .update(rest, {
                                        where: { id: productProcess },
                                        transaction,
                                    });
                            results.push(result);
                        }

                        // const responsesELECT = await ProductProcessModel.findAll({
                        //     where: { id: modifyIds },
                        //     transaction,
                        //     lock: transaction.LOCK.SHARE,
                        // });

                        // console.log(responsesELECT.map(p => p.toJSON()));

                        // console.log(results);

                        const allUpdated =
                            results.every(
                                ([affectedCount]) => affectedCount > 0
                            );

                        // console.log(allUpdated);

                        if (!allUpdated) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The processes could not be `
                                    + `modified for the product`
                            });
                            return;
                        }
                    }
                }
                console.log("Fin de actualizacion de procesos");
            }

            if (productBody.product_discount_ranges_updated) {
                const productDiscountRangesObject:
                    ProductDiscountRangeManager =
                    JSON.parse(
                        productBody
                            .product_discount_ranges_updated
                            .toString()
                    );
                const flagDiscountRangeUpdate: boolean = [
                    productDiscountRangesObject.added,
                    productDiscountRangesObject.deleted,
                    productDiscountRangesObject.modified
                ].some((p) => p.length > 0);

                if (flagDiscountRangeUpdate) {

                    console.log("Inicio de actualizacion de rangos de descuento");
                    const adds: ProductDiscountRangeCreateAttributes[] =
                        productDiscountRangesObject.added;
                    const deletes: ProductDiscountRangeAttributes[] =
                        productDiscountRangesObject.deleted;
                    const modifies: ProductDiscountRangeCreateAttributes[] =
                        productDiscountRangesObject.modified;

                    if (modifies.length > 0) {

                        console.log("Inicio de modificacion de rangos de descuento");

                        const modifiesFiltered: ProductDiscountRangeCreateAttributes[] =
                            modifies.filter(p => p.id !== undefined);

                        const modifyIds: number[] =
                            modifiesFiltered.map(p => p.id as number);

                        const validateProductDiscountRange: ProductDiscountRangeModel[] =
                            await ProductDiscountRangeModel.findAll({
                                where: { id: modifyIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (
                            validateProductDiscountRange.length
                            !== modifyIds.length
                        ) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some of the assigned discount `
                                    + `ranges do not exist`,
                            });
                            return;
                        }

                        const conflictingDiscountRanges: ProductDiscountRangeModel[] =
                            await ProductDiscountRangeModel.findAll({
                                where: {
                                    product_id: id,
                                    unit_price: modifies.map(m => m.unit_price),
                                    id: { [Op.notIn]: modifyIds },
                                },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (conflictingDiscountRanges.length > 0) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `Some of the discount ranges you are trying`
                                    + ` to modify do not exist`,
                            });
                            return;
                        }

                        console.log(modifies)

                        const results = await Promise.all(
                            modifies.map(async (val) => {
                                const discountRangeId: number = val.id!;
                                const { id: _, ...rest } = val;
                                return ProductDiscountRangeModel.update({
                                    ...rest,
                                    product_id: Number(id)
                                }, {
                                    where: { id: discountRangeId },
                                    transaction,
                                });
                            })
                        );

                        console.log(results)

                        const allUpdated =
                            results.every(
                                ([affectedCount]) => affectedCount > 0
                            );

                        if (!allUpdated) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The discount ranges could not be `
                                    + `modified for the product`
                            });
                            return;
                        }
                        console.log("Fin de modificacion de rangos de descuento");
                    }

                    if (deletes.length > 0) {

                        console.log("Inicio de eliminacion de rangos de descuento");

                        const deletesFiltered: ProductDiscountRangeAttributes[] =
                            deletes.filter(p => p.id !== undefined);

                        const deleteIds: number[] =
                            deletesFiltered.map(p => p.id!);

                        const validateProductDiscountRange =
                            await ProductDiscountRangeModel.findAll({
                                where: { id: deleteIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (
                            validateProductDiscountRange.length
                            !== deleteIds.length
                        ) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some of the assigned discount `
                                    + `ranges do not exist`,
                            });
                            return;
                        }

                        const deletedCount: number =
                            await ProductDiscountRangeModel.destroy({
                                where: { id: deleteIds },
                                transaction,
                            });

                        const allDeleted: boolean
                            = deletedCount === deleteIds.length;

                        if (!allDeleted) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The discount ranges could not be `
                                    + `deleted for the product`,
                            });
                            return;
                        }
                    }
                    console.log("Hola soy diobar")
                    console.log(adds);
                    if (adds.length > 0) {

                        console.log("Inicio de adicion de rangos de descuento");

                        const validateRangeDiscount: ProductDiscountRangeModel[] =
                            await ProductDiscountRangeModel.findAll({
                                where: { product_id: product.id }
                            });

                        if (validateRangeDiscount.length > 0) {
                            const existingRanges: ProductDiscountRangeAttributes[] =
                                validateRangeDiscount.map(rd => rd.toJSON());

                            const hasConflict = adds.some(newRange =>
                                existingRanges.some(existing => {
                                    const isOverlapping =
                                        newRange.min_qty < existing.max_qty &&
                                        newRange.max_qty > existing.min_qty;

                                    const isExactDuplicate =
                                        newRange.min_qty === existing.min_qty &&
                                        newRange.max_qty === existing.max_qty;

                                    return isOverlapping || isExactDuplicate;
                                })
                            );

                            if (hasConflict) {
                                await transaction.rollback();
                                if (productBody?.photo) {
                                    await ImageHandler
                                        .removeImageIfExists(
                                            productBody.photo
                                        );
                                }

                                res.status(200).json({
                                    validation:
                                        `A discount range overlaps or duplicates ` +
                                        `an existing one. Ensure all ranges are unique ` +
                                        `and non-overlapping.`,
                                });
                                return;
                            }

                            console.log("Hola soy diobar")


                            const productDiscountRange = adds.map((add) => ({
                                ...add,
                                product_id: Number(id),
                            }));

                            console.log(productDiscountRange);

                            const responseProductDiscountRange =
                                await ProductDiscountRangeModel.bulkCreate(productDiscountRange, {
                                    transaction,
                                });

                            console.log(responseProductDiscountRange);

                            if (responseProductDiscountRange.length > adds.length) {
                                await transaction.rollback();
                                if (productBody?.photo) {
                                    await ImageHandler
                                        .removeImageIfExists(
                                            productBody.photo
                                        );
                                }
                                res.status(400).json({
                                    validation:
                                        `The discount ranges could not be `
                                        + `added to the product`
                                });
                                return;
                            }
                        } else {

                            console.log("Hola soy diobar");

                            const productDiscountRange = adds.map((add) => ({
                                ...add,
                                product_id: Number(id),
                            }));

                            console.log(productDiscountRange);

                            const responseProductDiscountRange =
                                await ProductDiscountRangeModel.bulkCreate(
                                    productDiscountRange, {
                                    transaction,
                                });

                            console.log(responseProductDiscountRange);

                            if (responseProductDiscountRange.length > adds.length) {
                                await transaction.rollback();
                                if (productBody?.photo) {
                                    await ImageHandler
                                        .removeImageIfExists(
                                            productBody.photo
                                        );
                                }
                                res.status(400).json({
                                    validation:
                                        `The discount ranges could not be `
                                        + `added to the product`
                                });
                                return;
                            }
                        }
                        console.log("Fin de adicion de rangos de descuento");
                    }

                }
                console.log("Fin de actualizacion de rangos de descuento");
            }

            if (productBody.products_inputs_updated) {

                const productsInputsObject:
                    ProductInputManager =
                    JSON.parse(
                        productBody
                            .products_inputs_updated
                            .toString()
                    );

                const flagProductsInputsUpdate: boolean = [
                    productsInputsObject.added,
                    productsInputsObject.deleted,
                    productsInputsObject.modified
                ].some((p) => p.length > 0);

                if (flagProductsInputsUpdate) {


                    console.log("Inicio de actualizacion de insumos");

                    const adds: ProductInputCreateAttributes[] =
                        productsInputsObject.added;
                    const deletes: ProductInputAttributes[] =
                        productsInputsObject.deleted;
                    const modifies: ProductInputCreateAttributes[] =
                        productsInputsObject.modified;

                    if (modifies.length > 0) {


                        console.log("Inicio de modificacion de insumos");

                        const modifiesFiltered: ProductInputCreateAttributes[] =
                            modifies.filter(p => p.id !== undefined);

                        const modifyIds: number[] = modifiesFiltered
                            .map(m => m.id as number);

                        const existingInputs: ProductInputModel[] =
                            await ProductInputModel.findAll({
                                where: { id: modifyIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (existingInputs.length !== modifyIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some inputs you are trying`
                                    + ` to modify do not exist`,
                            });
                            return;
                        }

                        const conflictingInputs =
                            await ProductInputModel.findAll({
                                where: {
                                    product_id: id,
                                    input_id: modifies.map(m => m.input_id),
                                    id: { [Op.notIn]: modifyIds },
                                },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (conflictingInputs.length > 0) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `Some of the inputs you are trying`
                                    + ` to assign would create duplicates`,
                            });
                            return;
                        }

                        const results = await Promise.all(
                            modifies.map(val => {
                                const productInputId = val.id;
                                const { id: _, inputs, ...rest } = val;
                                return ProductInputModel.update(rest, {
                                    where: { id: productInputId },
                                    transaction,
                                });
                            })
                        );

                        const allUpdated =
                            results.every(
                                ([affectedCount]) => affectedCount > 0
                            );

                        if (!allUpdated) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The inputs could not be modified for`
                                    + ` the product`,
                            });
                            return;
                        }

                        console.log("Fin de modificacion de insumos");
                    }

                    if (deletes.length > 0) {

                        console.log("Inicio de eliminacion de insumos");

                        const deletesFiltered: ProductInputAttributes[] =
                            deletes.filter(p => p.id !== undefined);

                        const deleteIds: number[] =
                            deletesFiltered.map(p => p.id);

                        const validateProductInput =
                            await ProductInputModel.findAll({
                                where: { id: deleteIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (validateProductInput.length !== deleteIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some of the assigned inputs do`
                                    + ` not exist`,
                            });
                            return;
                        }

                        const deletedCount: number =
                            await ProductInputModel.destroy({
                                where: { id: deleteIds },
                                transaction,
                            });

                        const allDeleted: boolean
                            = deletedCount === deleteIds.length;

                        if (!allDeleted) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The inputs could not be deleted for`
                                    + ` the product`,
                            });
                            return;
                        }

                        console.log("Fin de eliminacion de insumos");
                    }

                    if (adds.length > 0) {

                        console.log("Inicio de adicion de insumos");

                        const addIds: number[] = adds.map(p => p.input_id);

                        const validInputs: InputModel[] =
                            await InputModel.findAll({
                                where: { id: addIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });
                        if (validInputs.length !== addIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(404).json({
                                validation:
                                    `Some of the assigned inputs do`
                                    + ` not exist`,
                            });
                            return;
                        }

                        const alreadyAssigned: ProductInputModel[] =
                            await ProductInputModel.findAll({
                                where: {
                                    product_id: id,
                                    input_id: addIds,
                                },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });
                        if (alreadyAssigned.length > 0) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `Some of the assigned inputs are `
                                    + ` already assigned to the product`,
                            });
                            return;
                        }

                        const add_values: ProductInputCreateAttributes[] =
                            adds.map((i) => ({
                                product_id: Number(id),
                                input_id: i.input_id,
                                equivalence: i.equivalence
                            }))

                        const responseProductInput: ProductInputModel[] =
                            await ProductInputModel.bulkCreate(add_values, {
                                transaction,
                            });

                        if (!responseProductInput) {
                            await transaction.rollback();
                            if (productBody?.photo) {
                                await ImageHandler
                                    .removeImageIfExists(
                                        productBody.photo
                                    );
                            }
                            res.status(400).json({
                                validation:
                                    `The inputs could not be `
                                    + `added to the product`
                            });
                            return;

                        }
                        console.log("salgo")
                        console.log("Fin de adicion de insumos");
                    }

                }
            }

            await transaction.commit();

            isSuccessFully = !isSuccessFully;

            res.status(200).json({
                message:
                    "Product updated successfully"
            });
        } catch (error: unknown) {
            await transaction.rollback();
            if (productBody?.photo) {
                await ImageHandler
                    .removeImageIfExists(
                        productBody.photo
                    );
            }
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`
                );
            }
        } finally {
            if (isSuccessFully && IsupdateImage &&
                urlImageOld !== ''
            ) {
                console.log("Eliminando imagen vieja");
                console.log(urlImageOld);
                await ImageHandler
                    .removeImageIfExists(
                        urlImageOld
                    );
            }
        }
    }

    static getInfoBestLocationOfProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            interface InfoBestLocation {
                location_id: number,
                location_name: string,
                available: number,
                product_id: number,
                product_name: string
            }

            const response: { info_best_location: InfoBestLocation }[] =
                await sequelize.query(
                    `SELECT funct_get_info_location_stock_product(:id)`
                    + ` AS info_best_location`, {
                    replacements: { id },
                    type: QueryTypes.SELECT
                });

            const data: InfoBestLocation =
                response[0].info_best_location;

            console.log(data);

            res.status(200).json(data);
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`
                );
            }
        }
    }

    static getProductDetails = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            const response = await ProductModel.findOne({
                where: { id },
                attributes: ProductModel.getAllFields(),
                include: [
                    {
                        model: ProductProcessModel,
                        as: "product_processes",
                        include: [{
                            model: ProcessModel,
                            as: "process",
                            attributes: ProcessModel.getAllFields()
                        }]
                    },
                    {
                        model: ProductInputModel,
                        as: "products_inputs",
                        include: [{
                            model: InputModel,
                            as: "inputs",
                            attributes: InputModel.getAllFields()
                        }]
                    },
                    {
                        model: ProductDiscountRangeModel,
                        as: "product_discount_ranges",
                    }
                ]
            });

            if (!response) {
                // res.status(404).json({
                //     validation:
                //         "Product not found"
                // });
                res.status(200).json(null);
                return;
            }

            const formattedResponse =
                await formatImagesDeepRecursive([response], ["photo", "path"]);
            res.status(200).json(formattedResponse[0]);
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}

export default ProductVProductionController;