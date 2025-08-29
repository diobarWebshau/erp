import React, { useState, type FormEvent } from "react";
import styles from "./modern-model.module.css";

interface ModernFormData {
    // Información del producto
    productName: string;
    productSKU: string;
    productPrice: number;

    // Procesos del producto
    processStep: string;
    processDuration: number; // en minutos, por ejemplo

    // Inputs del producto
    inputName: string;
    inputQuantity: number;

    // Descuentos por mayoreo
    wholesaleQuantity: number;
    wholesaleDiscount: number; // porcentaje, ej: 10 para 10%
}

const ModernForm: React.FC = () => {
    const [formData, setFormData] = useState<ModernFormData>({
        productName: "",
        productSKU: "",
        productPrice: 0,

        processStep: "",
        processDuration: 0,

        inputName: "",
        inputQuantity: 0,

        wholesaleQuantity: 0,
        wholesaleDiscount: 0,
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const target = e.target;
        const name = target.name;

        let value: string | number = "";

        if (target instanceof HTMLInputElement) {
            if (target.type === "number") {
                // Convertir a número
                value = target.value === "" ? "" : Number(target.value);
            } else {
                value = target.value;
            }
        } else {
            value = target.value;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Datos enviados:", formData);
        alert("Formulario enviado, revisa consola para datos.");
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Información del producto */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Información del Producto</legend>

                <label htmlFor="productName" className={styles.label}>
                    Nombre del producto
                </label>
                <input
                    id="productName"
                    name="productName"
                    type="text"
                    value={formData.productName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: Camiseta azul"
                    required
                />

                <label htmlFor="productSKU" className={styles.label}>
                    SKU
                </label>
                <input
                    id="productSKU"
                    name="productSKU"
                    type="text"
                    value={formData.productSKU}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Código SKU"
                    required
                />

                <label htmlFor="productPrice" className={styles.label}>
                    Precio
                </label>
                <input
                    id="productPrice"
                    name="productPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.productPrice}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0.00"
                    required
                />
            </fieldset>

            {/* Procesos del producto */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Procesos del Producto</legend>

                <label htmlFor="processStep" className={styles.label}>
                    Paso de proceso
                </label>
                <input
                    id="processStep"
                    name="processStep"
                    type="text"
                    value={formData.processStep}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: Corte, Ensamble"
                    required
                />

                <label htmlFor="processDuration" className={styles.label}>
                    Duración (minutos)
                </label>
                <input
                    id="processDuration"
                    name="processDuration"
                    type="number"
                    min={0}
                    value={formData.processDuration}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Duración en minutos"
                    required
                />
            </fieldset>

            {/* Inputs del producto */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Inputs del Producto</legend>

                <label htmlFor="inputName" className={styles.label}>
                    Nombre del input
                </label>
                <input
                    id="inputName"
                    name="inputName"
                    type="text"
                    value={formData.inputName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: Tela, Botones"
                    required
                />

                <label htmlFor="inputQuantity" className={styles.label}>
                    Cantidad
                </label>
                <input
                    id="inputQuantity"
                    name="inputQuantity"
                    type="number"
                    min={0}
                    value={formData.inputQuantity}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Cantidad usada"
                    required
                />
            </fieldset>

            {/* Descuentos por mayoreo */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Descuentos por Mayoreo</legend>

                <label htmlFor="wholesaleQuantity" className={styles.label}>
                    Cantidad mínima
                </label>
                <input
                    id="wholesaleQuantity"
                    name="wholesaleQuantity"
                    type="number"
                    min={0}
                    value={formData.wholesaleQuantity}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: 10"
                    required
                />

                <label htmlFor="wholesaleDiscount" className={styles.label}>
                    Descuento (%)
                </label>
                <input
                    id="wholesaleDiscount"
                    name="wholesaleDiscount"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={formData.wholesaleDiscount}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: 10 para 10%"
                    required
                />
            </fieldset>

            <button type="submit" className={styles.button}>
                Guardar Producto
            </button>
        </form>
    );
};

export default ModernForm;
