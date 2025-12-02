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
    ProductInputProcessModel,
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
    ProductInputAttributes,
    ProductInputProcessCreateAttributes
} from "../../../types.js";
import {
    formatImagesDeepRecursive
} from "../../../../scripts/formatWithBase64.js";
import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import toBoolean from "../../../../scripts/toBolean.js";
import { normalizeValidationArray } from "../../../../helpers/normalizeValidationArray.js";


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

    static createCompleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const {
            name, description, type, presentation, is_draft, production_cost,
            sku, active, sale_price, custom_id,
            photo, product_processes, products_inputs,
            product_discount_ranges, barcode, storage_conditions, unit_of_measure
        } = req.body;

        const transaction = await sequelize.transaction({
            isolationLevel:
                Transaction
                    .ISOLATION_LEVELS
                    .REPEATABLE_READ
        });

        try {

            if (name) {
                const validateName = await ProductModel.findOne({ where: { name: name } });
                if (validateName) {
                    await transaction.rollback();
                    if (photo) await ImageHandler.removeImageIfExists(photo);
                    res.status(409).json({
                        validation:
                            normalizeValidationArray([
                                `The name is already currently `
                                + `in use by a product`
                            ])
                    });
                    return;
                }
            }

            if (sku) {
                const validateSku = await ProductModel.findOne({ where: { sku: sku } });
                if (validateSku) {
                    await transaction.rollback();
                    if (photo) await ImageHandler.removeImageIfExists(photo);
                    res.status(409).json({
                        validation:
                            normalizeValidationArray([
                                `The sku is already currently `
                                + `in use by a product`
                            ])
                    });
                    return;
                }
            }

            const responseProduct =
                await ProductModel.create(
                    {
                        name: name ?? null,
                        description: description ?? null,
                        type: type ?? null,
                        custom_id: custom_id ?? null,
                        presentation: presentation ?? null,
                        is_draft: is_draft ?? false,
                        sku: sku ?? null,
                        active: active ?? 1,
                        sale_price: sale_price ?? null,
                        photo: photo ?? null,
                        production_cost: production_cost ?? null,
                        barcode: barcode ?? null,
                        storage_conditions: storage_conditions ?? null,
                        unit_of_measure: unit_of_measure ?? null,
                    }, {
                    individualHooks: true,
                    transaction: transaction
                }
                );

            if (!responseProduct) {
                await transaction.rollback();
                if (photo) await ImageHandler.removeImageIfExists(photo);
                res.status(400).json({
                    validation:
                        normalizeValidationArray([
                            "The product could not be created"
                        ])
                });
                return;
            }

            const product = await responseProduct.toJSON();

            if (products_inputs) {

                const productsInputsObject: ProductInputCreateAttributes[] = products_inputs;

                if (productsInputsObject.length > 0) {

                    console.log(`sjsdjasak`, productsInputsObject);
                    console.log(`sjsdjasak`, typeof productsInputsObject);

                    const inputsIds: number[] = productsInputsObject.map((i) => i.inputs?.id).filter((id): id is number => id !== undefined);

                    const responseValidationInputs: ProductInputModel[] = await ProductInputModel.findAll({
                        where: {
                            product_id: product.id,
                            input_id: inputsIds
                        },
                        transaction
                    });

                    if (responseValidationInputs.length > 0) {
                        await transaction.rollback();
                        if (photo) await ImageHandler.removeImageIfExists(photo);
                        res.status(400).json({
                            validation: normalizeValidationArray([
                                "Some inputs are already assigned to this product"
                            ])
                        });
                        return;
                    }

                    const productInputs = productsInputsObject.map((i) => ({
                        product_id: product.id,
                        input_id: i.inputs?.id ?? null,
                        equivalence: i.equivalence
                    }))

                    const productInputsFiltered = productInputs.filter(
                        (i): i is ProductInputCreateAttributes =>
                            i.input_id !== null
                    );

                    console.log(`sdasda`, productInputsFiltered);

                    const responseInputs: ProductInputModel[] = await ProductInputModel.bulkCreate(productInputsFiltered, {
                        individualHooks: true,
                        transaction: transaction
                    });

                    if (!responseInputs) {
                        await transaction.rollback();
                        if (photo) await ImageHandler.removeImageIfExists(photo);
                        console.log("Error al crear los insumos");
                        res.status(400).json({
                            validation: normalizeValidationArray([
                                "The inputs could not be created"
                            ])
                        });
                        return;
                    }
                }
            }

            if (product_processes) {
                const productProcessesObject: ProductProcessCreateAttributes[] = product_processes;

                if (productProcessesObject.length > 0) {
                    const processesAssign = productProcessesObject.filter(pp => pp.process_id);
                    const newProcesses = productProcessesObject.filter(pp => !pp.process_id && pp.process);

                    let productProcess: ProductProcessCreateAttributes[] = [];

                    // --------------------------------
                    // 1. Validación de procesos existentes
                    // --------------------------------
                    if (processesAssign.length) {
                        const existing = await ProductProcessModel.findAll({
                            where: {
                                product_id: product.id,
                                process_id: processesAssign.map(pp => pp.process_id)
                            },
                            transaction,
                        });

                        if (existing.length) {
                            await transaction.rollback();
                            if (photo) await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation: normalizeValidationArray([
                                    "Some processes are already assigned to this product"
                                ])
                            });
                            return;
                        }

                        productProcess.push(
                            ...processesAssign.map(p => ({
                                product_id: product.id,
                                process_id: p.process_id!,
                                sort_order: p.sort_order,
                                process: p.process,
                                product_input_process: p.product_input_process
                            }))
                        );
                    }

                    // --------------------------------
                    // 2. Crear procesos nuevos
                    // --------------------------------
                    for (const p of newProcesses) {
                        const created = await ProcessModel.create({
                            description: p.process?.description ?? null,
                            name: p.process?.name ?? null,
                        }, {
                            transaction: transaction,
                            individualHooks: true
                        });

                        if (!created) {
                            await transaction.rollback();
                            if (photo) await ImageHandler.removeImageIfExists(photo);
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    "No se pudo crear el proceso nuevo"])
                            });
                            return;
                        }

                        const newProc = created.toJSON();

                        productProcess.push({
                            process_id: newProc.id,
                            product_id: product.id,
                            sort_order: p.sort_order,
                            process: newProc,
                            product_input_process: p.product_input_process
                        });
                    }

                    // --------------------------------
                    // 3. Crear product-process
                    // --------------------------------
                    const responseProductProcess = await ProductProcessModel.bulkCreate(
                        productProcess.map(p => ({
                            process_id: p.process_id,
                            product_id: p.product_id,
                            sort_order: p.sort_order
                        })),
                        { individualHooks: true, transaction }
                    );

                    if (responseProductProcess.length !== productProcess.length) {
                        await transaction.rollback();
                        if (photo) await ImageHandler.removeImageIfExists(photo);
                        res.status(400).json({
                            validation:
                                normalizeValidationArray([
                                    "Los product-process no fue posible crearlos"
                                ])
                        });
                        return;
                    }

                    // --------------------------------
                    // 4. Crear product-input-process
                    // --------------------------------
                    const rowsBD = responseProductProcess.map(r => r.toJSON());


                    for (const p of rowsBD) {
                        const original = productProcess.find(pp => pp.process?.id === p.process_id);

                        if (!original?.product_input_process?.length) {
                            console.log('continue');
                            continue
                        }
                        console.log('no continue');

                        const bulk: ProductInputProcessCreateAttributes[] = [];

                        for (const pip of original.product_input_process) {
                            const inputRow = await ProductInputModel.findOne({
                                where: {
                                    product_id: product.id,
                                    input_id: pip.product_input?.inputs?.id
                                },
                                transaction
                            });

                            const product_input_id = inputRow?.toJSON().id;
                            if (!product_input_id) {
                                await transaction.rollback();
                                if (photo) await ImageHandler.removeImageIfExists(photo);
                                console.log(`error en product_input_id`)
                                res.status(400).json({
                                    validation: normalizeValidationArray([
                                        "Los product-input-process no fue posible crearlos"
                                    ])
                                });
                                return;
                            }

                            bulk.push({
                                product_id: product.id,
                                product_process_id: p.id,
                                qty: pip.qty,
                                product_input_id
                            });
                        }

                        console.log(`bulk pip `, bulk);

                        const resp = await ProductInputProcessModel.bulkCreate(bulk, { transaction });

                        if (resp.length !== bulk.length) {
                            await transaction.rollback();
                            if (photo) await ImageHandler.removeImageIfExists(photo);
                            res.status(400).json({
                                validation:
                                    normalizeValidationArray([
                                        "Los product-input-process no fue posible crearlos"
                                    ])
                            });
                            return;
                        }
                    }
                }
            }

            if (product_discount_ranges) {

                const productDiscountRangesObject: ProductDiscountRangeCreateAttributes[] = product_discount_ranges;

                if (productDiscountRangesObject.length > 0) {

                    const productDiscountRanges: ProductDiscountRangeCreateAttributes[] = productDiscountRangesObject.map((pdr) => ({
                        product_id: product.id,
                        unit_price: Number(pdr.unit_price),
                        min_qty: Number(pdr.min_qty),
                        max_qty: Number(pdr.max_qty)
                    }));

                    const validateDiscountRanges: ProductDiscountRangeModel[] = await ProductDiscountRangeModel.findAll({
                        where: {
                            product_id: product.id,
                            unit_price: { [Op.in]: productDiscountRanges.map((pdr) => pdr.unit_price as number) },
                            min_qty: { [Op.in]: productDiscountRanges.map((pdr) => pdr.min_qty as number) },
                            max_qty: { [Op.in]: productDiscountRanges.map((pdr) => pdr.max_qty as number) }
                        }
                    });

                    if (validateDiscountRanges.length > 0) {
                        await transaction.rollback();
                        if (photo) await ImageHandler.removeImageIfExists(photo);
                        res.status(400).json({
                            validation:
                                normalizeValidationArray([
                                    `Some discount ranges are already`
                                    + ` assigned to this product`
                                ])
                        });
                        return;
                    }

                    const responseDiscountRanges: ProductDiscountRangeModel[] = await ProductDiscountRangeModel.bulkCreate(
                        productDiscountRanges, {
                        transaction: transaction,
                        individualHooks: true
                    });

                    if (!responseDiscountRanges) {
                        await transaction.rollback();
                        if (photo) await ImageHandler.removeImageIfExists(photo);
                        res.status(400).json({
                            validation: normalizeValidationArray([
                                "The discount ranges could not be created"
                            ])
                        });
                        return;
                    }
                }
            }

            await transaction.commit();
            res.status(200).json({});
        } catch (error: unknown) {
            await transaction.rollback();
            if (photo) await ImageHandler.removeImageIfExists(photo);
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

        const productBody = req.body as ProductCreateAttributes;

        // console.log(`body`, productBody);

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS.REPEATABLE_READ
            });

        try {

            // ** UPDATE DE INSTANCIA DEL PRODUCTO */

            // ? validamos que el producto exista

            const validateProduct: ProductModel | null = await ProductModel.findByPk(id);
            if (!validateProduct) {
                await transaction.rollback();
                if (productBody.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                res.status(404).json({ validation: normalizeValidationArray(["Product not found"]) });
                return;
            }
            const product = validateProduct.toJSON();

            // ? Obtentemos los campos editables del modelo
            const editableFields = ProductModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, productBody) as ProductCreateAttributes;


            // ** ACTUALIZAMOS ATRIBUTOS DIRECTOS DEL PRODUCTO

            console.log('update', update_values);
            
            if (Object.keys(update_values).length > 0) {
                console.log('entro a actualizar');
                
                // ? Validamos que el name sea unico
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
                            if (productBody?.photo)
                                await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(200).json({
                                validation: normalizeValidationArray([
                                    `The name is already currently in `
                                    + ` use by a product`
                                ])
                            });
                            return;
                        }
                    }
                    
                    // ? Validamos que el sku sea unico
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
                        if (productBody?.photo)
                            await ImageHandler.removeImageIfExists(productBody.photo);
                        res.status(200).json({
                            validation:
                            normalizeValidationArray([
                                `The sku is already currently in use`
                                + ` by a product`
                            ])
                        });
                        return;
                    }
                }

                // ? Si se actualiza la imagen, activamos la bandera para remplazar la ya existente
                if (update_values?.photo) {
                    IsupdateImage = true;
                    if (product.photo) urlImageOld = product.photo;
                }
                
                // ? Si se actualiza, el estatus, lo casteamos
                if (update_values?.active) {
                    update_values.active = toBoolean(update_values.active);
                }
                
                // console.log(`update_values `, update_values);
                // console.log(`id`, id)
                // ? Actualizamos el registro del modelo
                const [affectedCount] = await ProductModel.update(update_values, {
                    where: { id },
                    transaction: transaction
                });
                
                // ? validamos
                if (!affectedCount) {
                    await transaction.rollback();
                    if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                    res.status(400).json({
                        validation: normalizeValidationArray(["The product could not be updated"])
                    });
                    return;
                }
                
                console.log('salgod');
            }
            
            // ** ACTUALIZAMOS RELACIONES CON PROCESOS
            if (productBody.product_processes_updated) {
                
                const productProcessesObject: ProductProcessManager = productBody.product_processes_updated
                
                // console.log(productProcessesObject);
                
                // ? Validamos que exista por lo menos un cambio
                const flagProccessUpdate = [
                    productProcessesObject.added,
                    productProcessesObject.deleted,
                    productProcessesObject.modified
                ].some((p) => p.length);

                // ?  Si existe un cambio, actualizamos
                if (flagProccessUpdate) {
                    console.log("Inicio de actualizacion CRUD de procesos");
                    const adds: ProductProcessCreateAttributes[] = productProcessesObject.added ?? [];
                    const deletes: ProductProcessAttributes[] = productProcessesObject.deleted ?? [];
                    const modifies: ProductProcessCreateAttributes[] = productProcessesObject.modified ?? [];

                    // ? Si existe eliminaciones
                    if (deletes.length) {
                        console.log("Inicio de eliminacion de procesos");

                        // ? Obtenemos los id de las relaciones product_process
                        const deleteIds: number[] = deletes.map(p => p.process_id);

                        // ? Validamos que los registros a eliminar existan
                        const validateProcess = await ProductProcessModel.findAll({
                            where: { product_id: id, process_id: deleteIds },
                            transaction,
                        });

                        // console.log("validacion diobar");
                        // console.log(validateProcess);
                        // console.log(deleteIds);

                        // ? Si no existen todos, retroalimentamos
                        if (validateProcess.length !== deleteIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo)
                                await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Some of the assigned processes do`
                                    + ` not exist`,
                                ])
                            });
                            return;
                        }

                        // console.log(deleteIds);
                        // console.log(id);

                        // ? Eliminamos los registros del modelo
                        await ProductProcessModel.destroy({
                            where: { product_id: id, process_id: deleteIds },
                            transaction,
                        });

                        // console.log(responseDelete);
                        console.log("Fin de eliminacion de procesos");
                    }

                    // ? Si existe procesos por asingar al producto
                    if (adds.length) {
                        console.log("Inicio de asignacion de procesos");

                        const processesAssign = adds.filter(pp => pp.process_id) ?? [];
                        const newProcesses = adds.filter(pp => !pp.process_id && pp.process) ?? [];

                        let productProcess: ProductProcessCreateAttributes[] = [];

                        // --------------------------------
                        // 1. Validación de procesos existentes
                        // --------------------------------
                        if (processesAssign.length) {
                            const existing = await ProductProcessModel.findAll({
                                where: { product_id: product.id, process_id: processesAssign.map(pp => pp.process_id) },
                                transaction,
                            });

                            if (existing.length) {
                                await transaction.rollback();
                                if (productBody?.photo)
                                    await ImageHandler.removeImageIfExists(productBody.photo);
                                res.status(400).json({
                                    validation: normalizeValidationArray([
                                        "Some processes are already assigned to this product"
                                    ])
                                });
                                return;
                            }
                            productProcess.push(
                                ...processesAssign.map(p => ({
                                    product_id: product.id,
                                    process_id: p.process_id!,
                                    sort_order: p.sort_order,
                                    process: p.process,
                                    product_input_process: p.product_input_process
                                }))
                            );
                        }

                        // --------------------------------
                        // 2. Crear procesos nuevos
                        // --------------------------------
                        for (const p of newProcesses) {
                            const created = await ProcessModel.create({
                                description: p.process?.description ?? null,
                                name: p.process?.name ?? null,
                            }, {
                                transaction: transaction,
                                individualHooks: true
                            });

                            if (!created) {
                                await transaction.rollback();
                                if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                res.status(500).json({
                                    validation: normalizeValidationArray([
                                        "No se pudo crear el proceso nuevo"])
                                });
                                return;
                            }

                            const newProc = created.toJSON();

                            productProcess.push({
                                process_id: newProc.id,
                                product_id: product.id,
                                sort_order: p.sort_order,
                                process: newProc,
                                product_input_process: p.product_input_process
                            });
                        }


                        // --------------------------------
                        // 3. Crear product-process
                        // --------------------------------
                        const responseProductProcess = await ProductProcessModel.bulkCreate(
                            productProcess.map(p => ({
                                process_id: p.process_id,
                                product_id: p.product_id,
                                sort_order: p.sort_order
                            })),
                            { individualHooks: true, transaction }
                        );

                        if (responseProductProcess.length !== productProcess.length) {
                            await transaction.rollback();
                            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(400).json({
                                validation: normalizeValidationArray([
                                    "Los product-process no fue posible crearlos"
                                ])
                            });
                            return;
                        }

                        // --------------------------------
                        // 4. Crear product-input-process
                        // --------------------------------
                        const rowsBD = responseProductProcess.map(r => r.toJSON());


                        for (const p of rowsBD) {
                            const original = productProcess.find(pp => pp.process?.id === p.process_id);

                            if (!original?.product_input_process?.length) {
                                console.log('continue');
                                continue
                            }
                            console.log('no continue');

                            const bulk: ProductInputProcessCreateAttributes[] = [];

                            for (const pip of original.product_input_process) {
                                const inputRow = await ProductInputModel.findOne({
                                    where: {
                                        product_id: product.id,
                                        input_id: pip.product_input?.inputs?.id
                                    },
                                    transaction
                                });

                                const product_input_id = inputRow?.toJSON().id;
                                if (!product_input_id) {
                                    await transaction.rollback();
                                    if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody?.photo);
                                    console.log(`error en product_input_id`)
                                    res.status(400).json({
                                        validation:
                                            normalizeValidationArray([
                                                "Los product-input-process no fue posible crearlos"
                                            ])
                                    });
                                    return;
                                }

                                bulk.push({
                                    product_id: product.id,
                                    product_process_id: p.id,
                                    qty: pip.qty,
                                    product_input_id
                                });
                            }

                            console.log(`bulk pip `, bulk);

                            const resp = await ProductInputProcessModel.bulkCreate(bulk, { transaction });

                            console.log(`Se crearon `, resp.length)
                            if (resp.length !== bulk.length) {
                                await transaction.rollback();
                                if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                res.status(400).json({
                                    validation:
                                        normalizeValidationArray([
                                            "Los product-input-process no fue posible crearlos"
                                        ])
                                });
                                return;
                            }
                        }
                        console.log("Fin de asignacion de procesos");
                    }

                    // ? Si existe procesos por actualizar
                    if (modifies.length > 0) {

                        console.log("Inicio de actualización de procesos");

                        // ? Validamos que existan todos las relaciones a actualizar

                        const modifyIds: number[] = modifies.filter(p => p.id !== undefined).map(p => p.id as number);

                        const validateProductProcess: ProductProcessModel[] = await ProductProcessModel.findAll({
                            where: { id: modifyIds }, transaction, lock: transaction.LOCK.SHARE,
                        });

                        if (validateProductProcess.length !== modifyIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Some of the assigned processes do`
                                    + ` not exist`
                                ])
                            });
                            return;
                        }

                        // ? Actualizamos todos los regitros

                        console.log(`modifies`, modifies)

                        for (const productProcessAux of modifies) {
                            const productProcessId: number = productProcessAux.id!;
                            const { id: _, product_input_process_updated, ...rest } = productProcessAux;

                            const update_values = collectorUpdateFields(ProductProcessModel.getEditableFields(), rest) as ProductInputProcessCreateAttributes;

                            // ? Si existen propiedades directas del modelo, las actualizamos
                            if (Object.keys(update_values).length) {
                                const [resultUpdateProductProcess]: [number] = await ProductProcessModel.update(update_values, {
                                    where: { id: productProcessId },
                                    transaction,
                                });
                                console.log('id ', productProcessId)
                                console.log('update', rest)
                                console.log('result', resultUpdateProductProcess)
                                if (!resultUpdateProductProcess) {
                                    await transaction.rollback();
                                    if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                    res.status(404).json({
                                        validation: normalizeValidationArray([
                                            `Algunas de los productProcess no pude ser actualizado para el producto actualizado.`
                                        ])
                                    });
                                    return;
                                }
                            }

                            // ? Si existen relaciones product_inputs_process para actualizar
                            if (product_input_process_updated) {
                                // ? Validamos que exista por lo menos un cambio
                                const flagProccessInputProcessUpdate = [
                                    product_input_process_updated.added,
                                    product_input_process_updated.deleted,
                                    product_input_process_updated.modified
                                ].some((p) => p.length);

                                // ? Existe alguna modificacion tipo CRUD
                                if (flagProccessInputProcessUpdate) {

                                    const adds: ProductInputProcessCreateAttributes[] = product_input_process_updated.added ?? [];
                                    const deletes: ProductInputProcessCreateAttributes[] = product_input_process_updated.deleted ?? [];
                                    const modifies: ProductInputProcessCreateAttributes[] = product_input_process_updated.modified ?? [];

                                    // ? Si existen ProductInputProcess por eliminar
                                    if (deletes.length) {
                                        console.log(`Inicio de la eliminacion de las relaciones product-input-process`);
                                        // obtenemos los id de los registros a eliminar(Asegurandonos que sean id validos)
                                        const deletesIdFilterd: number[] = deletes.filter(d => d.id !== undefined).map((dt) => dt.id as number) ?? [];

                                        // ? Validamos que existan los registros que se eliminaran
                                        const validationExists = await ProductInputProcessModel.findAll({
                                            where: { id: { [Op.in]: deletesIdFilterd } },
                                            transaction
                                        });

                                        if (validationExists.length !== deletesIdFilterd.length) {
                                            await transaction.rollback();
                                            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                            res.status(404).json({
                                                validation: normalizeValidationArray([
                                                    `Algunas de las relaciones product-input-process para eliminar no existen para el producto actualizado.`
                                                ])
                                            });
                                            return;
                                        }

                                        // ? Eliminamos los registros dentro del modelo 
                                        await ProductInputProcessModel.destroy({
                                            where: {
                                                id: { [Op.in]: deletesIdFilterd }
                                            },
                                            transaction,
                                            individualHooks: true
                                        });
                                        console.log(`Fin de la eliminacion de las relaciones product-input-process`);
                                    }

                                    // ?  Si existen productInputProcess por asignar
                                    console.log(adds);
                                    if (adds.length) {
                                        console.log(`Inicio de la creacion de las relaciones product-input-process`);
                                        // ? Creamos los objetos para la creacion de cada uno de los registros nuevos
                                        const newProductInputProcess = adds.map((a: ProductInputProcessCreateAttributes): ProductInputProcessCreateAttributes => ({
                                            ...a,
                                            qty: a.qty,
                                            product_id: product.id,
                                            product_input_id: a.product_input_id,
                                            product_process_id: productProcessId,
                                        }));

                                        console.log(`new`, newProductInputProcess);

                                        //  ? Creamos los registros dentro del modelo
                                        const responseProductInputProcess = await ProductInputProcessModel.bulkCreate(newProductInputProcess, {
                                            transaction,
                                            individualHooks: true
                                        });
                                        // ? Validamos que se hayan creado todos
                                        if (responseProductInputProcess.length !== newProductInputProcess.length) {
                                            await transaction.rollback();
                                            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                            res.status(404).json({
                                                validation: normalizeValidationArray([
                                                    `No se pudo crear las relaciones product-input-process para el producto actualizado.`
                                                ])
                                            });
                                            return;
                                        }
                                        console.log(`Fin de la creacion de las relaciones product-input-process`);
                                    }

                                    if (modifies.length) {
                                        console.log(`Inicio de la actualizacion de las relaciones product-input-process`);

                                        // obtenemos los id de los registros a eliminar(Asegurandonos que sean id validos)
                                        const modifiedIdFilterd = modifies.filter(d => d.id !== undefined) ?? [];

                                        // ? Validamos que existan los registros que se eliminaran
                                        const validationExists = await ProductInputProcessModel.findAll({
                                            where: { id: { [Op.in]: modifiedIdFilterd.map(m => m.id as number) } },
                                            transaction
                                        });
                                        if (validationExists.length !== modifiedIdFilterd.length) {
                                            await transaction.rollback();
                                            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                            res.status(404).json({
                                                validation: normalizeValidationArray([
                                                    `Algunas de las relaciones product-input-process para actualizar no existen para el producto actualizado.`
                                                ])
                                            });
                                            return;
                                        }

                                        // ? Actualizamos todos los regitros de productInputProcess
                                        for (const productInputProcessAux of modifiedIdFilterd) {

                                            const productInputProcessId: number = productInputProcessAux.id!;
                                            const { id: _, ...rest } = productInputProcessAux;
                                            const updateValuesProductInputProcess = collectorUpdateFields(ProductInputProcessModel.getEditableFields(), rest) as ProductInputProcessCreateAttributes;

                                            // ? Si existen propiedades directas del modelo, las actualizamos
                                            if (Object.keys(updateValuesProductInputProcess).length) {
                                                console.log('productInputProcessId', productInputProcessId);
                                                console.log('updateValuesProductInputProcess', updateValuesProductInputProcess)
                                                const [resultUpdateProductProcess]: [number] = await ProductInputProcessModel.update(updateValuesProductInputProcess, {
                                                    where: { id: productInputProcessId },
                                                    transaction,
                                                });
                                                if (!resultUpdateProductProcess) {
                                                    await transaction.rollback();
                                                    if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                                    res.status(404).json({
                                                        validation: normalizeValidationArray([
                                                            `Algunas de las relacion product-input-process no pudo ser actualizada para el producto actualizado.`
                                                        ])
                                                    });
                                                    return;
                                                }
                                            }


                                        }
                                        console.log(`Fin de la actualizacion de las relaciones product-input-process`);
                                    }
                                }
                            }
                        }
                        console.log("Fin de actualización de procesos");
                    }
                }
                console.log("Fin de actualizacion CRUD de procesos");
            }

            if (productBody.product_discount_ranges_updated) {
                const productDiscountRangesObject: ProductDiscountRangeManager = productBody.product_discount_ranges_updated;
                const flagDiscountRangeUpdate: boolean = [
                    productDiscountRangesObject.added,
                    productDiscountRangesObject.deleted,
                    productDiscountRangesObject.modified
                ].some((p) => p.length > 0);

                if (flagDiscountRangeUpdate) {

                    console.log("Inicio de actualizacion de rangos de descuento");
                    const adds: ProductDiscountRangeCreateAttributes[] = productDiscountRangesObject.added ?? [];
                    const deletes: ProductDiscountRangeAttributes[] = productDiscountRangesObject.deleted ?? [];
                    const modifies: ProductDiscountRangeCreateAttributes[] = productDiscountRangesObject.modified ?? [];

                    if (modifies.length > 0) {

                        console.log("Inicio de modificacion de rangos de descuento");

                        const modifiesFiltered: ProductDiscountRangeCreateAttributes[] = modifies.filter(p => p.id !== undefined);

                        const modifyIds: number[] = modifiesFiltered.map(p => p.id as number);

                        const validateProductDiscountRange: ProductDiscountRangeModel[] = await ProductDiscountRangeModel.findAll({
                            where: { id: { [Op.in]: modifyIds } },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (validateProductDiscountRange.length !== modifyIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo)
                                await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Some of the assigned discount `
                                    + `ranges do not exist`
                                ])
                            });
                            return;
                        }

                        console.log(`md`, modifiesFiltered);
                        console.log(`mdid`, modifyIds);

                        const results = await Promise.all(modifies.map(async (val) => {
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

                        const allUpdated = results.every(([affectedCount]) => affectedCount > 0);

                        if (!allUpdated) {
                            await transaction.rollback();
                            if (productBody?.photo)
                                await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(400).json({
                                validation: normalizeValidationArray([
                                    `The discount ranges could not be `
                                    + `modified for the product`
                                ])
                            });
                            return;
                        }
                        console.log("Fin de modificacion de rangos de descuento");
                    }

                    if (deletes.length > 0) {

                        console.log("Inicio de eliminacion de rangos de descuento");

                        const deletesFiltered: ProductDiscountRangeAttributes[] = deletes.filter(p => p.id !== undefined);

                        const deleteIds: number[] = deletesFiltered.map(p => p.id!);

                        const validateProductDiscountRange = await ProductDiscountRangeModel.findAll({
                            where: { id: deleteIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (validateProductDiscountRange.length !== deleteIds.length) {
                            await transaction.rollback();
                            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Some of the assigned discount `
                                    + `ranges do not exist`
                                ])
                            });
                            return;
                        }

                        const deletedCount: number = await ProductDiscountRangeModel.destroy({
                            where: { id: deleteIds },
                            transaction,
                        });

                        const allDeleted: boolean = deletedCount === deleteIds.length;

                        if (!allDeleted) {
                            await transaction.rollback();
                            if (productBody?.photo)
                                await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(400).json({
                                validation: normalizeValidationArray([
                                    `The discount ranges could not be `
                                    + `deleted for the product`
                                ])
                            });
                            return;
                        }
                    }
                    console.log("Hola soy diobar")
                    console.log(adds);
                    if (adds.length > 0) {

                        console.log("Inicio de adicion de rangos de descuento");

                        const validateRangeDiscount: ProductDiscountRangeModel[] = await ProductDiscountRangeModel.findAll({
                            where: { product_id: product.id }
                        });

                        if (validateRangeDiscount.length) {
                            const existingRanges: ProductDiscountRangeAttributes[] =
                                validateRangeDiscount.map(rd => rd.toJSON());

                            const hasConflict = adds.some((newRange) => {
                                // Si el rango nuevo no tiene ambos extremos, no puede evaluar conflicto
                                if (newRange.min_qty == null || newRange.max_qty == null) return false;

                                const newMin = Number(newRange.min_qty);
                                const newMax = Number(newRange.max_qty);

                                return existingRanges.some((existing) => {
                                    if (existing.min_qty == null || existing.max_qty == null) return false;

                                    const exMin = Number(existing.min_qty);
                                    const exMax = Number(existing.max_qty);

                                    const isOverlapping =
                                        newMin < exMax && newMax > exMin;

                                    const isExactDuplicate =
                                        newMin === exMin && newMax === exMax;

                                    return isOverlapping || isExactDuplicate;
                                });
                            });

                            if (hasConflict) {
                                await transaction.rollback();
                                if (productBody?.photo)
                                    await ImageHandler.removeImageIfExists(productBody.photo);
                                res.status(200).json({
                                    validation: normalizeValidationArray([
                                        `A discount range overlaps or duplicates ` +
                                        `an existing one. Ensure all ranges are unique ` +
                                        `and non-overlapping.`
                                    ])
                                });
                                return;
                            }

                            console.log("Hola soy diobar")

                            const productDiscountRange: ProductDiscountRangeCreateAttributes[] = adds.map((add) => {
                                const { id: _, ...rest } = add;
                                return ({ ...rest, product_id: Number(id) });
                            });

                            console.log(productDiscountRange);

                            const responseProductDiscountRange = await ProductDiscountRangeModel.bulkCreate(
                                productDiscountRange, {
                                transaction,
                            });

                            console.log(responseProductDiscountRange);

                            if (responseProductDiscountRange.length > adds.length) {
                                await transaction.rollback();
                                if (productBody?.photo)
                                    await ImageHandler.removeImageIfExists(productBody.photo);
                                res.status(400).json({
                                    validation: normalizeValidationArray([
                                        `The discount ranges could not be `
                                        + `added to the product`
                                    ])
                                });
                                return;
                            }
                        } else {

                            console.log("Hola soy diobar");

                            const productDiscountRange: ProductDiscountRangeCreateAttributes[] = adds.map((add) => {
                                const { id: _, ...rest } = add;
                                return ({ ...rest, product_id: Number(id) });
                            });

                            console.log(productDiscountRange);

                            const responseProductDiscountRange = await ProductDiscountRangeModel.bulkCreate(
                                productDiscountRange, {
                                transaction,
                            });

                            console.log(responseProductDiscountRange);

                            if (responseProductDiscountRange.length > adds.length) {
                                await transaction.rollback();
                                if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
                                res.status(400).json({
                                    validation: normalizeValidationArray([
                                        `The discount ranges could not be `
                                        + `added to the product`
                                    ])
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

                const productsInputsObject: ProductInputManager = productBody.products_inputs_updated;

                const flagProductsInputsUpdate: boolean = [
                    productsInputsObject.added,
                    productsInputsObject.deleted,
                    productsInputsObject.modified
                ].some((p) => p.length);

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
                            if (productBody?.photo)
                                await ImageHandler.removeImageIfExists(productBody.photo);
                            res.status(404).json({
                                validation:
                                    normalizeValidationArray([
                                        `Some inputs you are trying`
                                        + ` to modify do not exist`
                                    ])
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
                                    normalizeValidationArray([
                                        `Some of the inputs you are trying`
                                        + ` to assign would create duplicates`
                                    ])
                            });
                            return;
                        }

                        const results = await Promise.all(modifies.map(val => {
                            const productInputId = val.id;
                            const { id: _, inputs, ...rest } = val;
                            return ProductInputModel.update(rest, {
                                where: { id: productInputId },
                                transaction,
                            });
                        })
                        );

                        const allUpdated = results.every(([affectedCount]) => affectedCount > 0);

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
                                    normalizeValidationArray([
                                        `The inputs could not be modified for`
                                        + ` the product`
                                    ])
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
                                    normalizeValidationArray([
                                        `Some of the assigned inputs do`
                                        + ` not exist`
                                    ])
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
                                    normalizeValidationArray([
                                        `The inputs could not be deleted for`
                                        + ` the product`
                                    ])
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
                                    normalizeValidationArray([
                                        `Some of the assigned inputs do`
                                        + ` not exist`
                                    ])
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
                                    normalizeValidationArray([
                                        `Some of the assigned inputs are `
                                        + ` already assigned to the product`
                                    ])
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
                                    normalizeValidationArray([
                                        `The inputs could not be `
                                        + `added to the product`
                                    ])
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
            res.status(200).json({});
        } catch (error: unknown) {
            await transaction.rollback();
            if (productBody?.photo) await ImageHandler.removeImageIfExists(productBody.photo);
            if (error instanceof Error) next(error)
            else console.error(`An unexpected error ocurred ${error}`);
        } finally {
            if (isSuccessFully && IsupdateImage && urlImageOld !== '')
                await ImageHandler.removeImageIfExists(urlImageOld);
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