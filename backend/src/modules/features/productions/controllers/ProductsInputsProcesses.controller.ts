import collectorUpdateFields
  from "../../../../scripts/collectorUpdateField.js";
import {
  ProductInputProcessModel,  
  ProductInputModel,
  ProductProcessModel        
} from "../../../associations.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { Request, Response, NextFunction } from "express";
import { Op, Transaction, fn, col } from "sequelize";

class ProductInputProcessController {
  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await ProductInputProcessModel.findAll();
      if (!(response.length > 0)) {
        res.status(200).json([]);
        return;
      }
      const relationships = response.map((rip: any) => rip.toJSON());
      res.status(200).json(relationships);
    } catch (error: unknown) {
      if (error instanceof Error) next(error);
      else console.error(`An unexpected error occurred: ${error}`);
    }
  }

  static getById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const response = await ProductInputProcessModel.findByPk(id);
      if (!response) {
        res.status(200).json(null);
        return;
      }
      const relationship = response.toJSON();
      res.status(200).json(relationship);
    } catch (error: unknown) {
      if (error instanceof Error) next(error);
      else console.error(`An unexpected error occurred: ${error}`);
    }
  }

  static create = async (req: Request, res: Response, next: NextFunction) => {
    const { product_id, product_input_id, product_process_id, qty } = req.body;

    const t = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
    });

    try {
      // 0) Validaciones básicas
      if (!product_id || !product_input_id || !product_process_id) {
        await t.rollback();
        res.status(400).json({
          validation: "product_id, product_input_id and product_process_id are required"
        });
        return;
      }
      if (qty == null || isNaN(Number(qty)) || Number(qty) < 0) {
        await t.rollback();
        res.status(400).json({
          validation: "qty must be a number >= 0"
        });
        return;
      }

      // 1) Validar FKs existen (y bloquear filas relevantes)
      const [validateProductInput, validateProductProcess] = await Promise.all([
        ProductInputModel.findByPk(product_input_id, {
          transaction: t, lock: t.LOCK.UPDATE
        }),
        ProductProcessModel.findByPk(product_process_id, {
          transaction: t, lock: t.LOCK.UPDATE
        })
      ]);

      if (!validateProductInput) {
        await t.rollback();
        res.status(404).json({
          validation: "The assigned product_input does not exist"
        });
        return;
      }
      if (!validateProductProcess) {
        await t.rollback();
        res.status(404).json({
          validation: "The assigned product_process does not exist"
        });
        return;
      }

      // 2) Validar "mismo producto"
      const pi = validateProductInput.toJSON?.() ?? validateProductInput;
      const pp = validateProductProcess.toJSON?.() ?? validateProductProcess;

      if (pi.product_id !== Number(product_id)) {
        await t.rollback();
        res.status(409).json({
          validation: "product_input does not belong to the provided product_id"
        });
        return;
      }
      if (pp.product_id !== Number(product_id)) {
        await t.rollback();
        res.status(409).json({
          validation: "product_process does not belong to the provided product_id"
        });
        return;
      }

      // 3) Evitar duplicado triple (product_id, product_process_id, product_input_id)
      const validationDuplicate = await ProductInputProcessModel.findOne({
        where: { product_id, product_input_id, product_process_id },
        transaction: t, lock: t.LOCK.UPDATE
      });
      if (validationDuplicate) {
        await t.rollback();
        res.status(409).json({
          validation: "Product-Input-Process relationship already exists"
        });
        return;
      }

      // 4) Regla de negocio: suma de qty por insumo no debe exceder equivalence
      //    Suma actual de qty para (product_id, product_input_id)
      const sumRow = await ProductInputProcessModel.findOne({
        attributes: [[fn("COALESCE", fn("SUM", col("qty")), 0), "sum_qty"]],
        where: { product_id, product_input_id },
        transaction: t, lock: t.LOCK.UPDATE
      }) as unknown as { get: (k: string) => number } | null;

      const currentSum = Number(sumRow?.get?.("sum_qty") ?? 0);
      const proposedSum = currentSum + Number(qty);
      const equivalence = Number(pi.equivalence ?? 0);

      if (proposedSum > equivalence) {
        await t.rollback();
        res.status(409).json({
          validation: "Total qty across processes exceeds products_inputs.equivalence",
          details: {
            equivalence,
            current_assigned_qty: currentSum,
            requested_qty: Number(qty),
            proposed_total: proposedSum
          }
        });
        return;
      }

      // 5) Crear relación
      const response = await ProductInputProcessModel.create({
        product_id,
        product_input_id,
        product_process_id,
        qty: Number(qty)
      }, { transaction: t });

      if (!response) {
        await t.rollback();
        res.status(400).json({
          validation: "The Product-Input-Process relationship could not be created"
        });
        return;
      }

      await t.commit();
      res.status(201).json({
        message: "Product-Input-Process relationship created successfully"
      });
    } catch (error: unknown) {
      await t.rollback();
      if (error instanceof Error) next(error);
      else console.error(`An unexpected error occurred: ${error}`);
    }
  }

  static update = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const body = req.body;

    const t = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
    });

    try {
      // 1) Validar que exista la relación (bloqueo)
      const current = await ProductInputProcessModel.findByPk(id, {
        transaction: t, lock: t.LOCK.UPDATE
      });
      if (!current) {
        await t.rollback();
        res.status(404).json({
          validation: "Product-Input-Process relationship not found for update"
        });
        return;
      }

      const relationship = current.toJSON();
      const editableFields = ProductInputProcessModel.getEditableFields();
      const update_values = collectorUpdateFields(editableFields, body);

      if (Object.keys(update_values).length === 0) {
        await t.rollback();
        res.status(400).json({
          validation:
            "No validated properties were found for updating the Product-Input-Process relationship"
        });
        return;
      }

      if (update_values.qty != null) {
        const n = Number(update_values.qty);
        if (isNaN(n) || n < 0) {
          await t.rollback();
          res.status(400).json({ validation: "qty must be a number >= 0" });
          return;
        }
      }

      // 2) Calcular valores finales a validar (merge)
      const next_product_id =
        (update_values.product_id ?? relationship.product_id) as number;
      const next_product_input_id =
        (update_values.product_input_id ?? relationship.product_input_id) as number;
      const next_product_process_id =
        (update_values.product_process_id ?? relationship.product_process_id) as number;
      const next_qty =
        (update_values.qty != null ? Number(update_values.qty) : Number(relationship.qty)) as number;

      // 3) Validar existencia de FKs y “mismo producto” (bloqueo de filas padre)
      const [validateProductInput, validateProductProcess] = await Promise.all([
        ProductInputModel.findByPk(next_product_input_id, {
          transaction: t, lock: t.LOCK.UPDATE
        }),
        ProductProcessModel.findByPk(next_product_process_id, {
          transaction: t, lock: t.LOCK.UPDATE
        })
      ]);

      if (!validateProductInput) {
        await t.rollback();
        res.status(404).json({
          validation: "The assigned product_input does not exist"
        });
        return;
      }
      if (!validateProductProcess) {
        await t.rollback();
        res.status(404).json({
          validation: "The assigned product_process does not exist"
        });
        return;
      }

      const pi = validateProductInput.toJSON?.() ?? validateProductInput;
      const pp = validateProductProcess.toJSON?.() ?? validateProductProcess;

      if (pi.product_id !== Number(next_product_id)) {
        await t.rollback();
        res.status(409).json({
          validation: "product_input does not belong to the intended product_id"
        });
        return;
      }
      if (pp.product_id !== Number(next_product_id)) {
        await t.rollback();
        res.status(409).json({
          validation: "product_process does not belong to the intended product_id"
        });
        return;
      }

      // 4) Evitar duplicado triple, excluyendo el propio id
      const validateDuplicate = await ProductInputProcessModel.findOne({
        where: {
          product_id: next_product_id,
          product_input_id: next_product_input_id,
          product_process_id: next_product_process_id,
          id: { [Op.ne]: id }
        },
        transaction: t, lock: t.LOCK.UPDATE
      });
      if (validateDuplicate) {
        await t.rollback();
        res.status(409).json({
          validation: "Product-Input-Process relationship already exists"
        });
        return;
      }

      // 5) Regla de negocio: suma de qty no debe exceder equivalence
      //    Suma actual del insumo (todas las filas menos la actual)
      const sumRow = await ProductInputProcessModel.findOne({
        attributes: [[fn("COALESCE", fn("SUM", col("qty")), 0), "sum_qty"]],
        where: {
          product_id: next_product_id,
          product_input_id: next_product_input_id,
          id: { [Op.ne]: id }
        },
        transaction: t, lock: t.LOCK.UPDATE
      }) as unknown as { get: (k: string) => number } | null;

      const othersSum = Number(sumRow?.get?.("sum_qty") ?? 0);
      const proposedTotal = othersSum + Number(next_qty);
      const equivalence = Number(pi.equivalence ?? 0);

      if (proposedTotal > equivalence) {
        await t.rollback();
        res.status(409).json({
          validation: "Total qty across processes exceeds products_inputs.equivalence",
          details: {
            equivalence,
            sum_other_processes: othersSum,
            requested_qty_for_this_row: Number(next_qty),
            proposed_total: proposedTotal
          }
        });
        return;
      }

      // 6) Actualizar
      const response = await ProductInputProcessModel.update(
        update_values,
        { where: { id }, individualHooks: true, transaction: t }
      );

      if (!(response[0] > 0)) {
        await t.rollback();
        res.status(200).json({
          validation:
            "No changes were made to the Product-Input-Process relationship"
        });
        return;
      }

      await t.commit();
      res.status(200).json({
        message: "Product-Input-Process relationship updated successfully"
      });
    } catch (error: unknown) {
      await t.rollback();
      if (error instanceof Error) next(error);
      else console.error(`An unexpected error occurred: ${error}`);
    }
  }

  static deleteById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const response = await ProductInputProcessModel.destroy({
        where: { id },
        individualHooks: true
      });

      if (!(response > 0)) {
        res.status(200).json({
          validation:
            "Product-Input-Process relationship not found for delete"
        });
        return;
      }

      res.status(200).json({
        message: "Product-Input-Process relationship deleted successfully"
      });
    } catch (error: unknown) {
      if (error instanceof Error) next(error);
      else console.error(`An unexpected error occurred: ${error}`);
    }
  }
}

export default ProductInputProcessController;
