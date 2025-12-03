import {
    useState,
    type FormEvent,
    type MouseEvent
} from "react";
import styleModule
    from "./AddProductModal.module.css"
import type {
    IProduct
} from "../../../../../../../../interfaces/product";
import SelectSearchMultiCheck
    from "../../../../../../../../components/ui/table/components/gui/diobar/SelectSearchMultiCheck";
import FadeButton
    from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import {
    CircleX,
    Plus,
    Search
} from "lucide-react";
import useProductQueryLikeTo
    from "../../../../../../../../modelos/products/react-hooks/useProductQueryLikeTo";
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../../../interfaces/purchasedOrdersProducts";
import {
    add_purchase_order_products
} from "../../../context/modalAddActions";
import {
    useModalAddDispatch,
    useModalAddState
} from "../../../context/modalAddHooks";
import { MultiSelectSearchCheck } from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/MultiSelectSearchCheck";

interface AddProductModalProps {
    onClose: (e: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => void;
}

const AddProductModal = ({
    onClose,
}: AddProductModalProps) => {

    const dispatch = useModalAddDispatch();
    const state = useModalAddState();

    const [selectedProduct, setSelectedProduct] =
        useState<IProduct[]>([]);
    const [searchMulti, setSearchMulti] =
        useState<string>("");
    const [openMulti, setOpenMulti] =
        useState<boolean>(false);


    const handleAddProduct = (e: MouseEvent<HTMLButtonElement>) => {
        const purchasedOrderProducts: IPartialPurchasedOrderProduct[] =
            selectedProduct.map((product) => {
                return {
                    qty: 1,
                    product_id: product.id,
                    product: product,
                    product_name: product.name,
                    was_price_edited_manually: null,
                    original_price: product?.sale_price ?? 0,
                    recorded_price: product?.sale_price ?? 0,
                }
            });

        dispatch(add_purchase_order_products(purchasedOrderProducts));
        onClose(e);
    }

    const fetchProductsLike = async (query: string): Promise<IProduct[]> => {
        if (!query || query.trim().length === 0) return [];

        const purchaseOrderProducts = state.data.purchase_order_products?.map(p => p.product_id) ?? [];
        const encodedQuery = encodeURIComponent(query);

        try {
            const response = await fetch(`http://localhost:3003/products/products/filter-exclude/${encodedQuery}`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ excludeIds: purchaseOrderProducts }), 
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const products: IProduct[] = await response.json();
            console.log(products);
            return products;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    return (
        <div className={styleModule.container}>
            <section className={styleModule.bodySection}>
                <h2 className={`nunito-semibold ${styleModule.bodySectionH2}`}>Productos</h2>
                <MultiSelectSearchCheck<IProduct>
                    rowId="name"
                    search={searchMulti}
                    setSearch={setSearchMulti}
                    open={openMulti}
                    setOpen={setOpenMulti}
                    emptyMessage="No hay productos"
                    labelSelect="Productos seleccionados"
                    labelSearch="Buscar productos"
                    icon={<Search size={16} />}
                    placeholder="Buscar productos..."
                    classNameDropDownSelectItemInput={styleModule.selectSearchMultiCheckDropDownSelectItemInput}
                    classNameContainer={styleModule.selectSearchMultiCheckContainer}
                    classNameInputContainer={styleModule.selectSearchMultiCheckInputContainer}
                    classNameDropDown={styleModule.selectSearchMultiCheckDropDown}
                    classNameDropDownSelect={styleModule.selectSearchMultiCheckDropDownSelect}
                    classNameButtonInput={styleModule.selectSearchMultiCheckButtonInput}
                    classNameInput={`nunito-semibold ${styleModule.selectSearchMultiCheckInput}`}
                    classNameDropDownSelectItemSelected={`nunito-semibold ${styleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
                    classNameDropDownSearch={styleModule.selectSearchMultiCheckDropDownSearch}
                    classNameDropDownSearchItem={`nunito-semibold ${styleModule.selectSearchMultiCheckDropDownSearchItem}`}
                    classNameSeparator={styleModule.selectSearchMultiCheckSeparator}
                    classNameDropDownHeader={`nunito-bold ${styleModule.selectSearchMultiCheckDropDownHeader}`}
                    classNameEmptyMessage={`nunito-semibold ${styleModule.selectSearchMultiCheckEmptyMessage}`}
                    loadOptions={fetchProductsLike}
                    selected={selectedProduct}
                    setSelected={setSelectedProduct}
                />
            </section>
            <section className={styleModule.footerSection}>
                <FadeButton
                    label="Cancelar"
                    type="button"
                    typeOrderIcon="first"
                    icon={<CircleX className={styleModule.cancelButtonIcon} />}
                    onClick={onClose}
                    classNameButton={styleModule.cancelButton}
                    classNameLabel={styleModule.cancelButtonLabel}
                    classNameSpan={styleModule.cancelButtonSpan}
                />
                <FadeButton
                    label="Agregar Producto"
                    type="button"
                    typeOrderIcon="first"
                    icon={<Plus className={styleModule.addProductButtonIcon} />}
                    onClick={handleAddProduct}
                    classNameButton={styleModule.addProductButton}
                    classNameLabel={styleModule.addProductButtonLabel}
                    classNameSpan={styleModule.addProductButtonSpan}
                />
            </section>
        </div >
    );
};

export default AddProductModal;
