import { useState } from "react";
import styleModule
    from "./AddProductModal.module.css"
import type {
    IProduct
} from "../../../../../../../../interfaces/product";
import AsyncReactMultiSelect
    from "../../../../../../../../components/ui/table/components/gui/react-select-multiple/AsyncReactMultiSelect";
import FadeButton from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import { Plus } from "lucide-react";


const AddProductModal = () => {

    const [selectedProduct, setSelectedProduct] =
        useState<IProduct[]>([]);

    const fetchProductsLike = async (query: string): Promise<IProduct[]> => {
        if (!query || query.trim().length === 0) {
            return [];
        }

        try {
            const response =
                await fetch(`http://localhost:3003/products/products/filter/${query}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // El backend responde directamente con un array de productos
            const products: IProduct[] = await response.json();

            return products;

        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    return (
        <div className={styleModule.container}>
            <section className={styleModule.bodySection}>
                <h2>Productos</h2>
                <AsyncReactMultiSelect<IProduct>
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    loadOptions={fetchProductsLike}
                    getOptionLabel={(opt) => opt.name}
                    getOptionValue={(opt) => opt.id.toString()}
                    className={styleModule.asyncReactSingleSelect}
                    noOptionsMessage="Ningun producto encontrado"
                />
            </section>
            <section className={styleModule.footerSection}>
                <FadeButton
                    label="Cancelar"
                    type="button"
                    typeOrderIcon="first"
                    icon={<Plus className={styleModule.cancelButtonIcon} />}
                    onClick={() => console.log("Cancelar")}
                    classNameButton={styleModule.cancelButton}
                    classNameLabel={styleModule.cancelButtonLabel}
                    classNameSpan={styleModule.cancelButtonSpan}
                />
                <FadeButton
                    label="Agregar Producto"
                    type="button"
                    typeOrderIcon="first"
                    icon={<Plus className={styleModule.addProductButtonIcon} />}
                    onClick={() => console.log("Agregar")}
                    classNameButton={styleModule.addProductButton}
                    classNameLabel={styleModule.addProductButtonLabel}
                    classNameSpan={styleModule.addProductButtonSpan}
                />
            </section>
        </div >
    );
};

export default AddProductModal;
